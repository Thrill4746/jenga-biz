
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
// Auth page removed - use EnhancedAuthDialog in pages
import NotFound from "./pages/NotFound";
import PasswordReset from "./pages/PasswordReset";
import Register from './pages/Register';
import Templates from "./pages/Templates";
import Strategy from "./pages/Strategy";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import BillingReturn from "./pages/BillingReturn";
import UserDashboard from "./components/UserDashboard";
import SaaSFeatures from "./components/SaaSFeatures";
import { HubProvider } from '@/contexts/HubContext';
import { HubContextProvider } from '@/hooks/useHubContext';
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import { ServiceWorkerUpdater } from "./components/ServiceWorkerUpdater";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ServiceWorkerUpdater />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/register" element={<Register />} />
            <Route path="/templates" element={<ProtectedRoute allowedRoles={["entrepreneur","hub_manager","admin","super_admin"]}><Templates /></ProtectedRoute>} />
            <Route path="/strategy" element={<ProtectedRoute allowedRoles={["entrepreneur","hub_manager","admin","super_admin"]}><Strategy /></ProtectedRoute>} />
            <Route path="/strategies" element={<ProtectedRoute allowedRoles={["entrepreneur","hub_manager","admin","super_admin"]}><Strategy /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/billing/return" element={<ProtectedRoute><BillingReturn /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["entrepreneur","hub_manager","admin","super_admin"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/saas" element={<ProtectedRoute allowedRoles={["hub_manager","admin","super_admin"]}><HubProvider><HubContextProvider><SaaSFeatures onSignOut={() => {}} /></HubContextProvider></HubProvider></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/b2c" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
