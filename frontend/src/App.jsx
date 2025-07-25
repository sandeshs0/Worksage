// OAuth pre-processor (must be first import)
import "./utils/oauthPreProcessor";

import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import { XSSProtectionProvider } from "./utils/xssHOC.jsx";

import { Toaster } from "sonner";
import { UserProvider, useUser } from "./context/UserContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
// Admin route protection
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useUser();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Import debug utilities for development
import "./utils/authDebug";

// Dashboard pages
import BoardsPage from "./pages/BoardsPage";
import KanbanPage from "./pages/KanbanPage";
import ClientDetailsPage from "./pages/dashboard/ClientDetailsPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import HelpCenterPage from "./pages/dashboard/HelpCenterPage";
import InboxPage from "./pages/dashboard/InboxPage";
import OverviewPage from "./pages/dashboard/OverviewPage";
import ProjectDetailsPage from "./pages/dashboard/ProjectDetailsPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PaymentCallbackPage from "./pages/payments/PaymentCallbackPage";
// Auth guard for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes */}
        <Route
          path="/OAuthCallback"
          element={
            location.search.includes("accessToken=") ? (
              <GoogleAuthCallback />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<OtpVerificationPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Admin dashboard route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/payment-callback" element={<PaymentCallbackPage />} />
          <Route path="boards" element={<BoardsPage />} />
          <Route path="boards/:boardId" element={<KanbanPage />} />
        </Route>

        {/* 404 route */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <XSSProtectionProvider
      enabled={true}
      sanitizationLevel="strict"
      enableValidation={true}
      logAttempts={true}
    >
      <UserProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </UserProvider>
    </XSSProtectionProvider>
  );
}

export default App;
