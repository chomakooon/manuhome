-- 管理画面(AdminOrderList/Detail)が参照するカラムを orders に追加し、
-- status の制約を管理ワークフロー用の値に拡張する。
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sns_link TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS usage TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- status制約を拡張（既存のpending/paid等 + 管理ワークフローのnew/quote/in_progress/revision/done）
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','paid','failed','refunded','new','quote','in_progress','revision','done'));

-- 管理画面(creator)が orders を更新できるRLSポリシー（閲覧は既存のcreatorポリシーがある）
DROP POLICY IF EXISTS "Creators can update orders" ON orders;
CREATE POLICY "Creators can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = orders.tenant_id)
  );
