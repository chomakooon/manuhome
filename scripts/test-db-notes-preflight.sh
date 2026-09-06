#!/usr/bin/env bash
set -euo pipefail

# Called by test-db.sh while its isolated DB still has the legacy notes columns.
# Never accept the name of a developer's or production database container.
container_name="${1:?An isolated test container is required}"
case "$container_name" in
  manuhome-db-test-*) ;;
  *) printf 'Expected a manuhome-db-test-* container.\n' >&2; exit 1 ;;
esac
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_dir="$(mktemp -d)"
trap 'rm -rf "$output_dir"' EXIT
migration="$repo_dir/supabase/migrations/20260906000002_private_internal_notes.sql"
awk '
  /^### 内部メモ移行前の列実在確認$/ { section_found = 1 }
  section_found && /^```sql$/ { in_sql = 1; next }
  in_sql && /^```$/ { exit }
  in_sql { print }
' "$repo_dir/docs/security-release.md" > "$output_dir/documented-preflight.sql"
if [[ ! -s "$output_dir/documented-preflight.sql" ]]; then
  printf 'The documented internal-notes preflight SQL was not found.\n' >&2
  exit 1
fi

verify_documented_query() {
  local actual
  actual="$(docker exec -i "$container_name" psql -X -At -U postgres -d "$1" -v ON_ERROR_STOP=1 \
    < "$output_dir/documented-preflight.sql")"
  if [[ "$actual" != "$2" ]]; then
    printf 'Unexpected documented preflight result for %s:\n%s\n' "$1" "$actual" >&2
    exit 1
  fi
  printf 'PASS: documented internal-notes preflight reports %s correctly\n' "$3"
}

verify_documented_query postgres $'orders|t|text\nprojects|t|text' 'both source columns present'

snapshot() {
  # Recent pg_dump versions emit random psql restriction keys. Normalize only
  # those transport markers; compare all schema, grants, and data unchanged.
  docker exec "$container_name" pg_dump -U postgres -d "$1" \
    | sed -E '/^\\(un)?restrict /d'
}

for scenario in orders projects both; do
  database_name="notes_preflight_$scenario"
  docker exec "$container_name" createdb -U postgres --template=postgres "$database_name"
  case "$scenario" in
    orders) missing_tables=(orders); expected_columns='orders.notes' ;;
    projects) missing_tables=(projects); expected_columns='projects.notes' ;;
    both) missing_tables=(orders projects); expected_columns='orders.notes, projects.notes' ;;
  esac
  for table_name in "${missing_tables[@]}"; do
    docker exec "$container_name" psql -X -U postgres -d "$database_name" -v ON_ERROR_STOP=1 \
      -c "ALTER TABLE public.$table_name DROP COLUMN notes;" >/dev/null
  done
  case "$scenario" in
    orders) expected_query=$'orders|f|\nprojects|t|text' ;;
    projects) expected_query=$'orders|t|text\nprojects|f|' ;;
    both) expected_query=$'orders|f|\nprojects|f|' ;;
  esac
  verify_documented_query "$database_name" "$expected_query" "missing $expected_columns"
  snapshot "$database_name" > "$output_dir/before.sql"
  if docker exec -i "$container_name" psql -X -U postgres -d "$database_name" -v ON_ERROR_STOP=1 \
    < "$migration" > "$output_dir/migration.log" 2>&1; then
    printf 'Migration unexpectedly succeeded with missing %s.\n' "$expected_columns" >&2
    exit 1
  fi
  case "$(cat "$output_dir/migration.log")" in
    *"Internal notes migration requires source columns: $expected_columns"*) ;;
    *) cat "$output_dir/migration.log" >&2; printf 'Expected explicit missing-column error.\n' >&2; exit 1 ;;
  esac
  case "$(cat "$output_dir/migration.log")" in
    *'CREATE TABLE'*) printf 'Migration created tables before checking source columns.\n' >&2; exit 1 ;;
  esac
  printf 'PASS: internal-notes preflight rejects missing %s before table creation\n' "$expected_columns"
  snapshot "$database_name" > "$output_dir/after.sql"
  diff -u "$output_dir/before.sql" "$output_dir/after.sql"
  printf 'PASS: failed internal-notes migration leaves %s schema and data unchanged\n' "$scenario"
  docker exec "$container_name" dropdb -U postgres "$database_name"
done
