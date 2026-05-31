-- 管理画面から問い合わせのステータス(new/read/replied)を更新できるようにする。
-- creator ロールの認証ユーザーのみ更新可。
DROP POLICY IF EXISTS "Creators can update contacts" ON contacts;
CREATE POLICY "Creators can update contacts" ON contacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator')
  );
