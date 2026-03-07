import { Link } from "react-router-dom";
import {
  Zap, Check, Shield, Globe, Star, Monitor, Apple, Terminal,
  Infinity
} from "lucide-react";

export default function LifetimePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">SnapLeads</span>
          </div>
          <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm mb-6">
          <Infinity className="w-4 h-4" /> Limited Time Lifetime Deals
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Pay Once,<br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Use Forever</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Get lifetime access to SnapLeads with a single payment. No recurring fees. Free updates forever.
        </p>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Lifetime */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-1">Starter Lifetime</h3>
            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-slate-400">one-time</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">INR 7,999 one-time</p>
            </div>
            <p className="text-emerald-400 text-sm mb-6">Save over $85 vs yearly renewal</p>
            <ul className="space-y-3 mb-8">
              {[
                "5 Platforms (Reddit, Twitter, YouTube, Pinterest, Tumblr)",
                "10 extractions/month",
                "100 leads per extraction",
                "CSV export",
                "10 email verifications/day",
                "Basic duplicate detection",
                "2 device activations",
                "Works 100% offline",
                "Free updates forever",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href="#download" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-center transition">
              Get Starter Lifetime
            </a>
          </div>

          {/* Pro Lifetime */}
          <div className="relative bg-slate-800/50 border border-amber-500/50 ring-2 ring-amber-500/20 rounded-2xl p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">BEST VALUE</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Pro Lifetime</h3>
            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$249</span>
                <span className="text-slate-400">one-time</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">INR 19,999 one-time</p>
            </div>
            <p className="text-emerald-400 text-sm mb-6">Save over $228 vs yearly renewal for 2 years</p>
            <ul className="space-y-3 mb-8">
              {[
                "All 12 platforms + Google Maps",
                "Unlimited extractions",
                "Unlimited leads per extraction",
                "CSV, Excel, JSON, HTML export",
                "Unlimited email verifications",
                "Scheduled extractions",
                "Email outreach & CRM export",
                "Lead scoring & proxy support",
                "Advanced duplicate detection",
                "Telegram & WhatsApp scraping",
                "2 device activations",
                "Works 100% offline",
                "Free updates forever",
                "Priority support",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href="#download" className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl font-medium text-center transition shadow-lg shadow-amber-500/25">
              Get Pro Lifetime
            </a>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> <span className="text-sm">Secure License System</span></div>
            <div className="flex items-center gap-2"><Globe className="w-5 h-5" /> <span className="text-sm">Works Offline</span></div>
            <div className="flex items-center gap-2"><Star className="w-5 h-5" /> <span className="text-sm">Free Updates Forever</span></div>
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Download SnapLeads</h2>
          <p className="text-slate-400 mb-8">Get started immediately after purchase</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://snapleads-installers.s3.us-east-1.amazonaws.com/v2.0.0/SnapLeads-Setup-2.0.0.exe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Monitor className="w-6 h-6 text-blue-400" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">Windows</p></div>
            </a>
            <a href="https://snapleads-installers.s3.us-east-1.amazonaws.com/v2.0.0/SnapLeads-2.0.0-mac.zip" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Apple className="w-6 h-6 text-slate-300" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">macOS</p></div>
            </a>
            <a href="https://snapleads-installers.s3.us-east-1.amazonaws.com/v2.0.0/SnapLeads-2.0.0.AppImage" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Terminal className="w-6 h-6 text-orange-400" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">Linux</p></div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-400">SnapLeads &copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition">Terms</a>
            <a href="mailto:support@getsnapleads.store" className="text-sm text-slate-500 hover:text-slate-300 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
