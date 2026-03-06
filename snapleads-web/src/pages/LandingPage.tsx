import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Shield, Globe, Download, Check, ChevronDown, ChevronUp,
  Mail, Phone, MapPin, MessageCircle, Search, Calendar, BarChart3,
  Users, Star, ArrowRight, Monitor, Apple, Terminal
} from "lucide-react";

const FEATURES = [
  { icon: Globe, title: "12 Platforms", desc: "Extract from Reddit, Twitter, YouTube, LinkedIn, Facebook, Instagram, TikTok, Pinterest, Tumblr, Google Maps, Telegram, WhatsApp" },
  { icon: Mail, title: "Email Finder", desc: "Discover emails from any website using advanced crawling technology" },
  { icon: Phone, title: "Phone Extraction", desc: "Extract phone numbers alongside emails from all platforms" },
  { icon: MapPin, title: "Google Maps", desc: "Extract business leads with emails, phones, ratings, and addresses" },
  { icon: MessageCircle, title: "Telegram & WhatsApp", desc: "Scrape group members and contacts from messaging platforms" },
  { icon: Search, title: "MX Email Verification", desc: "Verify extracted emails in real-time using MX record validation" },
  { icon: Calendar, title: "Scheduled Extractions", desc: "Set up automated recurring extractions on your schedule" },
  { icon: BarChart3, title: "Lead Scoring", desc: "AI-powered scoring to prioritize your best leads automatically" },
  { icon: Shield, title: "Proxy Support", desc: "Built-in proxy rotation for safe, anonymous extraction" },
  { icon: Users, title: "CRM Export", desc: "One-click export to HubSpot and other popular CRMs" },
];

const FAQ = [
  { q: "Does SnapLeads work offline?", a: "Yes! Once your license is activated, SnapLeads works 100% offline. An internet connection is only needed for the initial activation and optional sync." },
  { q: "How many devices can I use?", a: "Each license key supports up to 2 device activations. You can deactivate a device and activate on a new one anytime." },
  { q: "What platforms are supported?", a: "Starter: Reddit, Twitter, YouTube, Pinterest, Tumblr. Pro: All 12 platforms including LinkedIn, Facebook, Instagram, TikTok, Google Maps, Telegram, and WhatsApp." },
  { q: "Is there a free trial?", a: "We don't offer a free trial, but our Starter plan is very affordable. All plans come with a 7-day money-back guarantee." },
  { q: "Can I upgrade later?", a: "Yes! You can upgrade from Starter to Pro anytime. Contact support and we'll generate a new Pro key for you." },
  { q: "What export formats are supported?", a: "Starter: CSV. Pro: CSV, Excel (XLSX), JSON, and HTML formats." },
];

interface PricingCardProps {
  plan: string;
  monthly: string;
  yearly: string;
  yearlyMonthly: string;
  savings: string;
  features: string[];
  popular?: boolean;
  cycle: "monthly" | "yearly";
}

function PricingCard({ plan, monthly, yearly, yearlyMonthly, savings, features, popular, cycle }: PricingCardProps) {
  return (
    <div className={`relative bg-slate-800/50 border rounded-2xl p-8 ${popular ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : "border-slate-700/50"}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</span>
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-1">{plan}</h3>
      <div className="mb-6">
        {cycle === "monthly" ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{monthly}</span>
            <span className="text-slate-400">/mo</span>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{yearly}</span>
              <span className="text-slate-400">/yr</span>
            </div>
            <p className="text-sm text-emerald-400 mt-1">{yearlyMonthly}/mo — Save {savings}</p>
          </div>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <a href="#download" className={`block w-full py-3 rounded-xl font-medium text-center transition ${
        popular
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
          : "bg-slate-700 hover:bg-slate-600 text-white"
      }`}>
        Get Started
      </a>
    </div>
  );
}

export default function LandingPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition hidden sm:block">Pricing</a>
            <a href="#faq" className="text-sm text-slate-400 hover:text-white transition hidden sm:block">FAQ</a>
            <a href="#download" className="text-sm text-slate-400 hover:text-white transition hidden sm:block">Download</a>
            <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm mb-6">
          <Star className="w-4 h-4" /> Extract Leads from 12+ Platforms
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Extract Emails & Phones<br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">From Any Platform</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Desktop app that extracts contact information from 12 social media platforms.
          Works offline. No API keys needed. One-time purchase available.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#download" className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-medium text-lg transition shadow-lg shadow-indigo-500/25 flex items-center gap-2">
            <Download className="w-5 h-5" /> Download Free Trial
          </a>
          <a href="#pricing" className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-lg transition flex items-center gap-2">
            View Pricing <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Extract Leads</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Powerful features packed into a lightweight desktop application</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:border-indigo-500/30 transition group">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-lg mb-8">Choose the plan that works for you. No hidden fees.</p>
          <div className="inline-flex items-center bg-slate-800/50 rounded-xl p-1">
            <button onClick={() => setCycle("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${cycle === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Monthly
            </button>
            <button onClick={() => setCycle("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition ${cycle === "yearly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Yearly <span className="text-emerald-400 text-xs ml-1">Save 28%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            plan="Starter"
            monthly="$7"
            yearly="$59"
            yearlyMonthly="$4.92"
            savings="28%"
            cycle={cycle}
            features={[
              "5 Platforms (Reddit, Twitter, YouTube, Pinterest, Tumblr)",
              "10 extractions/month",
              "100 leads per extraction",
              "CSV export",
              "10 email verifications/day",
              "Basic duplicate detection",
              "2 device activations",
              "Works offline",
            ]}
          />
          <PricingCard
            plan="Pro"
            monthly="$19"
            yearly="$169"
            yearlyMonthly="$14.08"
            savings="26%"
            cycle={cycle}
            popular
            features={[
              "All 12 platforms + Google Maps",
              "Unlimited extractions",
              "Unlimited leads",
              "CSV, Excel, JSON, HTML export",
              "Unlimited email verifications",
              "Scheduled extractions",
              "Email outreach & CRM export",
              "Lead scoring & proxy support",
              "Advanced duplicate detection",
              "2 device activations",
            ]}
          />
        </div>
      </section>

      {/* Download */}
      <section id="download" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Download SnapLeads</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Available for Windows, macOS, and Linux. Download and start extracting leads in minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Monitor className="w-6 h-6 text-blue-400" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">Windows</p></div>
            </a>
            <a href="#" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Apple className="w-6 h-6 text-slate-300" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">macOS</p></div>
            </a>
            <a href="#" className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition min-w-56">
              <Terminal className="w-6 h-6 text-orange-400" />
              <div className="text-left"><p className="text-xs text-slate-400">Download for</p><p className="font-semibold">Linux</p></div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="font-medium text-white">{item.q}</span>
                {openFaq === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
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
