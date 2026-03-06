import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  KeyRound, Users, BarChart3, Plus, Search, XCircle, CheckCircle,
  LogOut, Copy, TrendingUp, UserPlus, Sun, Moon, PackageOpen
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import SnapLeadsLogo from "../components/SnapLeadsLogo";

interface Stats {
  total_keys: number;
  active_keys: number;
  starter_keys: number;
  pro_keys: number;
  revenue_usd: number;
  revenue_inr: number;
  sub_resellers?: number;
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

interface SubReseller {
  id: string;
  email: string;
  name: string;
  status: string;
  total_keys: number;
  created_at: string;
}

type Tab = "overview" | "keys" | "generate" | "sub-resellers";

export default function ResellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [_keysTotal, setKeysTotal] = useState(0);
  const [keysPage, setKeysPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [subResellers, setSubResellers] = useState<SubReseller[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Generate form
  const [genPlan, setGenPlan] = useState("starter");
  const [genCycle, setGenCycle] = useState("monthly");
  const [genQty, setGenQty] = useState(1);
  const [genEmail, setGenEmail] = useState("");
  const [genName, setGenName] = useState("");
  const [generatedKeys, setGeneratedKeys] = useState<Array<{ key: string; plan: string; billing_cycle: string }>>([]);

  // Sub-reseller form
  const [srName, setSrName] = useState("");
  const [srEmail, setSrEmail] = useState("");
  const [srPassword, setSrPassword] = useState("");
  const [showSrForm, setShowSrForm] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const isMasterReseller = user?.role === "master_reseller";

  const loadStats = useCallback(async () => {
    try { setStats(await api.resellerStats()); } catch { /* ignore */ }
  }, []);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.resellerListKeys({ page: keysPage, search: searchQuery });
      setKeys(data.keys);
      setKeysTotal(data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [keysPage, searchQuery]);

  const loadSubResellers = useCallback(async () => {
    try { const data = await api.resellerListSubResellers(); setSubResellers(data.resellers); } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === "keys") loadKeys(); }, [tab, loadKeys]);
  useEffect(() => { if (tab === "sub-resellers") loadSubResellers(); }, [tab, loadSubResellers]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form state before submitting (Fix 9: form state sync)
    const validPlans = ["starter", "pro"];
    const validCycles = ["monthly", "yearly", "lifetime"];
    const plan = validPlans.includes(genPlan) ? genPlan : "starter";
    const cycle = validCycles.includes(genCycle) ? genCycle : "monthly";
    setLoading(true);
    try {
      const res = await api.resellerGenerateKeys({
        plan, billing_cycle: cycle, quantity: genQty,
        assigned_to_email: genEmail, assigned_to_name: genName,
      });
      setGeneratedKeys(res.keys);
      setMessage(`Generated ${res.count} key(s) successfully`);
      loadStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to generate keys");
    }
    setLoading(false);
  };

  const handleCreateSubReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.resellerCreateSubReseller({ email: srEmail, password: srPassword, name: srName });
      setMessage("Sub-reseller created successfully");
      setShowSrForm(false);
      setSrName(""); setSrEmail(""); setSrPassword("");
      await loadSubResellers();
      await loadStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied!");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : "N/A";
  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const tabs: Array<[Tab, string, typeof BarChart3]> = [
    ["overview", "Overview", BarChart3],
    ["keys", "License Keys", KeyRound],
    ["generate", "Generate Keys", Plus],
  ];
  if (isMasterReseller) tabs.push(["sub-resellers", "Sub-Resellers", Users]);

  return (
    <div className="dash-bg min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <header className="dash-header border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SnapLeadsLogo size={36} />
            <div>
              <h1 className="text-lg font-bold text-white dash-text-primary">SnapLeads Reseller</h1>
              <p className="text-xs text-slate-400 dash-text-muted">{user?.name} &middot; {isMasterReseller ? "Master Reseller" : "Reseller"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg dash-card bg-slate-800/50 border border-slate-700/50 text-slate-400 dash-text-secondary hover:text-white transition" title={isDark ? "Light mode" : "Dark mode"}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 dash-text-secondary hover:text-white transition text-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-indigo-300 text-sm flex items-center justify-between">
            {message}
            <button onClick={() => setMessage("")}><XCircle className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === id ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Keys", value: stats.total_keys, icon: KeyRound, color: "from-indigo-500 to-blue-500" },
                { label: "Active Keys", value: stats.active_keys, icon: CheckCircle, color: "from-emerald-500 to-green-500" },
                { label: "Starter", value: stats.starter_keys, icon: KeyRound, color: "from-blue-500 to-cyan-500" },
                { label: "Pro", value: stats.pro_keys, icon: KeyRound, color: "from-purple-500 to-pink-500" },
              ].map((card) => (
                <div key={card.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-sm">{card.label}</span>
                    <div className={`w-8 h-8 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-slate-400 text-sm">Revenue</span></div>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue_usd)}</p>
                <p className="text-sm text-slate-500 mt-1">INR {(stats.revenue_inr / 100).toLocaleString()}</p>
              </div>
              {isMasterReseller && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-purple-400" /><span className="text-slate-400 text-sm">Sub-Resellers</span></div>
                  <p className="text-2xl font-bold text-white">{stats.sub_resellers || 0}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "keys" && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setKeysPage(1); }}
                placeholder="Search keys..." className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Key</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Assigned To</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Expires</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="px-4 py-3"><code className="text-sm text-purple-300 font-mono">{k.key}</code></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${k.plan === "pro" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>{k.plan.toUpperCase()}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${k.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{k.status}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-300">{k.assigned_to_name || k.assigned_to_email || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{formatDate(k.expires_at)}</td>
                      <td className="px-4 py-3"><button onClick={() => copyToClipboard(k.key)} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {keys.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-700/30 dash-card rounded-2xl flex items-center justify-center">
                        <PackageOpen className="w-8 h-8 text-slate-500 dash-text-muted" />
                      </div>
                      <div>
                        <p className="text-slate-400 dash-text-secondary font-medium">No keys found</p>
                        <p className="text-slate-500 dash-text-muted text-xs mt-1">Generate keys from the "Generate Keys" tab</p>
                      </div>
                    </div>
                  </td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "generate" && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleGenerate} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-purple-400" /> Generate Customer Keys</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan</label>
                  <select value={genPlan} onChange={(e) => setGenPlan(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="starter">Starter</option><option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Billing Cycle</label>
                  <select value={genCycle} onChange={(e) => setGenCycle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity (1-50)</label>
                <input type="number" min={1} max={50} value={genQty} onChange={(e) => setGenQty(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Name</label>
                  <input type="text" value={genName} onChange={(e) => setGenName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="Customer name" /></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Email</label>
                  <input type="email" value={genEmail} onChange={(e) => setGenEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="customer@email.com" /></div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/25">
                {loading ? "Generating..." : `Generate ${genQty} Key(s)`}
              </button>
            </form>
            {generatedKeys.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Generated Keys</h3>
                  <button onClick={() => copyToClipboard(generatedKeys.map(k => k.key).join("\n"))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 rounded-lg text-sm hover:bg-purple-600/30"><Copy className="w-4 h-4" /> Copy All</button>
                </div>
                <div className="space-y-2">
                  {generatedKeys.map((k, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <code className="text-purple-300 font-mono text-sm">{k.key}</code>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${k.plan === "pro" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>{k.plan.toUpperCase()}</span>
                      </div>
                      <button onClick={() => copyToClipboard(k.key)} className="text-slate-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "sub-resellers" && isMasterReseller && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Sub-Resellers ({subResellers.length})</h3>
              <button onClick={() => setShowSrForm(!showSrForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"><UserPlus className="w-4 h-4" /> {showSrForm ? "Cancel" : "Add"}</button>
            </div>
            {showSrForm && (
              <form onSubmit={handleCreateSubReseller} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                    <input type="text" value={srName} onChange={(e) => setSrName(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
                  <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                    <input type="email" value={srEmail} onChange={(e) => setSrEmail(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
                  <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <input type="password" value={srPassword} onChange={(e) => setSrPassword(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition hover:from-purple-500 hover:to-pink-500">Create</button>
              </form>
            )}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Keys</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr></thead>
                <tbody>
                  {subResellers.map((r) => (
                    <tr key={r.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-sm text-white">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{r.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{r.total_keys}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{r.status}</span></td>
                    </tr>
                  ))}
                  {subResellers.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-700/30 dash-card rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-500 dash-text-muted" />
                      </div>
                      <div>
                        <p className="text-slate-400 dash-text-secondary font-medium">No sub-resellers yet</p>
                        <p className="text-slate-500 dash-text-muted text-xs mt-1">Click "Add" to create your first sub-reseller</p>
                      </div>
                    </div>
                  </td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
