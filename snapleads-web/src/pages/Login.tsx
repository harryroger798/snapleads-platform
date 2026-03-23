import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import SnapLeadsLogo from "../components/SnapLeadsLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const t = {
    bg: isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50",
    card: isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-lg",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    input: isDark ? "bg-slate-900/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
    label: isDark ? "text-slate-300" : "text-slate-700",
    themeBtn: isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-400" : "bg-white border-slate-200 text-slate-600 shadow-sm",
    eyeBtn: isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Redirect based on role from token
      const token = sessionStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/login"); // Only super_admin can access the portal
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4 relative`}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2.5 rounded-xl border ${t.themeBtn} transition`}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SnapLeadsLogo size={64} />
          </div>
          <h1 className={`text-2xl font-bold ${t.textPrimary}`}>SnapLeads</h1>
          <p className={`${t.textSecondary} mt-1`}>License Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className={`backdrop-blur border ${t.card} rounded-2xl p-8 shadow-xl`}>
          <h2 className={`text-xl font-semibold ${t.textPrimary} mb-6`}>Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition`}
                placeholder="admin@snapleads.store"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition pr-10`}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.eyeBtn} transition`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
