import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useBrandTheme } from './sites/useBrandTheme';
import { GUIDE_LINKS } from './sites/pawspress/data/guideLinks';

/**
 * ルート遷移時にページ上部へスクロール。
 * hash が含まれる場合は各ページ側のアンカースクロール (例: /pet#plans) を
 * 優先するため、ここでは何もしない。
 *
 * 実装上の注意:
 *   - ブラウザの自動スクロール復元 (history.scrollRestoration='auto') が
 *     SPA 遷移後に前ページのスクロール位置を上書きすることがあるため、
 *     'manual' に設定して抑制する
 *   - lazy/Suspense と組み合わせると useEffect 直後の scrollTo より
 *     後で新ページの paint が走り、scroll が上書きされるケースがある。
 *     requestAnimationFrame で次フレームに繰り越して確実に上書きする
 *   - behavior:'instant' は新仕様で一部環境で無視されるため、
 *     位置引数版 scrollTo(0, 0) を使う
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // ブラウザの自動スクロール復元を抑制（マウント時1回）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) return;
    // 同期 + 次フレームの二段構えで確実に最上部へ
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  return null;
}
// NOTE: 旧 Layout / Header / Footer / StickyCTA は src/components/layout/ に温存。
// Phase 5 ですべてのルートが KataribinLayout / PawsPressLayout / AdminLayout に移行済み。
// 万が一の参照用に物理ファイルは残置（次フェーズで削除可能）。

// NOTE: TopPage は src/pages/public/TopPage.jsx に温存。/ は KataribinLayout + KataribinHomePage に置換済み（Step 2-D）
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
// NOTE: PetPage は src/pages/public/PetPage.jsx に温存。/pet は PAWS PRESS LP に置き換え済み
// NOTE: 旧 AboutPage（新聞風） は src/pages/public/AboutPage.jsx に温存。
// Phase 12 でプロフィール強化版 KataribinAboutPage に差し替え済み。
// 物理ファイルを残しているのは、必要時に App.jsx のルートを差し戻すだけで復元できるようにするため。
const LinksPage = lazy(() => import('./pages/public/LinksPage'));
const IntakePage = lazy(() => import('./pages/public/IntakePage'));
const DiagnosticPage = lazy(() => import('./pages/public/DiagnosticPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const PortfolioSubCategoryPage = lazy(() => import('./pages/public/PortfolioSubCategoryPage'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminOrderListPage = lazy(() => import('./pages/admin/AdminOrderListPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));

// ── PAWS PRESS (Step 2-B / 2-C) ──
const PawsPressLayout = lazy(() => import('./sites/pawspress/layout/PawsPressLayout'));
const PawsPressHomePage = lazy(() => import('./sites/pawspress/pages/PawsPressHomePage'));
const PawsPressOrderPage = lazy(() => import('./sites/pawspress/pages/PawsPressOrderPage'));
const PawsPressContactPage = lazy(() => import('./sites/pawspress/pages/PawsPressContactPage'));
const PawsPressGuidePage = lazy(() => import('./sites/pawspress/pages/PawsPressGuidePage'));
const PawsPressGalleryPage = lazy(() => import('./sites/pawspress/pages/PawsPressGalleryPage'));

// ── Kataribin (Step 2-D / Phase 3 / Phase 12) ──
const KataribinLayout = lazy(() => import('./sites/kataribin/layout/KataribinLayout'));
const KataribinHomePage = lazy(() => import('./sites/kataribin/pages/KataribinHomePage'));
const KataribinAboutPage = lazy(() => import('./sites/kataribin/pages/KataribinAboutPage'));
const PricingPage = lazy(() => import('./sites/kataribin/pages/PricingPage'));
const FlowPage = lazy(() => import('./sites/kataribin/pages/FlowPage'));
const ContactPage = lazy(() => import('./sites/kataribin/pages/ContactPage'));

function RouteFallback() {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      読み込み中...
    </div>
  );
}

function AppRoutes() {
  useBrandTheme();
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ── Public Pages (kataribin) ── */}
        <Route path="/" element={<KataribinLayout><KataribinHomePage /></KataribinLayout>} />
        <Route path="/services" element={<KataribinLayout><ServicesPage /></KataribinLayout>} />
        <Route path="/about" element={<KataribinLayout><KataribinAboutPage /></KataribinLayout>} />
        <Route path="/portfolio" element={<KataribinLayout><PortfolioPage /></KataribinLayout>} />
        <Route path="/portfolio/:subCategory" element={<KataribinLayout><PortfolioSubCategoryPage /></KataribinLayout>} />
        <Route path="/links" element={<KataribinLayout><LinksPage /></KataribinLayout>} />
        <Route path="/diagnostic" element={<KataribinLayout><DiagnosticPage /></KataribinLayout>} />
        <Route path="/intake" element={<KataribinLayout><IntakePage /></KataribinLayout>} />
        <Route path="/pricing" element={<KataribinLayout><PricingPage /></KataribinLayout>} />
        <Route path="/flow" element={<KataribinLayout><FlowPage /></KataribinLayout>} />
        <Route path="/contact" element={<KataribinLayout><ContactPage /></KataribinLayout>} />

        {/* ── PAWS PRESS (Step 2-B / 2-C) ── */}
        <Route path="/pet" element={<PawsPressLayout><PawsPressHomePage /></PawsPressLayout>} />
        <Route path="/pet/order" element={<PawsPressLayout><PawsPressOrderPage /></PawsPressLayout>} />
        <Route path="/pet/contact" element={<PawsPressLayout><PawsPressContactPage /></PawsPressLayout>} />
        <Route path="/pet/gallery" element={<PawsPressLayout><PawsPressGalleryPage /></PawsPressLayout>} />

        {/* ── PAWS PRESS ご利用ガイド（暫定プレースホルダ。順次本実装に差し替え）── */}
        {GUIDE_LINKS.map((g) => (
          <Route
            key={g.to}
            path={g.to}
            element={<PawsPressLayout><PawsPressGuidePage /></PawsPressLayout>}
          />
        ))}

        {/* ── Admin OS Dashboard ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
