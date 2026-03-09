import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Shield, Check, ChevronDown, Menu, X, Star, Users, Send, Linkedin, AlertTriangle, TrendingUp, Mail, Phone, MapPin, MessageCircle, BarChart3, FileSpreadsheet, Bot, Layers } from 'lucide-react'

/* ============================================================
   HOOKS
   ============================================================ */

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

/* Mouse position hook for spotlight effect */
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePosition
}

/* ============================================================
   SPOTLIGHT COMPONENT (Cruip-style mouse-tracking card glow)
   ============================================================ */

function Spotlight({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useMousePosition()
  const mouse = useRef({ x: 0, y: 0 })
  const containerSize = useRef({ w: 0, h: 0 })
  const [boxes, setBoxes] = useState<HTMLElement[]>([])

  useEffect(() => {
    if (containerRef.current) {
      setBoxes(Array.from(containerRef.current.children).map((el) => el as HTMLElement))
    }
  }, [])

  useEffect(() => {
    const initContainer = () => {
      if (containerRef.current) {
        containerSize.current.w = containerRef.current.offsetWidth
        containerSize.current.h = containerRef.current.offsetHeight
      }
    }
    initContainer()
    window.addEventListener('resize', initContainer)
    return () => window.removeEventListener('resize', initContainer)
  }, [boxes])

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const { w, h } = containerSize.current
      const x = mousePosition.x - rect.left
      const y = mousePosition.y - rect.top
      const inside = x < w && x > 0 && y < h && y > 0
      if (inside) {
        mouse.current.x = x
        mouse.current.y = y
        boxes.forEach((box) => {
          const boxX = -(box.getBoundingClientRect().left - rect.left) + mouse.current.x
          const boxY = -(box.getBoundingClientRect().top - rect.top) + mouse.current.y
          box.style.setProperty('--mouse-x', `${boxX}px`)
          box.style.setProperty('--mouse-y', `${boxY}px`)
        })
      }
    }
  }, [mousePosition, boxes])

  return (
    <div className={className} ref={containerRef}>
      {children}
    </div>
  )
}

/* ============================================================
   SHARED STYLES (matching Cruip Open PRO exactly)
   ============================================================ */

/* Animated gradient text - matches Cruip heading style */
const gradientTextClass = "animate-gradient bg-[linear-gradient(to_right,#e2e8f0,#a5b4fc,#f8fafc,#818cf8,#e2e8f0)] bg-[length:200%_auto] bg-clip-text text-transparent"

/* Section divider - gradient fade border */
const sectionBorderStyle = { borderImage: 'linear-gradient(to right, transparent, rgba(148,163,184,0.25), transparent) 1' }

/* Spotlight card class - Cruip mouse-tracking glow effect */
const spotlightCardClass = "group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"

/* Primary CTA button - Cruip style */
const primaryBtnClass = "btn group inline-flex items-center gap-2 bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white text-sm font-medium px-6 py-3 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.16)] hover:bg-[length:100%_150%] transition-all duration-300"

/* Secondary CTA button - Cruip style */
const secondaryBtnClass = "btn relative inline-flex items-center gap-2 bg-gradient-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] text-gray-300 text-sm font-medium px-6 py-3 rounded-full border border-gray-700/50 hover:border-gray-600/50 hover:bg-[length:100%_150%] transition-all duration-300"

/* ============================================================
   SECTION LABEL (Cruip style with gradient separator lines)
   ============================================================ */

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-200/50">
      <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent text-sm font-medium">
        {children}
      </span>
    </div>
  )
}

/* ============================================================
   PAGE ILLUSTRATION (Cruip-style ambient glow at top of page)
   ============================================================ */

