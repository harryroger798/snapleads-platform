import { useState } from "react";
import { Download, Monitor, Shield, CheckCircle, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface DownloadSectionProps {
  isDark: boolean;
}

const DOWNLOAD_WIN = "https://f005.backblazeb2.com/file/snapleads-downloads/SnapLeads%20Setup%203.5.76.exe";
const VERSION = "3.5.76";

const VT_SCAN_URL = "https://www.virustotal.com/gui/file/354e0edc073d142a5a9492d1ab40e0e5e9d44fab156ee699daf17e9c41a7c52b";

interface BypassGuide {
  id: string;
  title: string;
  icon: string;
  steps: string[];
}

const bypassGuides: BypassGuide[] = [
  {
    id: "smartscreen",
    title: "Windows SmartScreen Warning",
    icon: "\u{1F6E1}\u{FE0F}",
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
    steps: [
      "Open Windows Defender Firewall then \"Allow an app through firewall\"",
      "Click \"Change settings\" then \"Allow another app\" then Browse to SnapLeads.exe",
      "Check both \"Private\" and \"Public\" network boxes then click OK",
      "SnapLeads needs internet access for license activation and data extraction",
    ],
  },
];

const osInfo = {
  name: "Windows",
  icon: "\u{1FA9F}",
  size: "~330 MB",
  type: "Installer (.exe)",
  url: DOWNLOAD_WIN,
  platform: "Windows 10/11 (64-bit)",
};

const installSteps = [
  "Download the .exe installer using the button above",
  "Run the .exe file \u2014 if SmartScreen appears, click \"More info\" then \"Run anyway\"",
  "Follow the installation wizard (click Next > Install > Finish)",
  "Launch SnapLeads from your Desktop shortcut or Start Menu",
  "Enter your license key when prompted and click \"Activate\"",
  "Done! Start extracting leads from 9+ social media platforms",
];

const sysReqs = [
  { label: "OS", value: "Windows 10 or 11 (64-bit)" },
  { label: "RAM", value: "4 GB minimum, 8 GB recommended" },
  { label: "Disk", value: "200 MB free space" },
  { label: "Internet", value: "Required for activation & extraction" },
];

export default function DownloadSection({ isDark }: DownloadSectionProps) {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

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
  };

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Main Download Card */}
      <div className={`${t.card} rounded-xl p-8`}>
        <div className="flex items-start gap-5 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${t.textPrimary}`}>SnapLeads for {osInfo.name}</h3>
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
              <span className={`${t.textPrimary} font-semibold`}>{osInfo.platform}</span>
            </div>
            <div>
              <span className={`${t.textMuted} block`}>Size</span>
              <span className={`${t.textPrimary} font-semibold`}>{osInfo.size}</span>
            </div>
            <div>
              <span className={`${t.textMuted} block`}>Type</span>
              <span className={`${t.textPrimary} font-semibold`}>{osInfo.type}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <a
            href={osInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/25 text-lg"
          >
            <Download className="w-5 h-5" />
            Download for {osInfo.name}
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
            <h4 className={`font-semibold ${t.vtBadgeText} mb-1`}>VirusTotal Verified &mdash; 0/95 Clean &amp; Safe</h4>
            <p className={`text-sm ${t.textSecondary} mb-3`}>
              All SnapLeads installers have been scanned by 95 antivirus engines on VirusTotal with <strong>0 detections</strong>.
              Click below to see the live scan report and verify for yourself.
            </p>
            <a
              href={VT_SCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition"
            >
              <ExternalLink className="w-4 h-4" />
              View Windows VirusTotal Report (0/95 Clean)
            </a>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className={`${t.card} rounded-xl p-6`}>
        <h4 className={`${t.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
          <Monitor className="w-4 h-4" /> Windows System Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {sysReqs.map((req) => (
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
          <Shield className="w-4 h-4" /> Windows Installation &amp; Activation Steps
        </h4>
        <ol className={`space-y-3 text-sm ${t.textSecondary}`}>
          {installSteps.map((step, i) => (
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
          <h4 className={`${t.textPrimary} font-semibold`}>Windows Bypass &amp; Troubleshooting</h4>
        </div>
        <p className={`${t.textSecondary} text-sm mb-4`}>
          Some systems may show security warnings for new software. Here is how to fix them on Windows:
        </p>

        <div className="space-y-2">
          {bypassGuides.map((guide) => (
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
          with Microsoft SmartScreen or browser download scanners. This is normal for all new software.
          The installer is digitally built with Electron and NSIS &mdash; verify on{" "}
          <a href={VT_SCAN_URL} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:no-underline">VirusTotal (0/95 Clean)</a>.
        </p>
      </div>
    </div>
  );
}
