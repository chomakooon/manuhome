import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useBrandTheme } from './sites/useBrandTheme';

// NOTE: TopPage は src/pages/public/TopPage.jsx に温存。/ は KataribinLayout + KataribinHomePage に置換済み（Step 2-D）
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
// NOTE: PetPage は src/pages/public/PetPage.jsx に温存。/pet は PAWS PRESS LP に置き換え済み
const NetworkingPage = lazy(() => import('./pages/public/NetworkingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const LinksPage = lazy(() => import('./pages/public/LinksPage'));
const IntakePage = lazy(() => import('./pages/public/IntakePage'));
const DiagnosticPage = lazy(() => import('./pages/public/DiagnosticPage'));
const ThanksPage = lazy(() => import('./pages/client/ThanksPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const PortfolioSubCategoryPage = lazy(() => import('./pages/public/PortfolioSubCategoryPage'));
const OrderPage = lazy(() => import('./pages/public/OrderPage'));
const OrderFlowPage = lazy(() => import('./pages/order/OrderFlowPage'));
const OrderSuccessPage = lazy(() => import('./pages/order/OrderSuccessPage'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminOrderListPage = lazy(() => import('./pages/admin/AdminOrderListPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));

// ── PAWS PRESS (Step 2-B / 2-C) ──
const PawsPressLayout = lazy(() => import('./sites/pawspress/layout/PawsPressLayout'));
const PawsPressHomePage = lazy(() => import('./sites/pawspress/pages/PawsPressHomePage'));
const PawsPressOrderPage = lazy(() => import('./sites/pawspress/pages/PawsPressOrderPage'));
const PawsPressContactPage = lazy(() => import('./sites/pawspress/pages/PawsPressContactPage'));

// ── Kataribin (Step 2-D) ──
const KataribinLayout = lazy(() => import('./sites/kataribin/layout/KataribinLayout'));
const KataribinHomePage = lazy(() => import('./sites/kataribin/pages/KataribinHomePage'));

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
        <Route path="/networking" element={<Layout><NetworkingPage /></Layout>} />
        <Route path="/about" element={<KataribinLayout><AboutPage /></KataribinLayout>} />
        <Route path="/portfolio" element={<KataribinLayout><PortfolioPage /></KataribinLayout>} />
        <Route path="/portfolio/:subCategory" element={<KataribinLayout><PortfolioSubCategoryPage /></KataribinLayout>} />
        <Route path="/links" element={<KataribinLayout><LinksPage /></KataribinLayout>} />
        <Route path="/diagnostic" element={<KataribinLayout><DiagnosticPage /></KataribinLayout>} />
        <Route path="/intake" element={<KataribinLayout><IntakePage /></KataribinLayout>} />
        <Route path="/thanks" element={<Layout hideStickyCTA><ThanksPage /></Layout>} />

        {/* ── Order Flow ── */}
        <Route path="/order" element={<Layout hideStickyCTA><OrderPage /></Layout>} />
        <Route path="/order/flow/:templateId" element={<Layout hideStickyCTA><OrderFlowPage /></Layout>} />
        <Route path="/order/success" element={<Layout hideStickyCTA><OrderSuccessPage /></Layout>} />

        {/* ── PAWS PRESS (Step 2-B / 2-C) ── */}
        <Route path="/pet" element={<PawsPressLayout><PawsPressHomePage /></PawsPressLayout>} />
        <Route path="/pet/order" element={<PawsPressLayout><PawsPressOrderPage /></PawsPressLayout>} />
        <Route path="/pet/contact" element={<PawsPressLayout><PawsPressContactPage /></PawsPressLayout>} />

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
      <AppRoutes />
    </BrowserRouter>
  );
}
