#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
container_name="manuhome-db-test-${RANDOM}-$$"
image_name="${MANUHOME_TEST_POSTGRES_IMAGE:-postgres:16}"
docker image inspect "$image_name" >/dev/null
cleanup() { docker rm -f "$container_name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# No host port, network, bind mount, persistent volume, or existing DB is used.
docker run --detach --rm --name "$container_name" --network none \
  --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust "$image_name" >/dev/null
for attempt in {1..60}; do
  if docker exec "$container_name" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi
  sleep 0.25
done
run_sql() { docker exec -i "$container_name" psql -X -U postgres -v ON_ERROR_STOP=1 < "$1"; }
run_sql "$repo_dir/supabase/tests/bootstrap.sql"
for migration in "$repo_dir"/supabase/migrations/202601*.sql; do run_sql "$migration"; done
run_sql "$repo_dir/supabase/tests/fixtures.sql"
run_sql "$repo_dir/supabase/tests/legacy_regressions.sql"
for migration in "$repo_dir"/supabase/migrations/*.sql; do
  case "$(basename "$migration")" in 202601*) continue ;; esac
  run_sql "$migration"
done
run_sql "$repo_dir/supabase/tests/security_regressions.sql"
run_sql "$repo_dir/supabase/tests/checkout_regressions.sql"
run_sql "$repo_dir/supabase/tests/coupon_regressions.sql"

# Separate DB sessions must share the same atomic budget and fulfillment lock.
concurrency_dir="$(mktemp -d)"
trap 'rm -rf "$concurrency_dir"; cleanup' EXIT
worker_pids=()
for attempt in {1..20}; do
  docker exec "$container_name" psql -X -qAt -U postgres -v ON_ERROR_STOP=1 \
    -c "SET ROLE service_role; SELECT public.consume_rate_limit('parallel', 'global', 5, 60);" \
    > "$concurrency_dir/rate-$attempt" &
  worker_pids+=("$!")
done
for worker_pid in "${worker_pids[@]}"; do wait "$worker_pid"; done
accepted_count="$(cat "$concurrency_dir"/rate-* | tr -cd 't' | wc -c | tr -d ' ')"
if [[ "$accepted_count" != 5 ]]; then
  printf 'Expected 5 admitted parallel requests, got %s\n' "$accepted_count" >&2
  exit 1
fi
worker_pids=()
for attempt in {1..10}; do
  docker exec "$container_name" psql -X -qAt -U postgres -v ON_ERROR_STOP=1 \
    -c "SET ROLE service_role; SELECT public.fulfill_checkout('evt_parallel_$attempt', 'cs_test_parallel', '20000000-0000-0000-0000-000000000005', 'pi_test_parallel', 7800, 'jpy');" \
    > "$concurrency_dir/payment-$attempt" &
  worker_pids+=("$!")
done
for worker_pid in "${worker_pids[@]}"; do wait "$worker_pid"; done
docker exec "$container_name" psql -X -U postgres -v ON_ERROR_STOP=1 \
  -c "SELECT test.assert((SELECT count(*) = 1 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000005'), 'parallel webhook delivery creates one project'); SELECT test.assert((SELECT count(*) = 10 FROM public.stripe_webhook_events WHERE order_id = '20000000-0000-0000-0000-000000000005'), 'all parallel payment events recorded');"
worker_pids=()
for attempt in {1..20}; do
  coupon_order_id="$(printf '60000000-0000-0000-0000-%012d' "$attempt")"
  docker exec "$container_name" psql -X -qAt -U postgres -v ON_ERROR_STOP=1 \
    -c "SET ROLE service_role; SELECT public.reserve_first_order_coupon('$coupon_order_id');" \
    > "$concurrency_dir/coupon-$attempt" &
  worker_pids+=("$!")
done
for worker_pid in "${worker_pids[@]}"; do wait "$worker_pid"; done
reserved_count="$(cat "$concurrency_dir"/coupon-* | tr -cd 't' | wc -c | tr -d ' ')"
if [[ "$reserved_count" != 1 ]]; then
  printf 'Expected 1 reserved coupon from parallel orders, got %s\n' "$reserved_count" >&2
  exit 1
fi
docker exec "$container_name" psql -X -U postgres -v ON_ERROR_STOP=1 \
  -c "SELECT test.assert((SELECT count(*) = 1 FROM public.first_order_coupon_reservations WHERE email = 'concurrent@example.invalid'), 'parallel introductory coupon requests reserve exactly one order');"
printf 'Database security, payment, and concurrency regression tests passed.\n'
