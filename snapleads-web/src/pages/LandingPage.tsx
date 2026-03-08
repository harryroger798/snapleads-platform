import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Zap, Shield, Check, ChevronDown, Menu, X, Star, Download, Users, Search, Send, Linkedin, AlertTriangle, TrendingUp, Mail, Phone, MapPin, MessageCircle, BarChart3, FileSpreadsheet, Bot, Layers } from 'lucide-react'

/* — COUNTER HOOK — */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!startOnView || !inView) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, startOnView, inView])

  return { count, ref }
}

/* — ANIMATIONS — */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

/* — GRADIENT TEXT STYLE — */
const gradientTextClass = "animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,#e2e8f0,#a5b4fc,#f8fafc,#818cf8,#e2e8f0)] bg-[length:200%_auto] bg-clip-text text-transparent"

/* — SECTION DIVIDER STYLE — */
const sectionBorderStyle = { borderImage: 'linear-gradient(to right, transparent, rgba(148,163,184,0.25), transparent) 1' }

/* — SECTION LABEL — */
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-400/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-400/50">
      <span className="inline-flex bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent text-sm font-medium">
        {children}
      </span>
    </div>
  )
}

/* — NAVBAR — */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="SnapLeads" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-sm tracking-wide text-white">SnapLeads</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#platforms" className="text-sm text-gray-400 hover:text-white transition-colors">Platforms</a>
          <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="#pricing" className="hidden md:inline-flex items-center gap-2 bg-gradient-to-t from-indigo-600 to-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
            Get Started <ArrowRight size={14} />
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 p-6 flex flex-col gap-4 md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Features</a>
            <a href="#platforms" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Platforms</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">FAQ</a>
            <a href="#pricing" className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-3 rounded-full">Get Started <ArrowRight size={14} /></a>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

