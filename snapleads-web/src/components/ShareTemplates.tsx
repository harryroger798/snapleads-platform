import { useState } from "react";
import { Copy, CheckCircle, ChevronDown, MessageSquare } from "lucide-react";

interface ShareTemplatesProps {
  isDark: boolean;
  licenseKeys: Array<{ key: string; plan: string }>;
}

const DOWNLOAD_URL_WIN = "https://social-lead-test-096938.s3.us-east-1.amazonaws.com/v2.3.0/SnapLeads-Setup-2.3.0.exe";
const DOWNLOAD_URL_MAC = "https://social-lead-test-096938.s3.us-east-1.amazonaws.com/v2.3.0/SnapLeads-2.3.0-arm64-mac.zip";
const DOWNLOAD_URL_LINUX = "https://social-lead-test-096938.s3.us-east-1.amazonaws.com/v2.3.0/SnapLeads-2.3.0.AppImage";
const VT_SCAN_URL_WIN = "https://www.virustotal.com/gui/file/93ab1e4dd35733732e48ea897961c1baeff1daaceb995b9a74dcec523e907711";
const VT_SCAN_URL_MAC = "https://www.virustotal.com/gui/file/1c1589cf0bf758ccb3cbc81b14cc7c792dca23cb0023fdee91287ce4689ba628";
const VT_SCAN_URL_LINUX = "https://www.virustotal.com/gui/file/35455b9df3fe5cbc73bac269c72d3973a2a7c25fb9b20bec738be4816fd5b2e7";

interface PlatformTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  format: (key: string, plan: string) => string;
}

