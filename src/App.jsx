import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public pages
import TopPage from './pages/public/TopPage';
import ServicesPage from './pages/public/ServicesPage';
import PetPage from './pages/public/PetPage';
import NetworkingPage from './pages/public/NetworkingPage';
import AboutPage from './pages/public/AboutPage';
import LinksPage from './pages/public/LinksPage';
import IntakePage from './pages/public/IntakePage';
import DiagnosticPage from './pages/public/DiagnosticPage';
import ThanksPage from './pages/client/ThanksPage';
import PortfolioPage from './pages/public/PortfolioPage';
import PortfolioSubCategoryPage from './pages/public/PortfolioSubCategoryPage';
import OrderPage from './pages/public/OrderPage';

// Order flow (legacy)
import OrderFlowPage from './pages/order/OrderFlowPage';
import OrderSuccessPage from './pages/order/OrderSuccessPage';

// Auth
import LoginPage from './pages/client/LoginPage';

// Client portal
import ProjectListPage from './pages/client/ProjectListPage';
import ProjectRoomPage from './pages/client/ProjectRoomPage';

// Creator dashboard
import DashboardPage from './pages/creator/DashboardPage';
import DashProjectsPage from './pages/creator/DashProjectsPage';
import DashProjectDetailPage from './pages/creator/DashProjectDetailPage';

// Admin Dashboard
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/order/success" element={<Layout hideStickyCTA><OrderSuccessPage /></Layout>} />

          {/* ── Auth ── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Client Portal (protected) ── */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <Layout hideStickyCTA><ProjectListPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <Layout hideStickyCTA><ProjectRoomPage /></Layout>
            </ProtectedRoute>
          } />

          {/* ── Creator Dashboard (protected, creator-only) ── */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<DashProjectsPage />} />
            <Route path="projects/:id" element={<DashProjectDetailPage />} />
          </Route>

          {/* ── Admin OS Dashboard ── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrderListPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
