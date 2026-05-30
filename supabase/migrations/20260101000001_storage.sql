-- project-files バケット（OrderFlowPage の素材アップロード用）
-- 公開読み取り（getPublicUrl で配信）、anon/authenticated の書き込みを許可
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

-- 公開読み取り
create policy "public read project-files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'project-files');

-- 注文フロー（未ログイン含む）からのアップロードを許可
create policy "anon upload project-files"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'project-files');
