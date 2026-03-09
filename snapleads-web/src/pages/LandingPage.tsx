import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Shield, Globe, Clock, Check, ChevronDown, Menu, X, Star, Download, Users, MapPin, MessageCircle, Search, Send, Linkedin, Instagram, Facebook, Twitter, TrendingUp, AlertTriangle, Play, Pause } from 'lucide-react'

/* ─── COUNTER HOOK ─── */
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

/* ─── FADE IN ANIMATION ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${scrolled ? 'w-[95%] max-w-5xl bg-dark/90 backdrop-blur-xl border border-dark-border shadow-2xl' : 'w-[95%] max-w-5xl bg-dark/70 backdrop-blur-md border border-dark-border/50'} rounded-full px-6 py-3 flex items-center justify-between`}>
      <a href="#" className="flex items-center gap-2">
        <img src="/images/logo.png" alt="SnapLeads" className="w-8 h-8 rounded-lg" />
        <span className="font-mono font-bold text-sm tracking-wider uppercase">SnapLeads</span>
      </a>
      
      <div className="hidden md:flex items-center gap-6">
        <a href="#features" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Features</a>
        <a href="#platforms" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Platforms</a>
        <a href="#pricing" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Pricing</a>
        <a href="#faq" className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors">FAQ</a>
      </div>
      
      <div className="flex items-center gap-3">
        <a href="#pricing" className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/30">
          Get Started <ArrowRight size={14} />
        </a>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-dark/95 backdrop-blur-xl border border-dark-border rounded-2xl p-6 flex flex-col gap-4 md:hidden">
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-wider text-gray-400 hover:text-white">Features</a>
          <a href="#platforms" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-wider text-gray-400 hover:text-white">Platforms</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-wider text-gray-400 hover:text-white">Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="text-sm font-mono uppercase tracking-wider text-gray-400 hover:text-white">FAQ</a>
          <a href="#pricing" className="flex items-center justify-center gap-2 bg-accent text-white font-mono text-sm uppercase px-5 py-3 rounded-full">Get Started <ArrowRight size={14} /></a>
        </motion.div>
      )}
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -50])
  const y2 = useTransform(scrollY, [0, 500], [0, -30])
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(255,69,0,0.15) 0%, rgba(255,69,0,0.05) 40%, transparent 70%)' }} />
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(255,107,53,0.1) 0%, transparent 60%)' }} />
      <div className="absolute top-[5%] right-[15%] w-[350px] h-[350px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(220,50,0,0.08) 0%, transparent 60%)' }} />
      <div className="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.05) 0%, transparent 60%)' }} />
      
      {/* Hakari-style sparkle particles */}
      {[...Array(24)].map((_, i) => {
        const sizes = [2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 4, 2, 3, 2, 4, 3]
        const tops = ['8%','15%','22%','35%','45%','55%','65%','75%','12%','28%','42%','58%','72%','85%','18%','32%','48%','62%','78%','5%','25%','50%','70%','90%']
        const lefts = ['5%','15%','85%','92%','8%','78%','25%','65%','45%','55%','35%','72%','18%','88%','60%','40%','95%','3%','50%','70%','30%','82%','12%','58%']
        const opacities = [0.15, 0.25, 0.35, 0.2, 0.3, 0.15, 0.25, 0.2, 0.35, 0.15, 0.25, 0.3, 0.2, 0.15, 0.35, 0.25, 0.2, 0.3, 0.15, 0.25, 0.35, 0.2, 0.3, 0.15]
        const delays = [0, 1.5, 3, 0.5, 2, 3.5, 1, 2.5, 0.8, 1.8, 2.8, 0.3, 1.3, 2.3, 3.3, 0.6, 1.6, 2.6, 3.6, 0.9, 1.9, 2.9, 3.9, 1.2]
        return (
          <div
            key={`sparkle-${i}`}
            className="absolute rounded-full animate-sparkle"
            style={{
              width: sizes[i],
              height: sizes[i],
              top: tops[i],
              left: lefts[i],
              backgroundColor: `rgba(255, 255, 255, ${opacities[i]})`,
              boxShadow: `0 0 ${sizes[i] * 3}px rgba(255, 255, 255, ${opacities[i] * 0.5})`,
              animationDelay: `${delays[i]}s`,
            }}
          />
        )
      })}
      
      {/* Floating platform icons */}
      <motion.div style={{ y: y1 }} className="absolute top-32 left-[10%] animate-float">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30"><Linkedin size={28} className="text-white" /></div>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute top-40 right-[12%] animate-float-delayed">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"><Instagram size={28} className="text-white" /></div>
      </motion.div>
      <motion.div style={{ y: y1 }} className="absolute top-56 left-[5%] animate-float-delayed">
        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30"><Globe size={24} className="text-white" /></div>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute top-48 right-[5%] animate-float">
        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"><MapPin size={24} className="text-white" /></div>
      </motion.div>
      <motion.div style={{ y: y1 }} className="absolute bottom-[35%] left-[8%] animate-float">
        <div className="w-11 h-11 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30"><Send size={22} className="text-white" /></div>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-[40%] right-[8%] animate-float-delayed">
        <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"><MessageCircle size={22} className="text-white" /></div>
      </motion.div>
      
      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 bg-dark-card border border-dark-border px-5 py-2 rounded-full mb-8 relative z-10">
        <Star size={14} className="text-accent fill-accent" />
        <span className="font-mono text-xs uppercase tracking-wider text-gray-300">#1 Lead Extraction Software 2026</span>
        <Star size={14} className="text-accent fill-accent" />
      </motion.div>
      
      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-center leading-none tracking-tighter max-w-5xl relative z-10">
        Extract <span className="italic text-gray-500">Leads</span> From
        <br />
        <span className="text-gradient">12+ Platforms</span> In Minutes
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-gray-400 text-base md:text-lg max-w-xl text-center mt-6 mb-8 relative z-10">
        The most powerful desktop app for extracting emails, phones, and business data from social media, Google Maps, and the web. Zero proxies needed.
      </motion.p>
      
      {/* CTAs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        <a href="#pricing" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 animate-pulse-glow">
          Download Now <ArrowRight size={16} />
        </a>
        <a href="#features" className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/5">
          See Features
        </a>
      </motion.div>
      
      {/* Hero Image — Real App Screenshot */}
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }} className="relative mt-16 w-full max-w-4xl mx-auto z-10">
        <div className="relative rounded-2xl overflow-hidden border border-dark-border shadow-2xl shadow-accent/10">
          <img src="/images/screenshot-extraction-v2.png" alt="SnapLeads App — Configure & Extract Leads" className="w-full h-auto" />
          {/* Annotation overlays */}
          <div className="absolute top-[8%] right-[4%] bg-accent/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg animate-pulse-glow">
            9 Platforms Selected
          </div>
          <div className="absolute bottom-[35%] right-[4%] bg-green-500/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
            Auto-Verify Emails
          </div>
          <div className="absolute bottom-[6%] left-[15%] right-[15%] bg-accent/90 backdrop-blur-sm text-white text-xs md:text-sm font-bold text-center py-2 rounded-full shadow-lg animate-pulse-glow">
            One Click to Start Extracting
          </div>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-transparent to-accent/20 rounded-2xl blur-xl -z-10" />
      </motion.div>
      
      {/* Logo Marquee */}
      <div className="w-full mt-16 overflow-hidden relative z-10">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mx-6">
              {['LinkedIn', 'Facebook', 'Instagram', 'Reddit', 'Twitter/X', 'Google Maps', 'Telegram', 'WhatsApp', 'TikTok', 'YouTube'].map((name) => (
                <span key={`${i}-${name}`} className="font-mono text-sm uppercase tracking-wider text-gray-600 hover:text-gray-400 transition-colors">{name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── STATS (ORANGE) ─── */
function Stats() {
  const s1 = useCountUp(10000, 2000)
  const s2 = useCountUp(12, 1500)
  const s3 = useCountUp(100, 1800)
  
  return (
    <section className="bg-accent py-20 px-4">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-6xl mx-auto">
        <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-black uppercase text-center text-white mb-16 tracking-tight">
          A Little About Us
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={fadeIn} className="border-l-2 border-white/30 pl-6">
            <h6 className="font-mono text-xs uppercase tracking-widest text-white/80 mb-4">Trusted By Professionals</h6>
            <div className="text-5xl font-black text-white mb-2"><span ref={s1.ref}>{s1.count.toLocaleString()}</span>+</div>
            <p className="text-white/70 text-sm">Leads extracted daily by users worldwide. From startups to enterprise sales teams.</p>
          </motion.div>
          <motion.div variants={fadeIn} className="border-l-2 border-white/30 pl-6">
            <h6 className="font-mono text-xs uppercase tracking-widest text-white/80 mb-4">Platform Coverage</h6>
            <div className="text-5xl font-black text-white mb-2"><span ref={s2.ref}>{s2.count}</span>+</div>
            <p className="text-white/70 text-sm">Social platforms and data sources supported. LinkedIn, Google Maps, Reddit, Telegram, and more.</p>
          </motion.div>
          <motion.div variants={fadeIn} className="border-l-2 border-white/30 pl-6">
            <h6 className="font-mono text-xs uppercase tracking-widest text-white/80 mb-4">Zero Cost Infrastructure</h6>
            <div className="text-5xl font-black text-white mb-2"><span ref={s3.ref}>{s3.count}</span>%</div>
            <p className="text-white/70 text-sm">Runs entirely on your machine. No monthly API costs, no proxy fees, no hidden charges.</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── WHO WE ARE MARQUEE ─── */
function WhoWeAre() {
  return (
    <section className="py-20 bg-dark noise-bg overflow-hidden">
      <div className="mb-8 flex justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ What Is SnapLeads ]</span>
      </div>
      <div className="overflow-hidden whitespace-nowrap relative z-10">
        <div className="animate-marquee inline-flex">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-gray-800 mx-4">
              THE MOST POWERFUL DESKTOP APP FOR EXTRACTING LEADS, EMAILS, PHONES AND BUSINESS DATA FROM 12+ SOCIAL PLATFORMS AND GOOGLE MAPS.&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ Windows, Mac & Linux — Works Everywhere ]</span>
      </div>
    </section>
  )
}

/* ─── AUTO-DEMO VIDEO (Zoom/Pan Animated Showcase) ─── */
function AutoDemoVideo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: false, amount: 0.3 })
  
  const steps = [
    {
      img: '/images/screenshot-extraction-v2.png',
      title: 'Step 1: Configure',
      subtitle: 'Select platforms, enter keywords, set extraction methods',
      zoom: { scale: 1.35, x: '-12%', y: '-8%' },
      annotations: [
        { label: '9 Platforms', x: '72%', y: '42%', color: 'bg-accent', delay: 0.3 },
        { label: '3 Keywords', x: '72%', y: '22%', color: 'bg-purple-500', delay: 0.6 },
        { label: 'One Click Start', x: '50%', y: '88%', color: 'bg-green-500', delay: 0.9 },
      ],
      duration: 5000,
    },
    {
      img: '/images/screenshot-running-v2.png',
      title: 'Step 2: Extract',
      subtitle: 'Watch leads pour in across all platforms in real-time',
      zoom: { scale: 1.4, x: '-5%', y: '-15%' },
      annotations: [
        { label: '247 Leads', x: '22%', y: '30%', color: 'bg-green-500', delay: 0.3 },
        { label: '67% Done', x: '75%', y: '12%', color: 'bg-accent', delay: 0.6 },
        { label: 'Live Stats', x: '50%', y: '55%', color: 'bg-blue-500', delay: 0.9 },
      ],
      duration: 5000,
    },
    {
      img: '/images/screenshot-results-v2.png',
      title: 'Step 3: Export',
      subtitle: '329 verified leads ready for CSV, Excel, or CRM export',
      zoom: { scale: 1.3, x: '-8%', y: '-5%' },
      annotations: [
        { label: '329 Leads', x: '25%', y: '5%', color: 'bg-accent', delay: 0.3 },
        { label: 'Verified', x: '78%', y: '35%', color: 'bg-green-500', delay: 0.6 },
        { label: 'Export CSV', x: '82%', y: '5%', color: 'bg-blue-500', delay: 0.9 },
      ],
      duration: 5000,
    },
  ]

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }, [steps.length])

  useEffect(() => {
    if (!isPlaying || !inView) return
    const timer = setTimeout(advanceStep, steps[currentStep].duration)
    return () => clearTimeout(timer)
  }, [currentStep, isPlaying, inView, advanceStep, steps])

  const step = steps[currentStep]

  return (
    <section className="py-24 px-4 bg-dark noise-bg relative overflow-hidden" ref={containerRef}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.3), transparent 70%)' }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ Auto Demo ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              See The <span className="text-gradient">Extraction Power</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Watch how SnapLeads extracts 329 verified leads from 9 platforms in minutes. Auto-playing demo with zoom-in detail views.</p>
          </motion.div>

          {/* Step indicators */}
          <motion.div variants={fadeIn} className="flex justify-center items-center gap-3 mb-8">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-500 ${
                  currentStep === i
                    ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-105'
                    : 'bg-dark-card border border-dark-border text-gray-500 hover:text-white hover:border-gray-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold" style={{ borderColor: currentStep === i ? '#fff' : '#555' }}>{i + 1}</span>
                {s.title.replace('Step ' + (i + 1) + ': ', '')}
              </button>
            ))}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="ml-2 w-9 h-9 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </motion.div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="h-1 bg-dark-card rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-orange-400 rounded-full"
                key={`progress-${currentStep}-${isPlaying}`}
                initial={{ width: '0%' }}
                animate={{ width: isPlaying && inView ? '100%' : '0%' }}
                transition={{ duration: step.duration / 1000, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Main viewport with zoom/pan */}
          <motion.div variants={fadeIn} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-dark-border shadow-2xl shadow-accent/10 bg-[#09090b]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Image with zoom animation */}
                  <motion.img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-auto"
                    initial={{ scale: 1, x: '0%', y: '0%' }}
                    animate={{
                      scale: [1, step.zoom.scale, step.zoom.scale, 1],
                      x: ['0%', step.zoom.x, step.zoom.x, '0%'],
                      y: ['0%', step.zoom.y, step.zoom.y, '0%'],
                    }}
                    transition={{
                      duration: step.duration / 1000,
                      times: [0, 0.25, 0.75, 1],
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Animated annotations */}
                  {step.annotations.map((a, i) => (
                    <motion.div
                      key={`${currentStep}-ann-${i}`}
                      className={`absolute ${a.color} backdrop-blur-md text-white text-[10px] md:text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-black/30 hidden md:flex items-center gap-1.5`}
                      style={{ left: a.x, top: a.y, transform: 'translate(-50%, -50%)' }}
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: a.delay, duration: 0.4, ease: 'backOut' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {a.label}
                    </motion.div>
                  ))}

                  {/* Spotlight effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.15, 0.15, 0] }}
                    transition={{ duration: step.duration / 1000, times: [0, 0.2, 0.8, 1] }}
                    style={{
                      background: 'radial-gradient(circle at 50% 40%, transparent 30%, rgba(0,0,0,0.6) 100%)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/15 via-transparent to-accent/15 rounded-2xl blur-xl -z-10" />
          </motion.div>

          {/* Step description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-center mt-8"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">{step.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── APP DEMO SHOWCASE (Tab-based) ─── */
function AppDemo() {
  const [activeTab, setActiveTab] = useState(0)
  const demos = [
    {
      tab: 'Configure',
      title: 'Set Up Your Extraction in Seconds',
      desc: 'Choose from 9+ platforms, enter your keywords, configure extraction methods, and hit start. The intuitive interface makes lead extraction effortless.',
      img: '/images/screenshot-extraction-v2.png',
      annotations: [
        { label: 'Session Name', pos: 'top-[13%] left-[16%]', color: 'bg-blue-500/90' },
        { label: 'Multi-Keyword Support', pos: 'top-[25%] left-[16%]', color: 'bg-purple-500/90' },
        { label: '9 Platforms', pos: 'top-[42%] left-[16%]', color: 'bg-accent/90' },
      ]
    },
    {
      tab: 'Extract',
      title: 'Watch Leads Pour In — Real-Time',
      desc: 'Track extraction progress across all platforms with live stats. See total leads, emails found, and phones discovered as they come in.',
      img: '/images/screenshot-running-v2.png',
      annotations: [
        { label: '67% Complete', pos: 'top-[11%] right-[8%]', color: 'bg-accent/90' },
        { label: '247 Leads Found', pos: 'top-[28%] left-[16%]', color: 'bg-green-500/90' },
        { label: 'Per-Platform Breakdown', pos: 'top-[55%] left-[16%]', color: 'bg-blue-500/90' },
      ]
    },
    {
      tab: 'Results',
      title: '329 Verified Leads — Ready to Export',
      desc: 'View all extracted leads with email, phone, name, platform source, quality score, and verification status. Export to CSV, XLSX, or JSON in one click.',
      img: '/images/screenshot-results-v2.png',
      annotations: [
        { label: 'Clean Results (Pro)', pos: 'top-[2%] right-[30%]', color: 'bg-accent/90' },
        { label: 'Export CSV / XLSX / JSON', pos: 'top-[2%] right-[4%]', color: 'bg-green-500/90' },
        { label: 'Quality Score & Verification', pos: 'top-[45%] right-[8%]', color: 'bg-blue-500/90' },
      ]
    },
  ]
  
  return (
    <section className="py-24 px-4 bg-dark noise-bg relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ See It In Action ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              Real App. <span className="text-gradient">Real Results.</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">No mockups, no fake data — these are actual screenshots from SnapLeads extracting leads across 9 platforms.</p>
          </motion.div>
          
          {/* Tab Switcher */}
          <motion.div variants={fadeIn} className="flex justify-center gap-2 mb-8">
            {demos.map((d, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className={`font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all duration-300 ${activeTab === i ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-gray-600'}`}>
                {d.tab}
              </button>
            ))}
          </motion.div>
          
          {/* Screenshot Display */}
          <motion.div variants={fadeIn} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-dark-border shadow-2xl shadow-accent/10">
              <img src={demos[activeTab].img} alt={demos[activeTab].title} className="w-full h-auto" />
              {/* Annotation badges */}
              {demos[activeTab].annotations.map((a, i) => (
                <div key={`${activeTab}-${i}`} className={`absolute ${a.pos} ${a.color} backdrop-blur-sm text-white text-[9px] md:text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg hidden md:block`}>
                  {a.label}
                </div>
              ))}
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 rounded-2xl blur-xl -z-10" />
          </motion.div>
          
          {/* Description */}
          <motion.div variants={fadeIn} className="text-center mt-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{demos[activeTab].title}</h3>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">{demos[activeTab].desc}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FEATURES (VALUE PROPS) ─── */
function Features() {
  const features = [
    { icon: <Search size={24} />, title: 'EXTRACT', subtitle: 'Pull leads from any platform', desc: 'Extract emails, phones, names, and business data from LinkedIn, Instagram, Reddit, Google Maps, and 8 more platforms.', img: '/images/screenshot-extraction-v2.png' },
    { icon: <Shield size={24} />, title: 'PROTECT', subtitle: 'Built-in account safety', desc: 'Advanced anti-detection technology with smart rate limiting, randomized behavior patterns, and built-in safety controls to keep your accounts protected.', img: '/images/screenshot-running-v2.png' },
    { icon: <Zap size={24} />, title: 'AUTOMATE', subtitle: 'Schedule & scale extractions', desc: 'Set up recurring extraction schedules. Run campaigns on autopilot while you focus on closing deals.', img: '/images/screenshot-running-v2.png' },
    { icon: <Clock size={24} />, title: 'ENRICH', subtitle: 'Verify & export instantly', desc: 'Built-in email verification, CSV/Excel export, HubSpot CRM integration, and email outreach — all in one app.', img: '/images/screenshot-results-v2.png' },
  ]
  
  return (
    <section id="features" className="py-24 px-4 bg-light text-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-gray-300 px-4 py-2 rounded-full">[ Features ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              Why <span className="italic text-gray-400">Users</span> Choose SnapLeads
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Everything you need to extract, verify, and convert leads — in a single desktop application that runs entirely on your machine.</p>
          </motion.div>
          
          <div className="space-y-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </div>
          
          <motion.div variants={fadeIn} className="flex justify-center mt-12">
            <a href="#pricing" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/30">
              Start Extracting <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, subtitle, desc, img }: { icon: React.ReactNode; title: string; subtitle: string; desc: string; img: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <motion.div variants={fadeIn} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl">
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="flex-1 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-accent">{icon}</span>
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">{title}</h3>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold text-dark mb-3">{subtitle}</h4>
          <p className="text-gray-500 leading-relaxed">{desc}</p>
          <a href="#pricing" className="flex items-center gap-2 mt-6 text-accent font-mono text-xs uppercase tracking-wider hover:text-accent-hover transition-colors">
            Learn more <ArrowRight size={14} className={`transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
          </a>
        </div>
        <div className={`w-full md:w-80 h-56 md:h-auto overflow-hidden transition-all duration-500 bg-[#0A0A0A] flex items-center justify-center ${hovered ? 'md:w-96' : 'md:w-80'}`}>
          <img src={img} alt={title} className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`} />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── PLATFORM SHOWCASE ─── */
function Platforms() {
  const platforms = [
    { num: '01', name: 'Google Maps Lead Finder', stats: [{ val: '50K+', label: 'businesses/day' }, { val: '100%', label: 'data accuracy' }, { val: '6+', label: 'data fields' }], color: 'from-red-600 to-orange-500' },
    { num: '02', name: 'LinkedIn Lead Extractor', stats: [{ val: '10K+', label: 'profiles/session' }, { val: '95%', label: 'email match' }, { val: '0%', label: 'ban rate' }], color: 'from-blue-600 to-cyan-500' },
    { num: '03', name: 'Reddit Lead Finder', stats: [{ val: '200+', label: 'subreddits' }, { val: '5K+', label: 'leads/query' }, { val: '3x', label: 'faster' }], color: 'from-orange-500 to-red-500' },
    { num: '04', name: 'Telegram Group Extractor', stats: [{ val: '500+', label: 'members/group' }, { val: '100%', label: 'safe extraction' }, { val: '5+', label: 'groups/day' }], color: 'from-sky-500 to-blue-600' },
    { num: '05', name: 'Instagram + Facebook', stats: [{ val: '1K+', label: 'profiles/run' }, { val: '90%', label: 'data capture' }, { val: '4+', label: 'data points' }], color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <section id="platforms" className="py-24 px-4 bg-light text-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-gray-300 px-4 py-2 rounded-full">[ Platforms — 12+ ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              Our <span className="italic text-gray-400">Supported</span> Platforms
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Extract leads from the biggest platforms on the internet. Each extractor is purpose-built with safety controls and smart rate limiting.</p>
          </motion.div>
          
          {/* Platform icon grid */}
          <motion.div variants={fadeIn} className="flex justify-center mb-12">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-w-lg">
              {[
                { name: 'LinkedIn', color: 'bg-blue-600', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                { name: 'Google Maps', color: 'bg-red-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.044-2.525-1.049-1.842-2.554-3.378-3.737-5.113-1.29-1.893-2.264-4.14-2.04-6.494.137-1.447.637-2.863 1.483-4.065C8.02 2.49 10.674 1.007 13.467.873c2.056-.1 4.15.524 5.744 1.769.085.066.168.134.251.204l-.014.012-.106.09-.062.053.003.004-.005.01 1.245 1.018-.001-.001.005.01c.092-.076.174-.166.276-.233.135-.09.267-.183.399-.275l-1.674-1.735z" /><path d="M19.527 4.799l-1.674-1.735c-.132.092-.264.185-.399.275-.102.067-.184.157-.276.233l-.005-.01.001.001-1.245-1.018.005-.01-.003-.004.062-.053.106-.09.014-.012a8.96 8.96 0 00-.251-.204C14.11.698 11.57.146 9.166.627 6.27 1.211 3.776 3.322 2.641 6.02c-.955 2.273-.985 4.903-.037 7.185.465 1.118 1.128 2.17 1.919 3.05.763.85 1.564 1.672 2.33 2.524.802.892 1.556 1.83 2.247 2.823.464.665.879 1.364 1.208 2.109.121.274.234.551.342.831.108.279.203.567.312.85.109.281.224.556.367.816a.966.966 0 00.39.415c.17.09.356.117.542.117h.007c.391-.003.518-.373.627-.687.116-.335.219-.675.34-1.008.12-.334.242-.667.383-.992.425-.977 1.05-1.869 1.669-2.727 1.354-1.874 2.997-3.567 4.098-5.614 1.342-2.495 1.617-5.565.405-8.173zM12 14.4a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" /></svg> },
                { name: 'Reddit', color: 'bg-orange-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.461 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.206-.095z" /></svg> },
                { name: 'Telegram', color: 'bg-sky-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg> },
                { name: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" /></svg> },
                { name: 'Facebook', color: 'bg-blue-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
                { name: 'Twitter/X', color: 'bg-gray-700', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                { name: 'WhatsApp', color: 'bg-green-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
                { name: 'TikTok', color: 'bg-gray-800', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg> },
                { name: 'YouTube', color: 'bg-red-600', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
                { name: 'Pinterest', color: 'bg-rose-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" /></svg> },
                { name: 'Email', color: 'bg-teal-500', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg> },
              ].map((p, i) => (
                <div key={i} className={`${p.color} rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-lg hover:scale-105 transition-transform`}>
                  {p.svg}
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/90 font-semibold">{p.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <div className="space-y-4">
            {platforms.map((p, i) => (
              <motion.div key={i} variants={fadeIn} className="group bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-500 cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <span className="text-accent font-mono text-lg font-bold">{p.num}.</span>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex-1">{p.name}</h3>
                  <div className="flex gap-8">
                    {p.stats.map((s, j) => (
                      <div key={j} className="text-center">
                        <div className="text-2xl font-black text-dark">{s.val}</div>
                        <div className="text-xs text-gray-400 font-mono uppercase">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── PRICING ─── */
function Pricing() {
  const [annual, setAnnual] = useState(false)
  
  return (
    <section id="pricing" className="py-24 px-4 bg-dark noise-bg relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ Pricing ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              Simple <span className="italic text-gray-500">Pricing</span> For Every User
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">Choose the plan that fits your needs. Upgrade anytime, cancel anytime.</p>
          </motion.div>
          
          {/* Urgency Banner */}
          <motion.div variants={fadeIn} className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-full">
              <AlertTriangle size={14} />
              <span>Launch Pricing — Prices Go Up Soon</span>
            </div>
          </motion.div>
          
          {/* Toggle */}
          <motion.div variants={fadeIn} className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-mono text-sm uppercase tracking-wider ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? 'bg-accent' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${annual ? 'left-8' : 'left-1'}`} />
            </button>
            <span className={`font-mono text-sm uppercase tracking-wider ${annual ? 'text-white' : 'text-gray-500'}`}>Annually</span>
            {annual && <span className="bg-accent/20 text-accent font-mono text-xs px-3 py-1 rounded-full">Save 30%+</span>}
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter */}
            <motion.div variants={fadeIn} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden group hover:border-gray-700 transition-all duration-500">
              <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-accent" /><span className="font-mono text-xs uppercase tracking-widest text-gray-400">Starter</span></div>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-black text-white">${annual ? '59' : '7'}<span className="text-lg text-gray-400 font-normal">/{annual ? 'yr' : 'mo'}</span></div>
                  <span className="text-gray-500 line-through text-lg">${annual ? '84' : '12'}</span>
                  <span className="bg-green-500/20 text-green-400 font-mono text-xs px-2 py-0.5 rounded-full">{annual ? '30% OFF' : '42% OFF'}</span>
                </div>
              </div>
              <div className="p-8">
                <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">What's Included</h6>
                {['5 social platforms (Reddit, Twitter, YouTube, Pinterest, Tumblr)', 'CSV export', 'Email verification', '100 leads per extraction', '10 extractions/month', 'Desktop app (Win/Mac/Linux)'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-300 mt-6 w-full hover:shadow-lg hover:shadow-accent/30">
                  Get Starter <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
            
            {/* Pro */}
            <motion.div variants={fadeIn} className="bg-dark-card border border-accent/30 rounded-2xl overflow-hidden group hover:border-accent/60 transition-all duration-500 relative">
              <div className="absolute top-4 right-4 bg-accent text-white font-mono text-xs px-3 py-1 rounded-full">Most Popular</div>
              <div className="h-36 bg-gradient-to-br from-accent/30 to-orange-900/40 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-accent fill-accent" /><span className="font-mono text-xs uppercase tracking-widest text-accent">Pro</span></div>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-black text-white">${annual ? '169' : '19'}<span className="text-lg text-gray-400 font-normal">/{annual ? 'yr' : 'mo'}</span></div>
                  <span className="text-gray-500 line-through text-lg">${annual ? '228' : '29'}</span>
                  <span className="bg-green-500/20 text-green-400 font-mono text-xs px-2 py-0.5 rounded-full">{annual ? '26% OFF' : '34% OFF'}</span>
                </div>
              </div>
              <div className="p-8">
                <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Everything in Starter, plus</h6>
                {['All 12+ platforms + Google Maps', 'Scheduled automated extractions', 'Email outreach campaigns', 'HubSpot & Salesforce CRM export', 'Telegram + WhatsApp extractors', 'Website email finder', 'Unlimited leads per extraction', 'Priority support & updates'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
                <a href="#pricing" className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-300 mt-6 w-full hover:shadow-lg hover:shadow-accent/30 animate-pulse-glow">
                  Get Pro <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* Lifetime Deal */}
          <motion.div variants={fadeIn} className="mt-6 bg-dark-card border border-accent/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-white font-mono text-xs px-4 py-1.5 rounded-bl-xl">LIMITED TIME</div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-2">Lifetime Deal — Pay Once, Use Forever</h3>
                <p className="text-gray-500 text-sm">No subscriptions. Includes all future updates and new features forever.</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-gray-500 line-through text-lg">$168</div>
                  <div className="text-4xl font-black text-white">$99</div>
                  <span className="bg-red-500/20 text-red-400 font-mono text-[10px] px-2 py-0.5 rounded-full">41% OFF</span>
                  <div className="text-gray-600 font-mono text-[10px] uppercase mt-1">Starter Lifetime</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 line-through text-lg">$456</div>
                  <div className="text-4xl font-black text-white">$249</div>
                  <span className="bg-red-500/20 text-red-400 font-mono text-[10px] px-2 py-0.5 rounded-full">45% OFF</span>
                  <div className="text-gray-600 font-mono text-[10px] uppercase mt-1">Pro Lifetime</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <TrendingUp size={14} className="text-accent" />
              <span className="text-gray-400 font-mono text-xs uppercase tracking-wider">Only <span className="text-accent font-bold">47 lifetime keys</span> remaining — then this offer is gone forever</span>
            </div>
          </motion.div>

          {/* Money-back guarantee */}
          <motion.div variants={fadeIn} className="mt-4 text-center">
            <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">14-Day Money-Back Guarantee — No Questions Asked</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── TESTIMONIAL ─── */
function Testimonial() {
  const testimonials = [
    { quote: "SnapLeads replaced 3 separate tools for us. The Google Maps extractor alone saved us 20 hours per week of manual prospecting.", name: "Marcus Rodriguez", title: "CEO at LeadFlow Agency", img: "/images/testimonial-1.jpg" },
    { quote: "The account safety features are incredible. We have been running extractions for 6 months with zero issues. This is the real deal.", name: "James Chen", title: "Growth Lead at TechScale", img: "/images/testimonial-2.jpg" },
    { quote: "From extraction to outreach in one tool — we closed $50K in new business in the first month using SnapLeads Pro.", name: "David Park", title: "Founder at CloudReach", img: "/images/testimonial-3.jpg" },
  ]
  const [active, setActive] = useState(0)

  return (
    <section className="py-24 px-4 bg-dark noise-bg relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeIn}>
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dark-border px-4 py-2 rounded-full">[ Helping Businesses Scale ]</span>
          </motion.div>
          
          {/* Testimonial stars */}
          <motion.div variants={fadeIn} className="flex justify-center mt-8 mb-4">
            <div className="flex items-center gap-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className="text-accent fill-accent" />
                ))}
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-500">Trusted by 10,000+ users</span>
            </div>
          </motion.div>
          
          <motion.div variants={fadeIn} className="mt-2">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">
              {testimonials[active].quote}
            </h3>
            <div className="mt-8">
              <img src={testimonials[active].img} alt={testimonials[active].name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-accent/30" />
              <p className="font-bold text-white">{testimonials[active].name}</p>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500">{testimonials[active].title}</p>
            </div>
          </motion.div>
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${i === active ? 'bg-accent w-8' : 'bg-gray-700 hover:bg-gray-600'}`} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-light text-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-gray-300 px-4 py-2 rounded-full">[ How It Works ]</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase mt-6 tracking-tight">
              Three Steps To <span className="italic text-gray-400">Unlimited</span> Leads
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Download & Activate', desc: 'Install the desktop app on Windows, Mac, or Linux. Enter your license key and you\'re ready to go.', icon: <Download size={28} />, img: '/images/screenshot-extraction-v2.png' },
              { step: '02', title: 'Configure & Extract', desc: 'Select from 9+ platforms, enter keywords, and choose extraction methods. Real app screenshot shown above.', icon: <Search size={28} />, img: '/images/screenshot-extraction-v2.png' },
              { step: '03', title: 'View Results & Export', desc: 'See all leads with email, phone, quality score. Export to CSV, Excel, JSON, or push to HubSpot CRM.', icon: <Users size={28} />, img: '/images/screenshot-results-v2.png' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 group">
                <div className="bg-[#0A0A0A] flex items-center justify-center p-1 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-44 object-cover object-top rounded-t-xl" />
                </div>
                <div className="p-8">
                  <span className="text-accent font-mono text-lg font-bold">{s.step}.</span>
                  <h3 className="text-xl font-bold mb-2 mt-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
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
    <section id="faq" className="py-24 px-4 bg-light text-dark">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeIn} className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-gray-300 px-4 py-2 rounded-full">[ Answers To Your Questions ]</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase mt-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-4">Everything you need to know before getting started with SnapLeads.</p>
          </motion.div>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-sm uppercase tracking-wide pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }} className="px-6 pb-6">
                    <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FINAL CTA ─── */
function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-dark noise-bg relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {/* Animated CTA icon */}
          <motion.div variants={fadeIn} className="flex justify-center mb-8">
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-2xl shadow-accent/40"
            >
              <Zap size={56} className="text-white" />
            </motion.div>
          </motion.div>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none">
            Your Ultimate Lead Extraction Machine.
            <span className="text-gradient"> Start Today.</span>
          </motion.h2>
          <motion.div variants={fadeIn} className="mt-8">
            <a href="#pricing" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-mono text-sm uppercase tracking-wider px-10 py-5 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 animate-pulse-glow">
              Download SnapLeads <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── KEYWORD MARQUEE ─── */
function KeywordMarquee() {
  const keywords = ['Lead Extraction', 'Email Finder', 'Google Maps', 'Account Safety', 'CRM Export', 'No Proxies', 'Desktop App', 'Scheduled Runs']
  return (
    <div className="py-6 bg-dark border-t border-b border-dark-border overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 mx-4">
            {keywords.map((kw, j) => (
              <span key={`${i}-${j}`} className="font-mono text-xs uppercase tracking-widest text-gray-600 border border-dark-border px-5 py-2 rounded-full hover:text-gray-400 hover:border-gray-600 transition-colors">{kw}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-16 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Socials */}
          <div>
            <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Follow Us</h6>
            <div className="space-y-3">
              {[
                { icon: <Twitter size={16} />, name: 'X (Twitter)', href: 'https://x.com' },
                { icon: <Facebook size={16} />, name: 'Facebook', href: 'https://facebook.com' },
                { icon: <Linkedin size={16} />, name: 'LinkedIn', href: 'https://linkedin.com' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
                  {s.icon} <span className="font-mono text-xs uppercase tracking-wider">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Product</h6>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Platforms', href: '#platforms' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Download', href: '#pricing' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-white transition-colors mb-2 font-mono text-xs uppercase tracking-wider">{item.label}</a>
            ))}
          </div>
          
          {/* Support */}
          <div>
            <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Support</h6>
            {[
              { label: 'FAQ', href: '#faq' },
              { label: 'Contact', href: 'mailto:support@getsnapleads.store' },
              { label: 'Documentation', href: '#faq' },
              { label: 'Changelog', href: '#features' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-white transition-colors mb-2 font-mono text-xs uppercase tracking-wider">{item.label}</a>
            ))}
          </div>
          
          {/* Legal */}
          <div>
            <h6 className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-4">Legal</h6>
            {[
              { label: 'Privacy Policy', href: '#privacy' },
              { label: 'Terms of Service', href: '#terms' },
              { label: 'Refund Policy', href: '#faq' },
              { label: 'License Agreement', href: '#license' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="block text-gray-500 hover:text-white transition-colors mb-2 font-mono text-xs uppercase tracking-wider">{item.label}</a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="SnapLeads" className="w-8 h-8 rounded-lg" />
            <span className="font-mono font-bold text-sm tracking-wider uppercase text-white">SnapLeads</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600">&copy; 2026 SnapLeads. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/* ─── LANDING PAGE ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Hero />
      <Stats />
      <WhoWeAre />
      <AutoDemoVideo />
      <AppDemo />
      <Features />
      <Platforms />
      <Pricing />
      <Testimonial />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <KeywordMarquee />
      <Footer />
    </div>
  )
}
