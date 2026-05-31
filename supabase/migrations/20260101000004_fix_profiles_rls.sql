-- profiles RLS の無限再帰を修正
-- 原因: "Creators can view tenant profiles" ポリシーが profiles を自己参照し
--       infinite recursion (42P17) になっていた。fetchProfile が500で返らず
--       ログインが永久にスタックする。
--
-- 対策: 再帰するポリシーを削除し、「自分の行は自分で読める」シンプルな形にする。
--       creator が他人のprofileを見る必要が出たら、SECURITY DEFINER関数経由にする。

DROP POLICY IF EXISTS "Creators can view tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 自分の行のみ参照・更新可（auth.uid() = id は再帰しない）
CREATE POLICY "Own profile select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Own profile update" ON profiles
  FOR UPDATE USING (auth.uid() = id);
