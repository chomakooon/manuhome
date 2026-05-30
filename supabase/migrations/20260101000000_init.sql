-- ========================================
-- 営業執事 (Sales Butler / Creator OS) — Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tenants ──
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Default Tenant (For initial setup before multi-tenant routing is fully built)
INSERT INTO tenants (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000000', 'Default Creator', 'default');

-- ── Profiles (extends Supabase auth.users) ──
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'creator')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, tenant_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, '00000000-0000-0000-0000-000000000000'::UUID)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Products ──
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  name TEXT NOT NULL,
  description TEXT,
  base_price INTEGER, -- Can be null if pricing is purely template-driven
  category TEXT,
  template_id TEXT, -- e.g., 'pet-illustration'
  template_schema JSONB, -- The snapshot of the JSON schema at creation time
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Orders ──
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  customer_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  amount INTEGER NOT NULL, -- in JPY
  tier_id TEXT, -- Added for Template System (e.g., PLAN_LIGHT)
  selected_options JSONB DEFAULT '[]', -- Added for Template System
  form_data JSONB DEFAULT '{}', -- Added for Template System (Step 2-6 captures)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  options JSONB DEFAULT '{}',
  asset_urls TEXT[] DEFAULT '{}',
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Projects ──
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'WAITING_ASSETS', 'IN_PRODUCTION', 'REVIEW', 'DELIVERED', 'CLOSED')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}', -- Added for Template System filtering
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Project Files ──
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT CHECK (file_type IN ('asset', 'delivery')),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Project Messages ──
CREATE TABLE project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Mailing List ──
CREATE TABLE mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  email TEXT NOT NULL,
  name TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- ── Row Level Security ──

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;

-- Tenants: publicly readable (needed for fetching creator info on public site)
CREATE POLICY "Tenants are publicly readable" ON tenants FOR SELECT USING (true);

-- Profiles: users read their own, creators read within their tenant
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Creators can view tenant profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles AS my_profile WHERE my_profile.id = auth.uid() AND my_profile.role = 'creator' AND my_profile.tenant_id = profiles.tenant_id)
);

-- Products: publicly readable (needed for order flow)
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);

-- Orders: customers see their own; creators see tenant orders
CREATE POLICY "Customers see own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Creators see tenant orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = orders.tenant_id)
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true); -- Allow anonymous inserts if needed for checkout, tighten later

-- Projects: customers see their own; creators see tenant projects and update
CREATE POLICY "Customers see own projects" ON projects FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Creators see tenant projects" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = projects.tenant_id)
);
CREATE POLICY "Creators can update projects" ON projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = projects.tenant_id)
);
CREATE POLICY "System can insert projects" ON projects FOR INSERT WITH CHECK (true);

-- Files: visible to project participants
CREATE POLICY "Project members see files" ON project_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_files.project_id
    AND (projects.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = projects.tenant_id))
  )
);
CREATE POLICY "Project members can upload files" ON project_files FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Messages: visible to project participants
CREATE POLICY "Project members see messages" ON project_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_messages.project_id
    AND (projects.customer_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = projects.tenant_id))
  )
);
CREATE POLICY "Project members can send messages" ON project_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Mailing list: creators only
CREATE POLICY "Creators manage mailing list" ON mailing_list FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'creator' AND tenant_id = mailing_list.tenant_id)
);

-- ── Seed initial products ──
INSERT INTO products (name, description, category, template_id) VALUES
  ('ペットイラスト制作', '大切なペットをイラストにします。3つのプランとオプションから選べます。', 'pet', 'pet-illustration');

-- ── Storage bucket ──
-- Run in Supabase Dashboard > Storage:
-- Create bucket: "project-files" (public/private depending on design, public for now with obfuscated paths)