const platforms: PlatformTemplate[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "\u{1F4F1}",
    color: "from-green-500 to-emerald-600",
    format: (key, plan) =>
`Hey! Your *SnapLeads ${plan}* license is ready.

*License Key:*
\`${key}\`

*Download Links:*
Windows: ${DOWNLOAD_URL_WIN}
macOS: ${DOWNLOAD_URL_MAC}
Linux: ${DOWNLOAD_URL_LINUX}

*How to activate:*
1. Download for your OS above
2. Install & open SnapLeads
3. Paste your license key
4. Click "Activate"
5. Done! Start extracting leads

*Bypass tips:*
Windows: Click "More info" > "Run anyway"
macOS: Right-click > Open > Open
Linux: chmod +x then run

App is 100% safe - verified on VirusTotal (0/95 clean):
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

Need help? Just reply here.`,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "\u{2708}\u{FE0F}",
    color: "from-blue-400 to-blue-600",
    format: (key, plan) =>
`**Your SnapLeads ${plan} License**

**License Key:**
\`${key}\`

**Download Links:**
Windows (.exe): ${DOWNLOAD_URL_WIN}
macOS (.zip): ${DOWNLOAD_URL_MAC}
Linux (.AppImage): ${DOWNLOAD_URL_LINUX}

**Setup Instructions:**
1. Download for your operating system
2. Install and open SnapLeads
3. Paste your license key
4. Click "Activate"
5. Done! Start extracting leads

**Security bypass:**
Windows: Click "More info" > "Run anyway"
macOS: Right-click > Open > Open again
Linux: chmod +x SnapLeads-2.3.0.AppImage && ./SnapLeads-2.3.0.AppImage

Verified safe on VirusTotal (0/95):
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

Questions? Message me here.`,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "\u{1F4F7}",
    color: "from-pink-500 to-purple-600",
    format: (key, plan) =>
`Hey! Your SnapLeads ${plan} license is ready

Your License Key:
${key}

Download links:
Windows: ${DOWNLOAD_URL_WIN}
macOS: ${DOWNLOAD_URL_MAC}
Linux: ${DOWNLOAD_URL_LINUX}

How to set up:
1. Download for your OS
2. Install and open SnapLeads
3. Paste your license key
4. Click Activate
5. You're all set!

Security warning? Windows: More info > Run anyway. macOS: Right-click > Open. Linux: chmod +x then run

App verified safe (0/95 on VirusTotal):
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

DM me if you need any help`,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "\u{1F44D}",
    color: "from-blue-600 to-blue-800",
    format: (key, plan) =>
`Hi! Your SnapLeads ${plan} license is ready.

Your License Key: ${key}

Download Links:
Windows: ${DOWNLOAD_URL_WIN}
macOS: ${DOWNLOAD_URL_MAC}
Linux: ${DOWNLOAD_URL_LINUX}

How to get started:
1. Download the app for your operating system
2. Install and open SnapLeads
3. Paste your license key
4. Click "Activate"
5. Done! Start extracting leads

If you see a security warning:
- Windows: Click "More info" then "Run anyway"
- macOS: Right-click the app > "Open" > "Open" again
- Linux: Run chmod +x on the AppImage first

The app is verified safe on VirusTotal (0/95 clean):
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

Let me know if you need any help!`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "\u{1F4BC}",
    color: "from-blue-700 to-blue-900",
    format: (key, plan) =>
`Hi,

Your SnapLeads ${plan} license has been activated. Please find your details below:

License Key: ${key}

Download Links:
- Windows (.exe): ${DOWNLOAD_URL_WIN}
- macOS (.zip): ${DOWNLOAD_URL_MAC}
- Linux (.AppImage): ${DOWNLOAD_URL_LINUX}

Getting Started:
1. Download the installer for your operating system
2. Run the installer and follow the setup instructions
3. Launch SnapLeads and enter your license key
4. Click "Activate" to verify your license
5. You're ready to start extracting leads

Security Notes:
- Windows: If SmartScreen shows a warning, click "More info" then "Run anyway"
- macOS: Right-click the app > "Open" > "Open" again to bypass Gatekeeper
- Linux: Make the AppImage executable with chmod +x before running

The application has been verified safe on VirusTotal (0/95 detections):
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

Please don't hesitate to reach out if you need any assistance.

Best regards`,
  },
  {
    id: "discord",
    name: "Discord",
    icon: "\u{1F3AE}",
    color: "from-indigo-500 to-indigo-700",
    format: (key, plan) =>
`**Your SnapLeads ${plan} License**

\`\`\`
${key}
\`\`\`

**Download Links:**
Windows: <${DOWNLOAD_URL_WIN}>
macOS: <${DOWNLOAD_URL_MAC}>
Linux: <${DOWNLOAD_URL_LINUX}>

**Quick Setup:**
1. Download for your OS
2. Install & open SnapLeads
3. Paste your key above
4. Click **Activate**
5. Done!

> **Bypass tips:**
> Windows: \`More info\` > \`Run anyway\`
> macOS: Right-click > Open > Open
> Linux: \`chmod +x\` then run

Verified safe on VirusTotal (0/95):
[Windows](${VT_SCAN_URL_WIN}) | [macOS](${VT_SCAN_URL_MAC}) | [Linux](${VT_SCAN_URL_LINUX})

Need help? Ping me here.`,
  },
  {
    id: "email",
    name: "Email",
    icon: "\u{2709}\u{FE0F}",
    color: "from-slate-600 to-slate-800",
    format: (key, plan) =>
`Subject: Your SnapLeads ${plan} License Key

Hi,

Thank you for your purchase! Your SnapLeads ${plan} license is now ready.

LICENSE KEY: ${key}

DOWNLOAD LINKS:
- Windows (.exe): ${DOWNLOAD_URL_WIN}
- macOS (.zip): ${DOWNLOAD_URL_MAC}
- Linux (.AppImage): ${DOWNLOAD_URL_LINUX}

GETTING STARTED:

Step 1: Download the installer for your operating system using the links above.

Step 2: Install the application
- Windows: Run the .exe file and follow the installation wizard
- macOS: Extract the .zip, drag SnapLeads.app to Applications
- Linux: Make the AppImage executable (chmod +x) and run it

Step 3: Activate your license
Launch SnapLeads, enter your license key, and click "Activate."

Step 4: Start extracting leads!
Your license is now active. Enjoy using SnapLeads!

SECURITY NOTES:
- Windows: If SmartScreen shows a warning, click "More info" then "Run anyway." This is normal for new software.
- macOS: If Gatekeeper blocks the app, right-click > "Open" > "Open" again, or go to System Settings > Privacy & Security > "Open Anyway"
- Linux: If FUSE is needed, install with: sudo apt install fuse libfuse2
- If your antivirus flags the file, add SnapLeads to your exceptions list.

The app has been verified safe on VirusTotal with 0/95 detections:
Windows: ${VT_SCAN_URL_WIN}
macOS: ${VT_SCAN_URL_MAC}
Linux: ${VT_SCAN_URL_LINUX}

Need help? Reply to this email and we'll assist you promptly.

Best regards,
SnapLeads Support Team`,
  },
];

