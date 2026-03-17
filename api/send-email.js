const LOGO_URL = "https://gni-onboarding.vercel.app/logo-gni.png";

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHtml(message, portalLink, clientName) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const safeName = escapeHtml(clientName);
  const safeLink = portalLink ? encodeURI(portalLink) : "";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:#ffffff;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #2d7dd2;">
          <img src="${LOGO_URL}" alt="Groupe National de l'Immobilier" width="200" style="display:block;margin:0 auto 12px;max-width:200px;height:auto;" />
          <p style="color:#999;font-size:13px;margin:0;letter-spacing:0.5px;">Votre partenaire immobilier de confiance</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:40px;">
          <h2 style="color:#1a3a5c;font-size:20px;font-weight:700;margin:0 0 8px;">Dossier d'adhésion</h2>
          <div style="width:50px;height:3px;background:linear-gradient(90deg,#2d7dd2,#48b5e0);border-radius:2px;margin-bottom:24px;"></div>

          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 28px;">${safeMessage}</p>

          ${safeLink ? `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${safeLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#2d7dd2,#48b5e0);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
                Accéder à mon dossier &rarr;
              </a>
            </td></tr>
          </table>` : ""}

          <div style="margin-top:32px;padding:20px;background:#f8fafc;border-radius:10px;border-left:4px solid #2d7dd2;">
            <p style="color:#666;font-size:13px;line-height:1.6;margin:0;">
              <strong style="color:#1a3a5c;">Besoin d'aide ?</strong><br/>
              Notre équipe est disponible pour vous accompagner dans la complétion de votre dossier. N'hésitez pas à nous contacter.
            </p>
          </div>
        </td></tr>

        <!-- FOOTER -->
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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.headers["x-api-secret"] !== secret) return res.status(401).json({ error: "Unauthorized" });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return res.status(500).json({ error: "Email not configured" });

  const { to, clientName, message, portalLink } = req.body;
  if (!to || !clientName || !message) return res.status(400).json({ error: "Missing: to, clientName, message" });

  // Basic email format validation
  if (!to.includes("@") || !to.includes(".")) return res.status(400).json({ error: "Invalid email address" });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: `GNI - Dossier d'adhésion de ${escapeHtml(clientName)}`,
        html: buildHtml(message, portalLink, clientName),
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "Resend error" });
    res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