function PageIllustration() {
  return (
    <>
      {/* Main page glow - indigo/purple ambient light at top */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/4" aria-hidden="true">
        <div className="w-[846px] h-[594px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,rgba(99,102,241,0.06)_40%,transparent_70%)]" />
          <div className="absolute top-20 left-20 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.12)_0%,transparent_70%)]" />
        </div>
      </div>
      {/* Secondary illustration - Cruip-style blurred shapes */}
      <div className="pointer-events-none absolute left-1/2 top-[400px] -z-10 -mt-20 -translate-x-full opacity-50" aria-hidden="true">
        <div className="w-[760px] h-[668px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(156,163,175,0.08)_0%,transparent_70%)] blur-2xl" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[440px] -z-10 -translate-x-1/3" aria-hidden="true">
        <div className="w-[760px] h-[668px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] blur-2xl" />
      </div>
    </>
  )
}

/* ============================================================
   BLURRED SHAPES (reusable ambient background shapes)
   ============================================================ */

function BlurredShape({ className = '', color = 'indigo' }: { className?: string; color?: 'indigo' | 'gray' }) {
  const bg = color === 'indigo'
    ? 'bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]'
    : 'bg-[radial-gradient(ellipse_at_center,rgba(156,163,175,0.08)_0%,transparent_70%)]'
  return (
    <div className={`pointer-events-none absolute -z-10 ${className}`} aria-hidden="true">
      <div className={`w-[760px] h-[668px] max-w-none ${bg} blur-2xl`} />
    </div>
  )
}

/* ============================================================
   NAVBAR
   ============================================================ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="SnapLeads" className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-sm tracking-wide text-white">SnapLeads</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Platforms', 'Pricing', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-indigo-200/65 hover:text-white transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="/login" className="hidden md:inline-flex text-sm text-indigo-200/65 hover:text-white transition-colors">Sign In</a>
          <a href="#pricing" className={`hidden md:inline-flex ${primaryBtnClass}`}>
            <span className="relative inline-flex items-center">
              Get Started
              <ArrowRight size={14} className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 p-6 flex flex-col gap-4 md:hidden">
              {['Features', 'Platforms', 'Pricing', 'FAQ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="text-sm text-indigo-200/65 hover:text-white">{item}</a>
              ))}
              <a href="#pricing" className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-3 rounded-full">Get Started <ArrowRight size={14} /></a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

/* ============================================================
   HERO SECTION (Cruip-style with page illustration, gradient text)
   ============================================================ */

function Hero() {
  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      {/* Page illustration background glow */}
      <PageIllustration />

      <div className="max-w-6xl mx-auto">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 px-4 py-1.5 rounded-full mb-8 text-sm">
                <Star size={14} className="text-indigo-400 fill-indigo-400" />
                <span className="text-indigo-200/80">#1 Lead Extraction Software 2026</span>
                <Star size={14} className="text-indigo-400 fill-indigo-400" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className={`pb-5 font-semibold text-4xl md:text-5xl lg:text-6xl ${gradientTextClass}`}
            >
              Extract Verified Leads From<br />Any Platform in Seconds
            </motion.h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mx-auto max-w-3xl">
              <p className="mb-8 text-xl text-indigo-200/65">
                The most powerful desktop app for extracting emails, phones, and business data from 12+ social platforms and Google Maps. Zero proxies needed.
              </p>

              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <a href="#pricing" className={primaryBtnClass}>
                    <span className="relative inline-flex items-center">
                      Start Extracting Leads
                      <ArrowRight size={16} className="ml-1.5 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <a href="#features" className={`${secondaryBtnClass} mt-4 sm:mt-0`}>
                    See How It Works
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Hero image - Cruip style with gradient overlay */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-indigo-500/10 bg-gray-900/80">
              {/* Shine animation line */}
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/3 h-px animate-shine bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
              </div>
              <img src="/images/3d-hero-dashboard.png" alt="SnapLeads Dashboard" className="w-full h-auto relative z-10" style={{ mixBlendMode: 'lighten' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-20" />
            </div>
          </motion.div>
        </div>

        {/* Platform logos marquee */}
        <div className="w-full overflow-hidden relative border-t py-8" style={sectionBorderStyle}>
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 mx-6">
                {['LinkedIn', 'Facebook', 'Instagram', 'Reddit', 'Twitter/X', 'Google Maps', 'Telegram', 'WhatsApp', 'TikTok', 'YouTube'].map((name) => (
                  <span key={`${i}-${name}`} className="text-sm font-medium text-gray-600 hover:text-indigo-400/60 transition-colors cursor-default">{name}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   STATS SECTION
   ============================================================ */

function Stats() {
  const s1 = useCountUp(10000, 2000)
  const s2 = useCountUp(12, 1500)
  const s3 = useCountUp(100, 1800)

  return (
    <section className="relative py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12" style={sectionBorderStyle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { ref: s1.ref, count: s1.count.toLocaleString(), suffix: '+', label: 'Leads extracted daily by users worldwide' },
              { ref: s2.ref, count: s2.count, suffix: '+', label: 'Social platforms and data sources' },
              { ref: s3.ref, count: s3.count, suffix: '%', label: 'Runs on your machine \u2014 zero infrastructure cost' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl font-bold text-white mb-2"><span ref={stat.ref}>{stat.count}</span>{stat.suffix}</div>
                <p className="text-indigo-200/50 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURES SECTION (Cruip-style with blurred shapes, icon grid)
   ============================================================ */

function Features() {
  const features = [
    { icon: <Mail size={20} />, title: 'Email & Phone Extraction', desc: 'Pull verified emails and phone numbers from LinkedIn profiles, Google Maps listings, Reddit threads, and 9 more platforms.' },
    { icon: <Shield size={20} />, title: 'Built-in Account Safety', desc: 'Advanced anti-detection with smart rate limiting, randomized behavior, and safety controls to keep your accounts protected.' },
    { icon: <Bot size={20} />, title: 'Multi-Engine Search', desc: 'Three extraction engines \u2014 Google Dorking, Direct Scraping, and API methods \u2014 for maximum coverage across platforms.' },
    { icon: <BarChart3 size={20} />, title: 'Real-Time Progress', desc: 'Watch leads pour in with live progress updates showing which platform and method is active during extraction.' },
    { icon: <FileSpreadsheet size={20} />, title: 'Export Anywhere', desc: 'Export to CSV, Excel, or push directly to HubSpot and Salesforce CRM. Built-in email verification included.' },
    { icon: <Layers size={20} />, title: 'Clean & Verify Results', desc: 'Pro users can clean results to filter out invalid data, verify emails, and ensure only accurate leads remain.' },
  ]

  return (
    <section id="features" className="relative py-12 px-4">
      {/* Blurred shapes - Cruip style */}
      <BlurredShape className="left-1/2 top-0 -mt-20 -translate-x-1/2" color="gray" />
      <BlurredShape className="bottom-0 left-1/2 -mb-80 -translate-x-[120%] opacity-50" color="indigo" />

      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-4 text-center md:pb-12">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent text-sm font-medium">
                Powerful Features
              </span>
            </div>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Everything you need to extract leads at scale
            </h2>
            <p className="text-lg text-indigo-200/65">
              A single desktop application that replaces your entire lead generation stack. No APIs, no proxies, no monthly costs beyond your license.
            </p>
          </div>

          {/* Features image */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center pb-4 md:pb-12">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 max-w-4xl w-full shadow-xl shadow-indigo-500/5">
              <img src="/images/3d-hero-dashboard.png" alt="SnapLeads Features" className="w-full h-auto max-w-none" style={{ mixBlendMode: 'lighten' }} />
            </div>
          </motion.div>

          {/* Feature grid - Cruip style with SVG icons */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.article key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="mb-3 fill-indigo-500 text-indigo-500">{f.icon}</div>
                <h3 className="mb-1 font-semibold text-[1rem] text-gray-200">{f.title}</h3>
                <p className="text-indigo-200/65">{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   HOW IT WORKS (Cruip-style Spotlight workflow cards)
   ============================================================ */

function HowItWorks() {
  const steps = [
    { tag: 'Quick Setup', title: 'Download & Activate', desc: 'Install the desktop app on Windows, Mac, or Linux. Enter your license key and you are ready to extract leads in under 2 minutes.', img: '/images/3d-step-download.png' },
    { tag: 'Configure', title: 'Choose Platforms & Keywords', desc: 'Select from 12+ platforms. Configure your search keywords, filters, and extraction preferences for maximum coverage.', img: '/images/3d-step-configure.png' },
    { tag: 'Extract', title: 'Get Verified Leads', desc: 'Hit start and watch leads pour in with real-time progress. Export to CSV, Excel, or push directly to HubSpot CRM.', img: '/images/3d-step-export.png' },
  ]

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent text-sm font-medium">
                Simple Workflow
              </span>
            </div>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Three steps to unlimited leads
            </h2>
            <p className="text-lg text-indigo-200/65">
              From installation to your first batch of leads in under 5 minutes. No technical skills required.
            </p>
          </div>

          {/* Spotlight workflow cards - Cruip style with mouse-tracking glow */}
          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className={spotlightCardClass}
              >
                <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-gradient-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                  {/* Arrow icon on hover */}
                  <div className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/65 text-gray-200 opacity-0 transition-opacity group-hover/card:opacity-100 z-30" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width={9} height={8} fill="none"><path fill="#F4F4F5" d="m4.92 8-.787-.763 2.733-2.68H0V3.443h6.866L4.133.767 4.92 0 9 4 4.92 8Z" /></svg>
                  </div>
                  {/* Image */}
                  <div className="bg-gray-900/80 flex items-center justify-center p-6 h-56 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-contain transition-transform duration-500 group-hover/card:scale-105" style={{ mixBlendMode: 'lighten' }} />
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="relative rounded-full bg-gray-800/40 px-2.5 py-0.5 text-xs font-normal before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,rgba(55,65,81,0.15),rgba(55,65,81,0.5))_border-box] before:[mask-composite:exclude_] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
                        <span className="bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                          {s.tag}
                        </span>
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">{s.title}</h3>
                    <p className="text-indigo-200/65 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </Spotlight>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PLATFORMS SECTION
   ============================================================ */

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
    <section id="platforms" className="relative py-12 px-4">
      <BlurredShape className="bottom-0 left-1/2 -mb-40 -translate-x-[120%] opacity-50" color="indigo" />

      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <SectionLabel>Platform Coverage</SectionLabel>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Extract leads from 12+ platforms
            </h2>
            <p className="text-lg text-indigo-200/65">
              Each extractor is purpose-built with safety controls, smart rate limiting, and multi-engine search for maximum results.
            </p>
          </div>

          <div className="mx-auto grid max-w-sm gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-800/50 p-6 hover:border-indigo-500/30 hover:bg-gray-800/50 transition-all duration-500"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-indigo-500 mt-0.5">{p.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-200 mb-1">{p.name}</h3>
                    <p className="text-indigo-200/50 text-xs font-medium">{p.stats}</p>
                  </div>
                </div>
                <p className="text-indigo-200/65 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PRICING SECTION (Cruip-style with gradient border cards)
   ============================================================ */

function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="relative py-12 px-4">
      <BlurredShape className="top-0 left-1/2 -translate-x-1/2 -mt-40" color="indigo" />

      <div className="max-w-5xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <div className="text-center pb-8 max-w-3xl mx-auto">
            <SectionLabel>Simple Pricing</SectionLabel>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Plans that scale with your needs
            </h2>
            <p className="text-lg text-indigo-200/65">
              Choose the plan that fits. Upgrade anytime, cancel anytime. 14-day money-back guarantee.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-2 rounded-full">
              <AlertTriangle size={14} />
              <span>Launch Pricing \u2014 Prices Go Up Soon</span>
            </div>
          </div>

          {/* Billing toggle - Cruip style */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium transition-colors ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <label className="relative cursor-pointer">
              <input type="checkbox" className="sr-only" checked={annual} onChange={() => setAnnual(!annual)} />
              <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${annual ? 'left-7' : 'left-1'}`} />
              </div>
            </label>
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-gray-500'}`}>Annually</span>
            {annual && <span className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">Save 30%+</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter Plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-800/50 hover:border-gray-700/60 transition-all duration-500"
            >
              <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-indigo-500" />
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
                {['5 social platforms (Reddit, Twitter, YouTube, Pinterest, Tumblr)', 'CSV export', 'Email verification', '100 leads per extraction', '10 extractions/month', 'Desktop app (Win/Mac/Linux)'].map((item, j) => (
                  <div key={j} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className={`${primaryBtnClass} w-full justify-center mt-6`}>
                  <span className="relative inline-flex items-center">
                    Get Starter <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gray-800/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-500"
            >
              <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>
              <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-indigo-500 fill-indigo-500" />
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
                {['All 12+ platforms + Google Maps', 'Scheduled automated extractions', 'Email outreach campaigns', 'HubSpot & Salesforce CRM export', 'Telegram + WhatsApp extractors', 'Website email finder', 'Unlimited leads per extraction', 'Priority support & updates'].map((item, j) => (
                  <div key={j} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className={`${primaryBtnClass} w-full justify-center mt-6`}>
                  <span className="relative inline-flex items-center">
                    Get Pro <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Lifetime Deal */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800/50 via-indigo-900/20 to-gray-800/50 border border-indigo-500/20 p-8"
          >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 rounded-bl-xl">LIMITED TIME</div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-medium text-indigo-300 mb-2">Lifetime Deal &mdash; Pay Once, Use Forever</h3>
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
              <span className="text-indigo-200/50 text-xs">Only <span className="text-indigo-300 font-semibold">47 lifetime keys</span> remaining &mdash; then this offer is gone forever</span>
            </div>
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-indigo-200/40 text-xs">14-Day Money-Back Guarantee &mdash; No Questions Asked</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   TESTIMONIALS SECTION (Cruip-style quote card)
   ============================================================ */

function Testimonials() {
  const testimonials = [
    { quote: 'SnapLeads replaced 3 separate tools for us. The Google Maps extractor alone saved us 20 hours per week of manual prospecting.', name: 'Marcus Rodriguez', title: 'CEO at LeadFlow Agency', img: '/images/testimonial-1.jpg' },
    { quote: 'The account safety features are incredible. We have been running extractions for 6 months with zero issues. This is the real deal.', name: 'James Chen', title: 'Growth Lead at TechScale', img: '/images/testimonial-2.jpg' },
    { quote: 'From extraction to outreach in one tool &mdash; we closed $50K in new business in the first month using SnapLeads Pro.', name: 'David Park', title: 'Founder at CloudReach', img: '/images/testimonial-3.jpg' },
  ]
  const [active, setActive] = useState(0)

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <SectionLabel>What Users Say</SectionLabel>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Trusted by thousands of professionals
            </h2>
            <p className="text-lg text-indigo-200/65">
              Sales teams, marketers, agencies, and founders use SnapLeads to build their pipeline faster.
            </p>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <div className="relative bg-gray-800/30 border border-gray-800/50 rounded-2xl p-8 md:p-12">
              {/* Quote mark */}
              <svg className="absolute top-6 left-8 text-indigo-500/20" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11.3 2.5c-1 .2-2 .6-2.8 1.2C7 5 6 7 6 9.5c0 1.5.3 2.8.8 4 .5 1.1 1.2 2 2.2 2.7 1 .7 2.2 1 3.5 1h.5V14h-.5c-1.2 0-2-.4-2.5-1.2-.4-.7-.7-1.6-.7-2.8h3V2.5H11.3zm8.2 0c-1 .2-2 .6-2.8 1.2-1.5 1.3-2.5 3.3-2.5 5.8 0 1.5.3 2.8.8 4 .5 1.1 1.2 2 2.2 2.7 1 .7 2.2 1 3.5 1h.5V14h-.5c-1.2 0-2-.4-2.5-1.2-.4-.7-.7-1.6-.7-2.8h3V2.5h-1z" /></svg>

              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <p className="text-xl md:text-2xl font-medium text-gray-200 leading-relaxed mb-8 relative z-10">
                    &ldquo;{testimonials[active].quote}&rdquo;
                  </p>
                  <div>
                    <img src={testimonials[active].img} alt={testimonials[active].name} className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-indigo-500/30" />
                    <p className="font-semibold text-white text-sm">{testimonials[active].name}</p>
                    <p className="text-indigo-200/50 text-xs">{testimonials[active].title}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

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

/* ============================================================
   FAQ SECTION
   ============================================================ */

function FAQ() {
  const faqs = [
    { q: 'Is SnapLeads really that affordable?', a: 'Yes! Our Starter plan is just $7/month. We believe powerful lead extraction should not cost hundreds. Your license gives you full access to the desktop app with no hidden costs, no API fees, and no proxy charges.' },
    { q: 'Will my accounts get banned using SnapLeads?', a: 'We have built enterprise-grade account safety: smart rate limiting, randomized behavior patterns, and built-in safety controls. In 6+ months of testing, zero bans reported.' },
    { q: 'What platforms can I extract leads from?', a: 'LinkedIn, Facebook, Instagram, Reddit, Twitter/X, TikTok, YouTube, Google Maps, Telegram, WhatsApp, and more. Pro plan includes all platforms; Starter includes 5 core platforms.' },
    { q: 'Does it work on Windows, Mac, and Linux?', a: 'Yes! SnapLeads works on all three platforms. Download the installer for your OS and you are ready in under 2 minutes.' },
    { q: 'Can I export leads to my CRM?', a: 'Pro plan includes direct HubSpot and Salesforce CRM integration. All plans support CSV and Excel export. We are adding more CRM integrations based on user demand.' },
    { q: 'What if I do not like it? Is there a refund?', a: 'We offer a 14-day money-back guarantee on all plans. If SnapLeads does not meet your needs, we will refund you &mdash; no questions asked.' },
  ]

  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="border-t py-12 md:py-20" style={sectionBorderStyle}>
          <div className="text-center pb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className={`pb-4 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Frequently asked questions
            </h2>
            <p className="text-lg text-indigo-200/65">Everything you need to know before getting started.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-800/50 overflow-hidden bg-gray-800/20 hover:bg-gray-800/30 transition-colors"
              >
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-sm text-gray-200 pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${openIdx === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="text-indigo-200/65 text-sm leading-relaxed border-t border-gray-800/50 pt-4">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   CTA SECTION (Cruip-style with blurred shape)
   ============================================================ */

function FinalCTA() {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <BlurredShape className="bottom-0 left-1/2 -mb-24 ml-20 -translate-x-1/2" color="indigo" />

      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-transparent via-gray-800/50 to-transparent py-12 md:py-20 rounded-2xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={`pb-8 font-semibold text-3xl md:text-4xl ${gradientTextClass}`}>
              Ready to supercharge your lead generation?
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4">
              <a href="#pricing" className={primaryBtnClass}>
                <span className="relative inline-flex items-center">
                  Download SnapLeads
                  <ArrowRight size={16} className="ml-1.5 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
              <a href="#features" className={`${secondaryBtnClass} mt-4 sm:mt-0`}>
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */

function Footer() {
  return (
    <footer className="py-12 px-4 border-t" style={sectionBorderStyle}>
      {/* Footer illustration glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -translate-x-1/2" aria-hidden="true">
        <div className="w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)]" />
      </div>

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
              <a key={i} href={item.href} className="block text-indigo-200/65 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
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
              <a key={i} href={item.href} className="block text-indigo-200/65 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
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
              <a key={i} href={item.href} className="block text-indigo-200/65 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
          <div>
            <h6 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Connect</h6>
            {[
              { label: 'X (Twitter)', href: 'https://x.com' },
              { label: 'Facebook', href: 'https://facebook.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-indigo-200/65 hover:text-gray-300 transition-colors mb-2 text-sm">{item.label}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="SnapLeads" className="w-7 h-7 rounded-lg" />
            <span className="font-semibold text-sm text-white">SnapLeads</span>
          </div>
          <p className="text-gray-600 text-xs">&copy; 2026 SnapLeads. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   MAIN LANDING PAGE
   ============================================================ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-inter antialiased overflow-hidden">
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
