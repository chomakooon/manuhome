-- お問い合わせ保存テーブル（contact/intake/pet-contact 共通）
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  source TEXT NOT NULL DEFAULT 'contact',   -- 'kataribin-contact' | 'intake' | 'pawspress-contact'
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,        -- 添付ファイル名・カテゴリ・プラン等の付随情報
  status TEXT DEFAULT 'new',                 -- 'new' | 'read' | 'replied'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 書き込みは Edge Function (service role) のみ。匿名クライアントからの直接INSERTは許可しない。
-- 閲覧は管理画面（認証済みcreator）に限定する想定。ここではまずRLSを有効化し、
-- service role（RLSバイパス）経由の書き込みのみを通す。
CREATE POLICY "Authenticated can read contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');
