import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import Marketplace from "./pages/Marketplace";
import CartPage from "./pages/CartPage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import BuyerOrderDashboard from "./pages/BuyerOrderDashboard";
import NotFound from "./pages/NotFound";
import LiveTruckTracker from "./pages/LiveTruckTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <BrowserRouter future={{ v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/cart" element={<CartPage />} />

                {/* ✅ DASHBOARD */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* ✅ TRACKER */}
                <Route path="/live-tracker/:id" element={<LiveTruckTracker />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Login />;
  return user.role === 'farmer' ? <Dashboard /> : <BuyerOrderDashboard />;
};

export default App;