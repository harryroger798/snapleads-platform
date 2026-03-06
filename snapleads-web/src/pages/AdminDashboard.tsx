import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, Users, BarChart3, Plus, Search, XCircle, CheckCircle,
  LogOut, Copy, Download, RefreshCw, UserPlus,
  TrendingUp, Clock, AlertTriangle, Sun, Moon, PackageOpen
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import SnapLeadsLogo from "../components/SnapLeadsLogo";

interface Stats {
  total_keys: number;
  active_keys: number;
  expired_keys: number;
  revoked_keys: number;
  starter_keys: number;
  pro_keys: number;
  total_activations: number;
  keys_expiring_7d: number;
  keys_expiring_30d: number;
  revenue_usd: number;
  revenue_inr: number;
  master_resellers: number;
  resellers: number;
}

interface LicenseKey {
  id: string;
  key: string;
  plan: string;
  billing_cycle: string;
  status: string;
  max_activations: number;
  current_activations: number;
  assigned_to_email: string;
  assigned_to_name: string;
  expires_at: string;
  created_at: string;
}

interface Reseller {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  total_keys: number;
  created_at: string;
}

type Tab = "overview" | "keys" | "generate" | "resellers";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [keysTotal, setKeysTotal] = useState(0);
  const [keysPage, setKeysPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate form
  const [genPlan, setGenPlan] = useState("starter");
  const [genCycle, setGenCycle] = useState("monthly");
  const [genQty, setGenQty] = useState(1);
  const [genEmail, setGenEmail] = useState("");
  const [genName, setGenName] = useState("");
  const [genNotes, setGenNotes] = useState("");
  const [generatedKeys, setGeneratedKeys] = useState<Array<{ key: string; plan: string; billing_cycle: string; expires_at: string }>>([]);

  // Reseller form
  const [resName, setResName] = useState("");
  const [resEmail, setResEmail] = useState("");
  const [resPassword, setResPassword] = useState("");
  const [resRole, setResRole] = useState("master_reseller");
  const [showResForm, setShowResForm] = useState(false);

  const [message, setMessage] = useState("");
  const { isDark, toggleTheme } = useTheme();

  // Theme-conditional classes
  const t = {
    bg: isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50",
    header: isDark ? "bg-slate-900/50 border-slate-700/50" : "bg-white/90 border-slate-200 shadow-sm",
    card: isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm",
    cardInner: isDark ? "bg-slate-900/50" : "bg-slate-50",
    input: isDark ? "bg-slate-900/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
    selectInput: isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-300" : "bg-white border-slate-300 text-slate-700",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textMuted: isDark ? "text-slate-500" : "text-slate-500",
    tabBg: isDark ? "bg-slate-800/50" : "bg-slate-100",
    tabInactive: isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900",
    border: isDark ? "border-slate-700/50" : "border-slate-200",
    borderLight: isDark ? "border-slate-700/30" : "border-slate-100",
    rowHover: isDark ? "hover:bg-slate-700/20" : "hover:bg-slate-50",
    progressBg: isDark ? "bg-slate-700" : "bg-slate-200",
    btnSecondary: isDark ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
    themeBtn: isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600",
    logoutBtn: isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900",
    label: isDark ? "text-slate-300" : "text-slate-700",
    codeText: isDark ? "text-indigo-300" : "text-indigo-600",
    msgBg: isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await api.adminStats();
      setStats(data);
    } catch { /* ignore */ }
  }, []);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminListKeys({ page: keysPage, plan: filterPlan, status: filterStatus, search: searchQuery });
      setKeys(data.keys);
      setKeysTotal(data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [keysPage, filterPlan, filterStatus, searchQuery]);

  const loadResellers = useCallback(async () => {
    try {
      const data = await api.adminListResellers();
      setResellers(data.resellers);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === "keys") loadKeys(); }, [tab, loadKeys]);
  useEffect(() => { if (tab === "resellers") loadResellers(); }, [tab, loadResellers]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.adminGenerateKeys({
        plan: genPlan, billing_cycle: genCycle, quantity: genQty,
        assigned_to_email: genEmail, assigned_to_name: genName, notes: genNotes,
      });
      setGeneratedKeys(res.keys);
      setMessage(`Generated ${res.count} key(s) successfully`);
      loadStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to generate keys");
    }
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this license key?")) return;
    try {
      await api.adminRevokeKey(id);
      loadKeys();
      loadStats();
    } catch { /* ignore */ }
  };

  const handleReactivate = async (id: string) => {
    try {
      await api.adminReactivateKey(id);
      loadKeys();
      loadStats();
    } catch { /* ignore */ }
  };

  const handleCreateReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateReseller({ email: resEmail, password: resPassword, name: resName, role: resRole });
      setMessage("Reseller created successfully");
      setShowResForm(false);
      setResName(""); setResEmail(""); setResPassword("");
      await loadResellers();
      await loadStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create reseller");
    }
  };

  const handleSuspendReseller = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await api.adminUpdateReseller(id, { status: newStatus });
      loadResellers();
    } catch { /* ignore */ }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  const exportKeys = () => {
    const csv = "Key,Plan,Cycle,Status,Expires,Assigned To\n" +
      keys.map(k => `${k.key},${k.plan},${k.billing_cycle},${k.status},${k.expires_at},${k.assigned_to_name || k.assigned_to_email}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "license-keys.csv"; a.click();
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : "N/A";
  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  return (
    <div className={`min-h-screen ${t.bg}`}>
      {/* Header */}
      <header className={`border-b ${t.header} backdrop-blur sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SnapLeadsLogo size={36} />
            <div>
              <h1 className={`text-lg font-bold ${t.textPrimary}`}>SnapLeads Admin</h1>
              <p className={`text-xs ${t.textMuted}`}>{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-lg border ${t.themeBtn} transition`} title={isDark ? "Light mode" : "Dark mode"}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className={`flex items-center gap-2 ${t.logoutBtn} transition text-sm`}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className={`${t.msgBg} border rounded-lg p-3 text-sm flex items-center justify-between`}>
            {message}
            <button onClick={() => setMessage("")} className="text-indigo-400 hover:text-white"><XCircle className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`flex gap-1 ${t.tabBg} rounded-xl p-1 w-fit`}>
          {([
            ["overview", "Overview", BarChart3],
            ["keys", "License Keys", KeyRound],
            ["generate", "Generate Keys", Plus],
            ["resellers", "Resellers", Users],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === id ? "bg-indigo-600 text-white shadow" : t.tabInactive
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Keys", value: stats.total_keys, icon: KeyRound, color: "from-indigo-500 to-blue-500" },
                { label: "Active Keys", value: stats.active_keys, icon: CheckCircle, color: "from-emerald-500 to-green-500" },
                { label: "Expired", value: stats.expired_keys, icon: Clock, color: "from-amber-500 to-orange-500" },
                { label: "Revoked", value: stats.revoked_keys, icon: XCircle, color: "from-red-500 to-rose-500" },
              ].map((card) => (
                <div key={card.label} className={`${t.card} rounded-xl p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${t.textSecondary} text-sm`}>{card.label}</span>
                    <div className={`w-8 h-8 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${t.textPrimary}`}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${t.card} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className={`${t.textSecondary} text-sm`}>Total Revenue</span>
                </div>
                <p className={`text-2xl font-bold ${t.textPrimary}`}>{formatCurrency(stats.revenue_usd)}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>INR {(stats.revenue_inr / 100).toLocaleString()}</p>
              </div>
              <div className={`${t.card} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className={`${t.textSecondary} text-sm`}>Activations</span>
                </div>
                <p className={`text-2xl font-bold ${t.textPrimary}`}>{stats.total_activations}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>{stats.master_resellers} master + {stats.resellers} resellers</p>
              </div>
              <div className={`${t.card} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className={`${t.textSecondary} text-sm`}>Expiring Soon</span>
                </div>
                <p className={`text-2xl font-bold ${t.textPrimary}`}>{stats.keys_expiring_7d}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>{stats.keys_expiring_30d} within 30 days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${t.card} rounded-xl p-5`}>
                <h3 className={`${t.textPrimary} font-medium mb-3`}>Plan Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${t.textSecondary}`}>Starter</span>
                      <span className={`${t.textPrimary} font-semibold ml-2`}>{stats.starter_keys}</span>
                    </div>
                    <div className={`h-2 ${t.progressBg} rounded-full overflow-hidden`}>
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.total_keys ? (stats.starter_keys / stats.total_keys) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${t.textSecondary}`}>Pro</span>
                      <span className={`${t.textPrimary} font-semibold ml-2`}>{stats.pro_keys}</span>
                    </div>
                    <div className={`h-2 ${t.progressBg} rounded-full overflow-hidden`}>
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.total_keys ? (stats.pro_keys / stats.total_keys) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${t.card} rounded-xl p-5`}>
                <h3 className={`${t.textPrimary} font-medium mb-3`}>Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTab("generate")} className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm hover:bg-indigo-600/30 transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Generate Keys
                  </button>
                  <button onClick={() => setTab("resellers")} className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm hover:bg-purple-600/30 transition flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Add Reseller
                  </button>
                  <button onClick={() => setTab("keys")} className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm hover:bg-emerald-600/30 transition flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> View All Keys
                  </button>
                  <button onClick={loadStats} className="p-3 bg-slate-600/20 border border-slate-500/30 rounded-lg text-slate-300 text-sm hover:bg-slate-600/30 transition flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KEYS TAB */}
        {tab === "keys" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setKeysPage(1); }}
                  placeholder="Search keys, emails, names..."
                  className={`w-full pl-10 pr-4 py-2.5 ${t.selectInput} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
                />
              </div>
              <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setKeysPage(1); }}
                className={`px-3 py-2.5 ${t.selectInput} border rounded-lg text-sm focus:outline-none`}>
                <option value="">All Plans</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
              </select>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setKeysPage(1); }}
                className={`px-3 py-2.5 ${t.selectInput} border rounded-lg text-sm focus:outline-none`}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
              <button onClick={exportKeys} className={`flex items-center gap-2 px-4 py-2.5 ${t.btnSecondary} rounded-lg text-sm transition`}>
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className={`${t.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${t.border}`}>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Key</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Plan</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Cycle</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Status</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Devices</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Assigned To</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Expires</th>
                      <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id} className={`border-b ${t.borderLight} ${t.rowHover} transition`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className={`text-sm ${t.codeText} font-mono`}>{k.key}</code>
                            <button onClick={() => copyToClipboard(k.key)} className="text-slate-500 hover:text-white transition">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${k.plan === "pro" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                            {k.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${t.textSecondary} capitalize`}>{k.billing_cycle}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            k.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                            k.status === "expired" ? "bg-amber-500/20 text-amber-300" :
                            "bg-red-500/20 text-red-300"
                          }`}>
                            {k.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${t.textSecondary}`}>{k.current_activations}/{k.max_activations}</td>
                        <td className={`px-4 py-3 text-sm ${t.textSecondary}`}>{k.assigned_to_name || k.assigned_to_email || "—"}</td>
                        <td className={`px-4 py-3 text-sm ${t.textSecondary}`}>{formatDate(k.expires_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {k.status === "active" ? (
                              <button onClick={() => handleRevoke(k.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition">
                                Revoke
                              </button>
                            ) : (
                              <button onClick={() => handleReactivate(k.id)} className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition">
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {keys.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No keys found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {keysTotal > 50 && (
                <div className={`flex items-center justify-between px-4 py-3 border-t ${t.border}`}>
                  <span className={`text-sm ${t.textSecondary}`}>Showing {keys.length} of {keysTotal}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setKeysPage(p => Math.max(1, p - 1))} disabled={keysPage === 1}
                      className={`px-3 py-1 text-sm ${t.btnSecondary} rounded disabled:opacity-50`}>Prev</button>
                    <button onClick={() => setKeysPage(p => p + 1)} disabled={keys.length < 50}
                      className={`px-3 py-1 text-sm ${t.btnSecondary} rounded disabled:opacity-50`}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GENERATE TAB */}
        {tab === "generate" && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleGenerate} className={`${t.card} rounded-xl p-6 space-y-5`}>
              <h3 className={`text-lg font-semibold ${t.textPrimary} flex items-center gap-2`}>
                <Plus className="w-5 h-5 text-indigo-400" /> Generate License Keys
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Plan</label>
                  <select value={genPlan} onChange={(e) => setGenPlan(e.target.value)}
                    className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Billing Cycle</label>
                  <select value={genCycle} onChange={(e) => setGenCycle(e.target.value)}
                    className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Quantity (1-100)</label>
                <input type="number" min={1} max={100} value={genQty} onChange={(e) => setGenQty(Number(e.target.value))}
                  className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Assign to Name (optional)</label>
                  <input type="text" value={genName} onChange={(e) => setGenName(e.target.value)}
                    className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    placeholder="Customer name" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Assign to Email (optional)</label>
                  <input type="email" value={genEmail} onChange={(e) => setGenEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    placeholder="customer@email.com" />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Notes (optional)</label>
                <textarea value={genNotes} onChange={(e) => setGenNotes(e.target.value)} rows={2}
                  className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                  placeholder="Internal notes..." />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                {loading ? "Generating..." : `Generate ${genQty} Key(s)`}
              </button>
            </form>

            {generatedKeys.length > 0 && (
              <div className={`${t.card} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${t.textPrimary}`}>Generated Keys</h3>
                  <button onClick={() => copyToClipboard(generatedKeys.map(k => k.key).join("\n"))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg text-sm hover:bg-indigo-600/30 transition">
                    <Copy className="w-4 h-4" /> Copy All
                  </button>
                </div>
                <div className="space-y-2">
                  {generatedKeys.map((k, i) => (
                    <div key={i} className={`flex items-center justify-between ${t.cardInner} rounded-lg p-3`}>
                      <div className="flex items-center gap-3">
                        <code className={`${t.codeText} font-mono text-sm`}>{k.key}</code>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${k.plan === "pro" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                          {k.plan.toUpperCase()}
                        </span>
                        <span className={`text-xs ${t.textMuted} capitalize`}>{k.billing_cycle}</span>
                      </div>
                      <button onClick={() => copyToClipboard(k.key)} className="text-slate-500 hover:text-white transition">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESELLERS TAB */}
        {tab === "resellers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${t.textPrimary}`}>Resellers ({resellers.length})</h3>
              <button onClick={() => setShowResForm(!showResForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition">
                <UserPlus className="w-4 h-4" /> {showResForm ? "Cancel" : "Add Reseller"}
              </button>
            </div>

            {showResForm && (
              <form onSubmit={handleCreateReseller} className={`${t.card} rounded-xl p-6 space-y-4`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Name</label>
                    <input type="text" value={resName} onChange={(e) => setResName(e.target.value)} required
                      className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Email</label>
                    <input type="email" value={resEmail} onChange={(e) => setResEmail(e.target.value)} required
                      className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Password</label>
                    <input type="password" value={resPassword} onChange={(e) => setResPassword(e.target.value)} required
                      className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${t.label} mb-1.5`}>Role</label>
                    <select value={resRole} onChange={(e) => setResRole(e.target.value)}
                      className={`w-full px-3 py-2.5 ${t.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}>
                      <option value="master_reseller">Master Reseller</option>
                      <option value="reseller">Reseller</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition hover:from-indigo-500 hover:to-purple-500">
                  Create Reseller
                </button>
              </form>
            )}

            <div className={`${t.card} rounded-xl overflow-hidden`}>
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${t.border}`}>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Name</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Email</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Role</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Keys</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Status</th>
                    <th className={`text-left px-4 py-3 text-xs font-medium ${t.textSecondary} uppercase`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((r) => (
                    <tr key={r.id} className={`border-b ${t.borderLight} ${t.rowHover} transition`}>
                      <td className={`px-4 py-3 text-sm ${t.textPrimary}`}>{r.name}</td>
                      <td className={`px-4 py-3 text-sm ${t.textSecondary}`}>{r.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.role === "master_reseller" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                          {r.role === "master_reseller" ? "Master" : "Reseller"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${t.textSecondary}`}>{r.total_keys}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleSuspendReseller(r.id, r.status)}
                          className={`px-2 py-1 text-xs rounded transition ${r.status === "active" ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"}`}>
                          {r.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {resellers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-700/30 dash-card rounded-2xl flex items-center justify-center">
                          <PackageOpen className="w-8 h-8 text-slate-500 dash-text-muted" />
                        </div>
                        <div>
                          <p className="text-slate-400 dash-text-secondary font-medium">No resellers yet</p>
                          <p className="text-slate-500 dash-text-muted text-xs mt-1">Click "Add Reseller" to create your first reseller account</p>
                        </div>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
