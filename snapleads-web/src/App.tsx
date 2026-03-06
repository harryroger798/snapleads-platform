import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LifetimePage from "./pages/LifetimePage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResellerDashboard from "./pages/ResellerDashboard";

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!roles.includes(payload.role)) return <Navigate to="/login" />;
    return <>{children}</>;
  } catch {
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lifetime" element={<LifetimePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute roles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/reseller" element={<ProtectedRoute roles={["master_reseller", "reseller"]}><ResellerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
