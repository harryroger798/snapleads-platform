import { useState } from "react";
import { Download, Monitor, Shield, CheckCircle, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface DownloadSectionProps {
  isDark: boolean;
}

const DOWNLOAD_WIN = "https://f005.backblazeb2.com/file/snapleads-downloads/v3.5.2/SnapLeads%20Setup%203.5.2.exe";
const DOWNLOAD_MAC = "https://f005.backblazeb2.com/file/snapleads-downloads/v3.5.2/SnapLeads-3.5.2-arm64-mac.zip";
const DOWNLOAD_LINUX = "https://f005.backblazeb2.com/file/snapleads-downloads/v3.5.2/SnapLeads-3.5.2.AppImage";
const VERSION = "3.5.2";

type OSTab = "windows" | "macos" | "linux";

const VT_SCAN_URLS: Record<OSTab, string> = {
    windows: "https://www.virustotal.com/gui/file/4d1b9ee4d450e45c1ea01657957c08e27bf7e24233082f66dea4867409ead789",
    macos: "https://www.virustotal.com/gui/file/9bde0b808db5cda641104b7bc2072fab594575c5902979056cf2b3454970fad4",
    linux: "https://www.virustotal.com/gui/file/cd7763eb3c850319e044026afcccf3338c607e05c93b17e7b69c31f4aab625f0",
};

interface BypassGuide {
  id: string;
  title: string;
  icon: string;
  os: OSTab | "all";
  steps: string[];
}

const bypassGuides: BypassGuide[] = [
  {
    id: "smartscreen",
    title: "Windows SmartScreen Warning",
    icon: "\u{1F6E1}\u{FE0F}",
    os: "windows",
    steps: [
      "When you see \"Windows protected your PC\" \u2014 click \"More info\"",
      "Click \"Run anyway\" to proceed with installation",
      "This appears because the app is new and not yet widely distributed \u2014 it is completely safe",
    ],
  },
  {
    id: "chrome",
    title: "Chrome / Edge Download Warning",
    icon: "\u{1F310}",
    os: "all",
    steps: [
      "If Chrome shows \"file is not commonly downloaded\" \u2014 click the \"^\" arrow next to Discard",
      "Select \"Keep\" to save the file",
      "In Edge: click \"...\" (three dots) then \"Keep\" then \"Keep anyway\"",
    ],
  },
  {
    id: "antivirus",
    title: "Antivirus / Windows Defender",
    icon: "\u{1F512}",
    os: "windows",
    steps: [
      "Open Windows Security then Virus & threat protection then Protection history",
      "Find the blocked file and click \"Actions\" then \"Allow on device\"",
      "Or: Go to Settings then Exclusions then Add the SnapLeads install folder",
      "The app is clean \u2014 verify yourself on VirusTotal (link below)",
    ],
  },
  {
    id: "firewall",
    title: "Firewall Blocking Connection",
    icon: "\u{1F9F1}",
    os: "windows",
    steps: [
      "Open Windows Defender Firewall then \"Allow an app through firewall\"",
      "Click \"Change settings\" then \"Allow another app\" then Browse to SnapLeads.exe",
      "Check both \"Private\" and \"Public\" network boxes then click OK",
      "SnapLeads needs internet access for license activation and data extraction",
    ],
  },
  {
    id: "gatekeeper",
    title: "macOS Gatekeeper Warning",
    icon: "\u{1F34E}",
    os: "macos",
    steps: [
      "After extracting the .zip, drag SnapLeads.app to your Applications folder",
      "Double-click to open \u2014 if macOS blocks it, click \"Cancel\"",
      "Go to System Settings > Privacy & Security > scroll down to find \"SnapLeads was blocked\"",
      "Click \"Open Anyway\" and enter your password to confirm",
      "Alternatively: Right-click (or Control-click) the app > click \"Open\" > click \"Open\" again",
    ],
  },
  {
    id: "mac-quarantine",
    title: "macOS Quarantine / Damaged Error",
    icon: "\u{1F6A7}",
    os: "macos",
    steps: [
      "If macOS says the app is \"damaged and can't be opened\" \u2014 this is a quarantine flag, not actual damage",
      "Open Terminal (Applications > Utilities > Terminal)",
      "Run: xattr -cr /Applications/SnapLeads.app",
      "Try opening the app again \u2014 it should now work without issues",
      "This removes the quarantine attribute that macOS adds to downloaded files",
    ],
  },
  {
    id: "mac-firewall",
    title: "macOS Firewall / Network Access",
    icon: "\u{1F525}",
    os: "macos",
    steps: [
      "If macOS asks \"Do you want SnapLeads to accept incoming connections?\" \u2014 click \"Allow\"",
      "Go to System Settings > Network > Firewall > Options",
      "Make sure SnapLeads is listed and set to \"Allow incoming connections\"",
      "SnapLeads needs internet access for license activation and data extraction",
    ],
  },
  {
    id: "linux-appimage",
    title: "Linux AppImage Setup",
    icon: "\u{1F427}",
    os: "linux",
    steps: [
      "Download the .AppImage file to your desired location (e.g., ~/Applications/)",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          "Make it executable: chmod +x SnapLeads-3.5.2.AppImage",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "Run it: ./SnapLeads-3.5.2.AppImage",
      "Or right-click the file > Properties > Permissions > check \"Allow executing file as program\"",
      "Then double-click to launch",
    ],
  },
  {
    id: "linux-fuse",
    title: "Linux FUSE / AppImage Error",
    icon: "\u{26A0}\u{FE0F}",
    os: "linux",
    steps: [
      "If you see \"AppImages require FUSE to run\" \u2014 install FUSE first",
      "Ubuntu/Debian: sudo apt install fuse libfuse2",
      "Fedora: sudo dnf install fuse fuse-libs",
      "Arch: sudo pacman -S fuse2",
      "After installing FUSE, try running the AppImage again",
      "Alternative: Extract with --appimage-extract then run squashfs-root/AppRun",
    ],
  },
  {
    id: "linux-security",
    title: "Linux SELinux / AppArmor Blocking",
    icon: "\u{1F510}",
    os: "linux",
    steps: [
      "If SELinux blocks execution: sudo setenforce 0 (temporary) or add a policy exception",
      "For AppArmor: sudo aa-complain /path/to/SnapLeads-3.5.2.AppImage",
      "Check logs: journalctl -xe | grep -i snapleads for specific error messages",
      "For persistent fix, create a custom SELinux/AppArmor profile for SnapLeads",
    ],
  },
  {
    id: "linux-firewall",
    title: "Linux Firewall (UFW / iptables)",
    icon: "\u{1F9F1}",
    os: "linux",
    steps: [
      "If using UFW: sudo ufw allow out to any port 443 (HTTPS for license activation)",
      "If using iptables: sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT",
      "SnapLeads needs outbound HTTPS access for license activation and data extraction",
      "Check firewall status: sudo ufw status or sudo iptables -L",
    ],
  },
];

const osInfo: Record<OSTab, { name: string; icon: string; size: string; type: string; url: string; platform: string }> = {
  windows: {
    name: "Windows",
    icon: "\u{1FA9F}",
    size: "~338 MB",
    type: "Installer (.exe)",
    url: DOWNLOAD_WIN,
    platform: "Windows 10/11 (64-bit)",
  },
  macos: {
    name: "macOS",
    icon: "\u{1F34E}",
    size: "~277 MB",
    type: "Application (.zip)",
    url: DOWNLOAD_MAC,
    platform: "macOS 11+ (Big Sur or later)",
  },
  linux: {
    name: "Linux",
    icon: "\u{1F427}",
    size: "~4.1 GB",
    type: "AppImage (.AppImage)",
    url: DOWNLOAD_LINUX,
    platform: "Ubuntu 20.04+ / Fedora 35+ / Debian 11+",
  },
};

const installSteps: Record<OSTab, string[]> = {
  windows: [
    "Download the .exe installer using the button above",
    "Run the .exe file \u2014 if SmartScreen appears, click \"More info\" then \"Run anyway\"",
    "Follow the installation wizard (click Next > Install > Finish)",
    "Launch SnapLeads from your Desktop shortcut or Start Menu",
    "Enter your license key when prompted and click \"Activate\"",
    "Done! Start extracting leads from 9+ social media platforms",
  ],
  macos: [
    "Download the .zip file using the button above",
    "Double-click the .zip to extract SnapLeads.app",
    "Drag SnapLeads.app to your Applications folder",
    "Right-click the app > click \"Open\" > click \"Open\" again (first time only)",
    "If blocked: System Settings > Privacy & Security > \"Open Anyway\"",
    "Enter your license key when prompted and click \"Activate\"",
    "Done! Start extracting leads from 9+ social media platforms",
  ],
  linux: [
    "Download the .AppImage file using the button above",
    "Open Terminal and navigate to the download location",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "Make it executable: chmod +x SnapLeads-3.5.2.AppImage",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "Run it: ./SnapLeads-3.5.2.AppImage (or double-click if FUSE is installed)",
    "If FUSE error: install with sudo apt install fuse libfuse2 (Ubuntu/Debian)",
    "Enter your license key when prompted and click \"Activate\"",
    "Done! Start extracting leads from 9+ social media platforms",
  ],
};

const sysReqs: Record<OSTab, Array<{ label: string; value: string }>> = {
  windows: [
    { label: "OS", value: "Windows 10 or 11 (64-bit)" },
    { label: "RAM", value: "4 GB minimum, 8 GB recommended" },
    { label: "Disk", value: "200 MB free space" },
    { label: "Internet", value: "Required for activation & extraction" },
  ],
  macos: [
    { label: "OS", value: "macOS 11 Big Sur or later" },
    { label: "Chip", value: "Intel or Apple Silicon (M1/M2/M3)" },
    { label: "RAM", value: "4 GB minimum, 8 GB recommended" },
    { label: "Disk", value: "250 MB free space" },
    { label: "Internet", value: "Required for activation & extraction" },
  ],
  linux: [
    { label: "OS", value: "Ubuntu 20.04+, Fedora 35+, Debian 11+" },
    { label: "Arch", value: "x86_64 (64-bit)" },
    { label: "RAM", value: "4 GB minimum, 8 GB recommended" },
    { label: "Disk", value: "300 MB free space" },
    { label: "Deps", value: "FUSE (libfuse2) for AppImage support" },
    { label: "Internet", value: "Required for activation & extraction" },
  ],
};

export default function DownloadSection({ isDark }: DownloadSectionProps) {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [selectedOS, setSelectedOS] = useState<OSTab>("windows");

  const t = {
    card: isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm",
    cardInner: isDark ? "bg-slate-900/50" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textMuted: isDark ? "text-slate-500" : "text-slate-500",
    border: isDark ? "border-slate-700/50" : "border-slate-200",
    accordionBg: isDark ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-50 hover:bg-slate-100",
    accordionContent: isDark ? "bg-slate-800/50" : "bg-white",
    vtBadgeBg: isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200",
    vtBadgeText: isDark ? "text-emerald-400" : "text-emerald-700",
    warnBg: isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200",
    warnText: isDark ? "text-amber-300" : "text-amber-700",
    tabActive: "bg-indigo-600 text-white",
    tabInactive: isDark ? "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800",
  };

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const currentOS = osInfo[selectedOS];
  const currentSteps = installSteps[selectedOS];
  const currentReqs = sysReqs[selectedOS];
  const filteredGuides = bypassGuides.filter(g => g.os === selectedOS || g.os === "all");

  return (
    <div className="max-w-3xl space-y-6">
      {/* OS Tab Selector */}
      <div className="flex gap-2">
        {(["windows", "macos", "linux"] as OSTab[]).map((os) => (
          <button
            key={os}
            onClick={() => { setSelectedOS(os); setExpandedGuide(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              selectedOS === os ? t.tabActive : t.tabInactive
            }`}
          >
            <span className="text-lg">{osInfo[os].icon}</span>
            {osInfo[os].name}
          </button>
        ))}
      </div>

      {/* Main Download Card */}
      <div className={`${t.card} rounded-xl p-8`}>
        <div className="flex items-start gap-5 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${t.textPrimary}`}>SnapLeads for {currentOS.name}</h3>
            <p className={`${t.textSecondary} text-sm mt-1`}>Desktop application for license activation and lead extraction</p>
          </div>
        </div>

        <div className={`${t.cardInner} rounded-lg p-4 mb-6`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className={`${t.textMuted} block`}>Version</span>
              <span className={`${t.textPrimary} font-semibold`}>v{VERSION}</span>
            </div>
            <div>
              <span className={`${t.textMuted} block`}>Platform</span>
              <span className={`${t.textPrimary} font-semibold`}>{currentOS.platform}</span>
            </div>
            <div>
              <span className={`${t.textMuted} block`}>Size</span>
              <span className={`${t.textPrimary} font-semibold`}>{currentOS.size}</span>
            </div>
            <div>
              <span className={`${t.textMuted} block`}>Type</span>
              <span className={`${t.textPrimary} font-semibold`}>{currentOS.type}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <a
            href={currentOS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/25 text-lg"
          >
            <Download className="w-5 h-5" />
            Download for {currentOS.name}
          </a>
        </div>

        <p className={`${t.textMuted} text-xs`}>
          Share this download link with your customers after providing their license key.
        </p>
      </div>

      {/* VirusTotal Verified Badge */}
      <div className={`${t.vtBadgeBg} border rounded-xl p-5`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold ${t.vtBadgeText} mb-1`}>VirusTotal Verified &mdash; 0/95 Clean &amp; Safe ({currentOS.name})</h4>
            <p className={`text-sm ${t.textSecondary} mb-3`}>
              All SnapLeads installers have been scanned by 95 antivirus engines on VirusTotal with <strong>0 detections</strong>.
              Click below to see the live {currentOS.name} scan report and verify for yourself.
            </p>
            <a
              href={VT_SCAN_URLS[selectedOS]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition"
            >
              <ExternalLink className="w-4 h-4" />
              View {currentOS.name} VirusTotal Report (0/95 Clean)
            </a>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className={`${t.card} rounded-xl p-6`}>
        <h4 className={`${t.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
          <Monitor className="w-4 h-4" /> {currentOS.name} System Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {currentReqs.map((req) => (
            <div key={req.label} className={`flex items-center gap-2 ${t.textSecondary}`}>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span><strong className={t.textPrimary}>{req.label}:</strong> {req.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Installation Steps */}
      <div className={`${t.card} rounded-xl p-6`}>
        <h4 className={`${t.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
          <Shield className="w-4 h-4" /> {currentOS.name} Installation &amp; Activation Steps
        </h4>
        <ol className={`space-y-3 text-sm ${t.textSecondary}`}>
          {currentSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Bypass / Troubleshooting Guides */}
      <div className={`${t.card} rounded-xl p-6`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h4 className={`${t.textPrimary} font-semibold`}>{currentOS.name} Bypass &amp; Troubleshooting</h4>
        </div>
        <p className={`${t.textSecondary} text-sm mb-4`}>
          Some systems may show security warnings for new software. Here is how to fix them on {currentOS.name}:
        </p>

        <div className="space-y-2">
          {filteredGuides.map((guide) => (
            <div key={guide.id} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGuide(guide.id)}
                className={`w-full flex items-center justify-between px-4 py-3 ${t.accordionBg} rounded-lg transition text-left`}
              >
                <span className={`flex items-center gap-3 text-sm font-medium ${t.textPrimary}`}>
                  <span className="text-lg">{guide.icon}</span>
                  {guide.title}
                </span>
                {expandedGuide === guide.id ? (
                  <ChevronUp className={`w-4 h-4 ${t.textMuted}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${t.textMuted}`} />
                )}
              </button>
              {expandedGuide === guide.id && (
                <div className={`${t.accordionContent} px-4 py-3 border-t ${t.border}`}>
                  <ol className={`space-y-2 text-sm ${t.textSecondary}`}>
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`font-bold ${t.textMuted} flex-shrink-0`}>{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Note */}
      <div className={`${t.warnBg} border rounded-xl p-4`}>
        <p className={`text-sm ${t.warnText}`}>
          <strong>Why do I see warnings?</strong> Our app is newly released and has not yet built a reputation
          with {selectedOS === "windows" ? "Microsoft SmartScreen" : selectedOS === "macos" ? "macOS Gatekeeper" : "your system's security"} or browser download scanners. This is normal for all new software.
          The installer is digitally built with Electron{selectedOS === "windows" ? " and NSIS" : ""} &mdash; verify on{" "}
          <a href={VT_SCAN_URLS[selectedOS]} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:no-underline">VirusTotal (0/95 Clean)</a>.
        </p>
      </div>
    </div>
  );
}
