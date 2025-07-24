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

import { Toaster } from "sonner";
import { UserProvider } from "./context/UserContext";
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
// Auth guard for protected routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;

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
            location.search.includes("token=") ? (
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
    <UserProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
