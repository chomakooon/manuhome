import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

const TopPage = lazy(() => import('./pages/public/TopPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const PetPage = lazy(() => import('./pages/public/PetPage'));
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

function RouteFallback() {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      読み込み中...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* ── Public Pages ── */}
            <Route path="/" element={<Layout><TopPage /></Layout>} />
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/pet" element={<Layout><PetPage /></Layout>} />
            <Route path="/networking" element={<Layout><NetworkingPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
            <Route path="/portfolio/:subCategory" element={<Layout><PortfolioSubCategoryPage /></Layout>} />
            <Route path="/links" element={<Layout><LinksPage /></Layout>} />
            <Route path="/diagnostic" element={<Layout><DiagnosticPage /></Layout>} />
            <Route path="/intake" element={<Layout hideStickyCTA><IntakePage /></Layout>} />
            <Route path="/thanks" element={<Layout hideStickyCTA><ThanksPage /></Layout>} />

            {/* ── Order Flow ── */}
            <Route path="/order" element={<Layout hideStickyCTA><OrderPage /></Layout>} />
            <Route path="/order/flow/:templateId" element={<Layout hideStickyCTA><OrderFlowPage /></Layout>} />
            <Route path="/order/success" element={<Layout hideStickyCTA><OrderSuccessPage /></Layout>} />

            {/* ── Admin OS Dashboard ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="orders" element={<AdminOrderListPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
  );
}
