const LOGO_URL = "https://gni-onboarding.vercel.app/logo-gni.png";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const ALLOWED_ORIGINS = [
  "https://gni-portail.vercel.app",
  "https://gni-onboarding.vercel.app",
];

// Map advisor first names to emails
const ADVISOR_EMAILS = {
  "Sandra": "sandrausai@gnimmo.com",
  "Loïc": "loic@gnimmo.com",
  "Heliot": "heliot@gnimmo.com",
  "Marie": "marie@gnimmo.com",
  "Dorian": "dorian@gni-reseau.fr",
};

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHtml(clientName, fileName) {
  const safeName = escapeHtml(clientName);
  const safeFile = escapeHtml(fileName);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#ffffff;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #2d7dd2;">
          <img src="${LOGO_URL}" alt="Groupe National de l'Immobilier" width="200" style="display:block;margin:0 auto 12px;max-width:200px;height:auto;" />
          <p style="color:#999;font-size:13px;margin:0;letter-spacing:0.5px;">Votre partenaire immobilier de confiance</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px;">
          <h2 style="color:#1a3a5c;font-size:20px;font-weight:700;margin:0 0 8px;">Nouveau document reçu</h2>
          <div style="width:50px;height:3px;background:linear-gradient(90deg,#2d7dd2,#48b5e0);border-radius:2px;margin-bottom:24px;"></div>
          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">
            L'agence <strong>${safeName}</strong> vient de déposer un nouveau document sur son dossier d'adhésion :
          </p>
          <div style="padding:16px 20px;background:#f0f7ff;border-radius:10px;border-left:4px solid #2d7dd2;margin-bottom:28px;">
            <p style="color:#1a3a5c;font-size:15px;font-weight:600;margin:0;">${safeFile}</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://gni-onboarding.vercel.app" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#2d7dd2,#48b5e0);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
                Voir le dossier &rarr;
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #e8ecf0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#999;font-size:11px;line-height:1.5;">
                <strong style="color:#666;">GNI - Groupe National de l'Immobilier</strong><br/>
                Réseau de professionnels de l'immobilier
              </td>
              <td align="right" style="color:#bbb;font-size:11px;">
                Email envoyé automatiquement
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  // CORS — restrict to known origins
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return res.status(500).json({ error: "Email not configured" });

  const { clientId, fileName } = req.body;
  if (!clientId || !fileName) return res.status(400).json({ error: "Missing: clientId, fileName" });

  // Validate clientId format (alphanumeric/dash/underscore only)
  if (!/^[\w-]+$/.test(clientId)) return res.status(400).json({ error: "Invalid clientId" });

  try {
    // Fetch client info from Supabase
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}&select=name,advisor`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const clients = await sbRes.json();
    if (!clients || clients.length === 0) return res.status(404).json({ error: "Client not found" });

    const client = clients[0];
    const advisorEmail = ADVISOR_EMAILS[client.advisor];
    if (!advisorEmail) return res.status(400).json({ error: "Unknown advisor" });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: fromEmail,
        to: [advisorEmail],
        subject: `Nouveau document de ${escapeHtml(client.name)}`,
        html: buildHtml(client.name, fileName),
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: "Email sending failed" });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