export default function ShareTemplates({ isDark, licenseKeys }: ShareTemplatesProps) {
  const [selectedKey, setSelectedKey] = useState<string>(licenseKeys.length > 0 ? licenseKeys[0].key : "");
  const [selectedPlan, setSelectedPlan] = useState<string>(licenseKeys.length > 0 ? licenseKeys[0].plan : "starter");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>("whatsapp");

  const t = {
    card: isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm",
    cardInner: isDark ? "bg-slate-900/50" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textMuted: isDark ? "text-slate-500" : "text-slate-500",
    border: isDark ? "border-slate-700/50" : "border-slate-200",
    selectInput: isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-300" : "bg-white border-slate-300 text-slate-700",
    codeBg: isDark ? "bg-slate-900/80 text-slate-300" : "bg-slate-100 text-slate-800",
    platformBtn: isDark ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-50 hover:bg-slate-100",
  };

  const handleCopy = (platformId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(platformId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleKeySelect = (keyStr: string) => {
    setSelectedKey(keyStr);
    const found = licenseKeys.find(k => k.key === keyStr);
    if (found) setSelectedPlan(found.plan);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className={`${t.card} rounded-xl p-6`}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${t.textPrimary}`}>Share Templates</h3>
            <p className={`${t.textSecondary} text-sm mt-1`}>
              Ready-to-copy messages for all platforms. Select a license key, pick a platform, and copy.
            </p>
          </div>
        </div>

        {/* Key Selector */}
        {licenseKeys.length > 0 ? (
          <div>
            <label className={`block text-sm font-medium ${t.textSecondary} mb-2`}>Select License Key</label>
            <select
              value={selectedKey}
              onChange={(e) => handleKeySelect(e.target.value)}
              className={`w-full px-4 py-2.5 ${t.selectInput} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono`}
            >
              {licenseKeys.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.key} ({k.plan})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={`${t.cardInner} rounded-lg p-4 text-center`}>
            <p className={`${t.textSecondary} text-sm`}>
              No license keys available. Generate keys first, then come back here to share them.
            </p>
          </div>
        )}
      </div>

      {/* Platform Templates */}
      {selectedKey && (
        <div className="space-y-3">
          {platforms.map((platform) => {
            const templateText = platform.format(selectedKey, selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1));
            const isExpanded = expandedPlatform === platform.id;
            const isCopied = copiedId === platform.id;

            return (
              <div key={platform.id} className={`${t.card} rounded-xl overflow-hidden`}>
                {/* Platform Header */}
                <button
                  onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition hover:opacity-90`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center text-lg`}>
                      {platform.icon}
                    </div>
                    <span className={`font-semibold text-sm ${t.textPrimary}`}>{platform.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCopied && (
                      <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Copied!
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 ${t.textMuted} transition ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Template Content */}
                {isExpanded && (
                  <div className={`px-5 pb-5 border-t ${t.border}`}>
                    <div className={`${t.codeBg} rounded-lg p-4 mt-4 text-sm font-mono whitespace-pre-wrap break-words max-h-80 overflow-y-auto`}>
                      {templateText}
                    </div>
                    <button
                      onClick={() => handleCopy(platform.id, templateText)}
                      className={`mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                      }`}
                    >
                      {isCopied ? (
                        <><CheckCircle className="w-4 h-4" /> Copied to Clipboard</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy Message</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
