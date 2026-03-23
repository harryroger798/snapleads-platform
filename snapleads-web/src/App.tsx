import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

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
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute roles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
