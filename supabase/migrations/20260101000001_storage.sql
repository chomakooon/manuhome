-- storage bucket (already applied to remote as 000001)
insert into storage.buckets (id, name, public) values ('project-files','project-files',true) on conflict (id) do nothing;