/* — HERO — */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gray-950" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[800px]" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px]" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="inline-flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 px-4 py-1.5 rounded-full mb-8 text-sm">
            <Star size={14} className="text-indigo-400 fill-indigo-400" />
            <span className="text-indigo-200/80">#1 Lead Extraction Software 2026</span>
            <Star size={14} className="text-indigo-400 fill-indigo-400" />
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className={`text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight pb-5 ${gradientTextClass}`}>
          Extract Verified Leads From<br />Any Platform in Seconds
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="max-w-3xl mx-auto">
          <p className="text-lg text-indigo-200/65 mb-8">
            The most powerful desktop app for extracting emails, phones, and business data from 12+ social platforms and Google Maps. Zero proxies needed. Runs entirely on your machine.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#pricing" className="group inline-flex items-center gap-2 bg-gradient-to-t from-indigo-600 to-indigo-500 text-white text-sm font-medium px-7 py-3.5 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
            <span className="relative inline-flex items-center">
              Start Extracting Leads
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
          <a href="#features" className="inline-flex items-center gap-2 bg-gradient-to-b from-gray-800 to-gray-800/60 text-gray-300 text-sm font-medium px-7 py-3.5 rounded-full border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            See How It Works
          </a>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="relative mt-16 w-full max-w-4xl mx-auto z-10">
        <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-indigo-500/10">
          <img src="/images/3d-hero-dashboard.png" alt="SnapLeads Dashboard" className="w-full h-auto" style={{ mixBlendMode: 'lighten' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>
      </motion.div>

      <div className="w-full mt-16 overflow-hidden relative z-10">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 mx-6">
              {['LinkedIn', 'Facebook', 'Instagram', 'Reddit', 'Twitter/X', 'Google Maps', 'Telegram', 'WhatsApp', 'TikTok', 'YouTube'].map((name) => (
                <span key={`${i}-${name}`} className="text-sm text-gray-600 hover:text-indigo-400/60 transition-colors">{name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* — STATS — */
function Stats() {
  const s1 = useCountUp(10000, 2000)
  const s2 = useCountUp(12, 1500)
  const s3 = useCountUp(100, 1800)

  return (
    <section className="relative py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border-t border-b py-12 border-gray-800/50" style={sectionBorderStyle}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-4xl font-bold text-white mb-2"><span ref={s1.ref}>{s1.count.toLocaleString()}</span>+</div>
              <p className="text-indigo-200/50 text-sm">Leads extracted daily by users worldwide</p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-4xl font-bold text-white mb-2"><span ref={s2.ref}>{s2.count}</span>+</div>
              <p className="text-indigo-200/50 text-sm">Social platforms and data sources</p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-4xl font-bold text-white mb-2"><span ref={s3.ref}>{s3.count}</span>%</div>
              <p className="text-indigo-200/50 text-sm">Runs on your machine — zero infrastructure cost</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* — FEATURES — */
function Features() {
  const features = [
    { icon: <Mail size={20} />, title: 'Email & Phone Extraction', desc: 'Pull verified emails and phone numbers from LinkedIn profiles, Google Maps listings, Reddit threads, and 9 more platforms.' },
    { icon: <Shield size={20} />, title: 'Built-in Account Safety', desc: 'Advanced anti-detection with smart rate limiting, randomized behavior, and safety controls to keep your accounts protected.' },
    { icon: <Bot size={20} />, title: 'Multi-Engine Search', desc: 'Three extraction engines — Google Dorking, Direct Scraping, and API methods — for maximum coverage across platforms.' },
    { icon: <BarChart3 size={20} />, title: 'Real-Time Progress', desc: 'Watch leads pour in with live progress updates showing which platform and method is active during extraction.' },
    { icon: <FileSpreadsheet size={20} />, title: 'Export Anywhere', desc: 'Export to CSV, Excel, or push directly to HubSpot and Salesforce CRM. Built-in email verification included.' },
    { icon: <Layers size={20} />, title: 'Clean & Verify Results', desc: 'Pro users can clean results to filter out invalid data, verify emails, and ensure only accurate leads remain.' },
  ]

  return (
    <section id="features" className="relative py-20 px-4">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2 w-[760px] h-[668px] opacity-30" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-500/20 to-transparent blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center pb-12 max-w-3xl mx-auto">
            <motion.div variants={fadeUp}>
              <SectionLabel>Powerful Features</SectionLabel>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
              Everything you need to extract leads at scale
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-indigo-200/65">
              A single desktop application that replaces your entire lead generation stack. No APIs, no proxies, no monthly costs beyond your license.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center pb-12">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 max-w-4xl w-full">
              <img src="/images/3d-hero-dashboard.png" alt="SnapLeads Features" className="w-full h-auto" style={{ mixBlendMode: 'lighten' }} />
            </div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-14 md:gap-y-12">
            {features.map((f, i) => (
              <motion.article key={i} variants={fadeUp}>
                <div className="mb-3 text-indigo-400">{f.icon}</div>
                <h3 className="mb-1.5 text-base font-semibold text-gray-200">{f.title}</h3>
                <p className="text-indigo-200/65 text-sm leading-relaxed">{f.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* — HOW IT WORKS — */
function HowItWorks() {
  const steps = [
    { tag: 'Quick Setup', title: 'Download & Activate', desc: 'Install the desktop app on Windows, Mac, or Linux. Enter your license key and you are ready to extract leads in under 2 minutes.', icon: <Download size={20} />, img: '/images/3d-step-download.png' },
    { tag: 'Configure', title: 'Choose Platforms & Keywords', desc: 'Select from 12+ platforms. Configure your search keywords, filters, and extraction preferences. Enable all three search engines for maximum coverage.', icon: <Search size={20} />, img: '/images/3d-step-configure.png' },
    { tag: 'Extract', title: 'Get Verified Leads', desc: 'Hit start and watch leads pour in with real-time progress. Export to CSV, Excel, or push directly to HubSpot CRM. Clean results with one click.', icon: <Users size={20} />, img: '/images/3d-step-export.png' },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center pb-12 md:pb-20 max-w-3xl mx-auto">
          <motion.div variants={fadeUp}>
            <SectionLabel>Simple Workflow</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
            Three steps to unlimited leads
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-indigo-200/65">
            From installation to your first batch of leads in under 5 minutes. No technical skills required.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="group relative h-full overflow-hidden rounded-2xl bg-gray-800/40 p-px hover:bg-gray-800/60 transition-all duration-500"
            >
              <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-gradient-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                <div className="bg-gray-900/80 flex items-center justify-center p-6 h-56 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" style={{ mixBlendMode: 'lighten' }} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-gray-800/60 px-3 py-1 rounded-full text-xs font-medium border border-gray-700/30">
                      <span className="text-indigo-400">{s.icon}</span>
                      <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">{s.tag}</span>
                    </span>
                    <span className="text-indigo-400/60 text-xs font-medium">Step {i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">{s.title}</h3>
                  <p className="text-indigo-200/65 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* — PLATFORMS — */
function Platforms() {
  const platforms = [
    { name: 'Google Maps', desc: 'Extract business emails, phones, addresses, and ratings from any location or category.', icon: <MapPin size={20} />, stats: '50K+ businesses/day' },
    { name: 'LinkedIn', desc: 'Extract professional emails and profiles from search results, company pages, and groups.', icon: <Linkedin size={20} />, stats: '10K+ profiles/session' },
    { name: 'Reddit', desc: 'Find leads from subreddit discussions, comments, and user profiles across any niche.', icon: <Phone size={20} />, stats: '5K+ leads/query' },
    { name: 'Telegram', desc: 'Extract members and contact info from Telegram groups and channels.', icon: <Send size={20} />, stats: '500+ members/group' },
    { name: 'Instagram & Facebook', desc: 'Scrape business profiles, bio links, and contact information from social posts.', icon: <Users size={20} />, stats: '1K+ profiles/run' },
    { name: 'Twitter/X, TikTok, YouTube & More', desc: 'Extract from all major platforms with dedicated, safety-first extractors.', icon: <MessageCircle size={20} />, stats: '12+ platforms' },
  ]

  return (
    <section id="platforms" className="relative py-20 px-4">
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-40 -translate-x-[120%] opacity-30" aria-hidden="true">
        <div className="w-[760px] h-[668px] rounded-full bg-gradient-to-t from-indigo-500/15 to-transparent blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center pb-12 max-w-3xl mx-auto">
            <motion.div variants={fadeUp}>
              <SectionLabel>Platform Coverage</SectionLabel>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
              Extract leads from 12+ platforms
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-indigo-200/65">
              Each extractor is purpose-built with safety controls, smart rate limiting, and multi-engine search for maximum results.
            </motion.p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-800/50 p-6 hover:border-indigo-500/30 hover:bg-gray-800/50 transition-all duration-500">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-indigo-400 mt-0.5">{p.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-200 mb-1">{p.name}</h3>
                    <p className="text-indigo-200/50 text-xs font-medium">{p.stats}</p>
                  </div>
                </div>
                <p className="text-indigo-200/65 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* — PRICING — */
function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="text-center pb-8 max-w-3xl mx-auto">
            <motion.div variants={fadeUp}>
              <SectionLabel>Simple Pricing</SectionLabel>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
              Plans that scale with your needs
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-indigo-200/65">
              Choose the plan that fits. Upgrade anytime, cancel anytime. 14-day money-back guarantee.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-2 rounded-full">
              <AlertTriangle size={14} />
              <span>Launch Pricing — Prices Go Up Soon</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${annual ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>Annually</span>
            {annual && <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">Save 30%+</span>}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-800/50 hover:border-gray-700/60 transition-all duration-500">
              <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Starter</span>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-white">${annual ? '59' : '7'}</span>
                  <span className="text-gray-400 text-sm">/{annual ? 'year' : 'month'}</span>
                  <span className="text-gray-600 line-through text-sm">${annual ? '84' : '12'}</span>
                  <span className="bg-green-500/15 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full">{annual ? '30% OFF' : '42% OFF'}</span>
                </div>
                <p className="text-indigo-200/50 text-sm mb-6">Perfect for freelancers and small teams getting started with lead extraction.</p>
              </div>
              <div className="p-8 pt-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">What&apos;s included</div>
                {['5 social platforms (Reddit, Twitter, YouTube, Pinterest, Tumblr)', 'CSV export', 'Email verification', '100 leads per extraction', '10 extractions/month', 'Desktop app (Win/Mac/Linux)'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className="group flex items-center justify-center gap-2 w-full bg-gradient-to-t from-indigo-600 to-indigo-500 text-white text-sm font-medium px-6 py-3 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 mt-6">
                  Get Starter <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </motion.div>

            {/* Pro */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gray-800/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-500">
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>
              <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-indigo-400 fill-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">Pro</span>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-white">${annual ? '169' : '19'}</span>
                  <span className="text-gray-400 text-sm">/{annual ? 'year' : 'month'}</span>
                  <span className="text-gray-600 line-through text-sm">${annual ? '228' : '29'}</span>
                  <span className="bg-green-500/15 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full">{annual ? '26% OFF' : '34% OFF'}</span>
                </div>
                <p className="text-indigo-200/50 text-sm mb-6">For teams and agencies that need full platform access and automation.</p>
              </div>
              <div className="p-8 pt-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Everything in Starter, plus</div>
                {['All 12+ platforms + Google Maps', 'Scheduled automated extractions', 'Email outreach campaigns', 'HubSpot & Salesforce CRM export', 'Telegram + WhatsApp extractors', 'Website email finder', 'Unlimited leads per extraction', 'Priority support & updates'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className="group flex items-center justify-center gap-2 w-full bg-gradient-to-t from-indigo-600 to-indigo-500 text-white text-sm font-medium px-6 py-3 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 mt-6">
                  Get Pro <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Lifetime Deal */}
          <motion.div variants={fadeUp} className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800/50 via-indigo-900/20 to-gray-800/50 border border-indigo-500/20 p-8">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 rounded-bl-xl">LIMITED TIME</div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-medium text-indigo-300 mb-2">Lifetime Deal — Pay Once, Use Forever</h3>
                <p className="text-indigo-200/50 text-sm">No subscriptions. Includes all future updates and new features forever.</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-gray-500 line-through text-sm">$168</div>
                  <div className="text-3xl font-bold text-white">$99</div>
                  <span className="bg-red-500/15 text-red-400 text-[10px] font-medium px-2 py-0.5 rounded-full">41% OFF</span>
                  <div className="text-gray-500 text-[10px] mt-1">Starter Lifetime</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 line-through text-sm">$456</div>
                  <div className="text-3xl font-bold text-white">$249</div>
                  <span className="bg-red-500/15 text-red-400 text-[10px] font-medium px-2 py-0.5 rounded-full">45% OFF</span>
                  <div className="text-gray-500 text-[10px] mt-1">Pro Lifetime</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <TrendingUp size={14} className="text-indigo-400" />
              <span className="text-indigo-200/50 text-xs">Only <span className="text-indigo-300 font-semibold">47 lifetime keys</span> remaining — then this offer is gone forever</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4 text-center">
            <p className="text-indigo-200/40 text-xs">14-Day Money-Back Guarantee — No Questions Asked</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* — TESTIMONIALS — */
function Testimonials() {
  const testimonials = [
    { quote: 'SnapLeads replaced 3 separate tools for us. The Google Maps extractor alone saved us 20 hours per week of manual prospecting.', name: 'Marcus Rodriguez', title: 'CEO at LeadFlow Agency', img: '/images/testimonial-1.jpg' },
    { quote: 'The account safety features are incredible. We have been running extractions for 6 months with zero issues. This is the real deal.', name: 'James Chen', title: 'Growth Lead at TechScale', img: '/images/testimonial-2.jpg' },
    { quote: 'From extraction to outreach in one tool — we closed $50K in new business in the first month using SnapLeads Pro.', name: 'David Park', title: 'Founder at CloudReach', img: '/images/testimonial-3.jpg' },
  ]
  const [active, setActive] = useState(0)

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <div className="text-center max-w-3xl mx-auto pb-12">
            <SectionLabel>What Users Say</SectionLabel>
            <h2 className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
              Trusted by thousands of professionals
            </h2>
            <p className="text-lg text-indigo-200/65">
              Sales teams, marketers, agencies, and founders use SnapLeads to build their pipeline faster.
            </p>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <div className="relative bg-gray-800/30 border border-gray-800/50 rounded-2xl p-8 md:p-12">
              <svg className="absolute top-6 left-8 text-indigo-500/20" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11.3 2.5c-1 .2-2 .6-2.8 1.2C7 5 6 7 6 9.5c0 1.5.3 2.8.8 4 .5 1.1 1.2 2 2.2 2.7 1 .7 2.2 1 3.5 1h.5V14h-.5c-1.2 0-2-.4-2.5-1.2-.4-.7-.7-1.6-.7-2.8h3V2.5H11.3zm8.2 0c-1 .2-2 .6-2.8 1.2-1.5 1.3-2.5 3.3-2.5 5.8 0 1.5.3 2.8.8 4 .5 1.1 1.2 2 2.2 2.7 1 .7 2.2 1 3.5 1h.5V14h-.5c-1.2 0-2-.4-2.5-1.2-.4-.7-.7-1.6-.7-2.8h3V2.5h-1z" /></svg>

              <p className="text-xl md:text-2xl font-medium text-gray-200 leading-relaxed mb-8 relative z-10">
                &ldquo;{testimonials[active].quote}&rdquo;
              </p>

              <div>
                <img src={testimonials[active].img} alt={testimonials[active].name} className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-indigo-500/30" />
                <p className="font-semibold text-white text-sm">{testimonials[active].name}</p>
                <p className="text-indigo-200/50 text-xs">{testimonials[active].title}</p>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-indigo-500 w-8' : 'bg-gray-700 w-2 hover:bg-gray-600'}`} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* — FAQ — */
function FAQ() {
  const faqs = [
    { q: 'Is SnapLeads really that affordable?', a: 'Yes! Our Starter plan is just $7/month. We believe powerful lead extraction should not cost hundreds. Your license gives you full access to the desktop app with no hidden costs, no API fees, and no proxy charges.' },
    { q: 'Will my accounts get banned using SnapLeads?', a: 'We have built enterprise-grade account safety: smart rate limiting, randomized behavior patterns, and built-in safety controls. In 6+ months of testing, zero bans reported.' },
    { q: 'What platforms can I extract leads from?', a: 'LinkedIn, Facebook, Instagram, Reddit, Twitter/X, TikTok, YouTube, Google Maps, Telegram, WhatsApp, and more. Pro plan includes all platforms; Starter includes 5 core platforms.' },
    { q: 'Does it work on Windows, Mac, and Linux?', a: 'Yes! SnapLeads works on all three platforms. Download the installer for your OS and you are ready in under 2 minutes.' },
    { q: 'Can I export leads to my CRM?', a: 'Pro plan includes direct HubSpot and Salesforce CRM integration. All plans support CSV and Excel export. We are adding more CRM integrations based on user demand.' },
    { q: 'What if I do not like it? Is there a refund?', a: 'We offer a 14-day money-back guarantee on all plans. If SnapLeads does not meet your needs, we will refund you — no questions asked.' },
  ]

  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="text-center pb-12">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className={`text-3xl md:text-4xl font-semibold pb-4 ${gradientTextClass}`}>
                Frequently asked questions
              </h2>
              <p className="text-lg text-indigo-200/65">Everything you need to know before getting started.</p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="rounded-xl border border-gray-800/50 overflow-hidden bg-gray-800/20 hover:bg-gray-800/30 transition-colors">
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                    <span className="font-medium text-sm text-gray-200 pr-4">{faq.q}</span>
                    <ChevronDown size={18} className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }} className="px-5 pb-5">
                      <p className="text-indigo-200/65 text-sm leading-relaxed border-t border-gray-800/50 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* — CTA — */
function FinalCTA() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2" aria-hidden="true">
        <div className="w-[760px] h-[668px] rounded-full bg-gradient-to-t from-indigo-500/15 to-transparent blur-3xl" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-r from-transparent via-gray-800/50 to-transparent py-12 md:py-16 rounded-2xl">
          <h2 className={`text-3xl md:text-4xl font-semibold pb-8 ${gradientTextClass}`}>
            Ready to supercharge your lead generation?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="group inline-flex items-center gap-2 bg-gradient-to-t from-indigo-600 to-indigo-500 text-white text-sm font-medium px-7 py-3.5 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
              <span className="relative inline-flex items-center">
                Download SnapLeads
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
            <a href="#features" className="inline-flex items-center gap-2 bg-gradient-to-b from-gray-800 to-gray-800/60 text-gray-300 text-sm font-medium px-7 py-3.5 rounded-full border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              Schedule Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* — FOOTER — */
function Footer() {
  return (
    <footer className="py-12 px-4 border-t" style={sectionBorderStyle}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Product</h6>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Platforms', href: '#platforms' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Download', href: '#pricing' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
          <div>
            <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Support</h6>
            {[
              { label: 'FAQ', href: '#faq' },
              { label: 'Contact', href: 'mailto:support@getsnapleads.store' },
              { label: 'Documentation', href: '#faq' },
              { label: 'Changelog', href: '#features' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
          <div>
            <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Legal</h6>
            {[
              { label: 'Privacy Policy', href: '#privacy' },
              { label: 'Terms of Service', href: '#terms' },
              { label: 'Refund Policy', href: '#faq' },
              { label: 'License Agreement', href: '#license' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
          <div>
            <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Connect</h6>
            {[
              { label: 'X (Twitter)', href: 'https://x.com' },
              { label: 'Facebook', href: 'https://facebook.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="SnapLeads" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-sm text-white">SnapLeads</span>
          </div>
          <p className="text-gray-600 text-xs">&copy; 2026 SnapLeads. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/* — LANDING PAGE — */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Platforms />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
