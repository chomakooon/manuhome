-- handle_new_user トリガーの堅牢化
-- 原因: profiles INSERT が失敗すると auth.users 作成ごとロールバックされ
--       「Database error creating new user」になる。
-- 対策: search_path を明示し、例外を握りつぶしてユーザー作成は必ず成功させる。
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, '00000000-0000-0000-0000-000000000000'::UUID)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- profiles 作成に失敗してもユーザー作成自体は通す（後から修復可能）
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
