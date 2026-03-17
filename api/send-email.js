const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const LOGO_URL = "https://gni-onboarding.vercel.app/logo-gni.png";

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHtml(message, portalLink, clientName) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const safeLink = portalLink ? encodeURI(portalLink) : "";
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

// ── Gmail helpers ──

async function getAdvisorTokens(advisorId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/advisor_tokens?advisor_id=eq.${encodeURIComponent(advisorId)}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function refreshAccessToken(advisorId, refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Token refresh failed");

  await fetch(`${SUPABASE_URL}/rest/v1/advisor_tokens?advisor_id=eq.${encodeURIComponent(advisorId)}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      access_token: data.access_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }),
  });

  return data.access_token;
}

function buildRawEmail(from, to, subject, htmlBody) {
  const boundary = "boundary_" + Date.now();
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(htmlBody).toString("base64").replace(/(.{76})/g, "$1\n"),
    "",
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}

async function sendViaGmail(advisorId, to, subject, html) {
  const tokens = await getAdvisorTokens(advisorId);
  if (!tokens?.refresh_token) return null; // No Google → caller will fallback to Resend

  let accessToken = tokens.access_token;
  if (new Date(tokens.expires_at) < new Date()) {
    accessToken = await refreshAccessToken(advisorId, tokens.refresh_token);
  }

  const raw = buildRawEmail(tokens.google_email, to, subject, html);
  const base64url = Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64url }),
  });

  if (!gmailRes.ok) {
    const err = await gmailRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Gmail send failed");
  }

  const data = await gmailRes.json();
  return { success: true, id: data.id, via: "gmail" };
}

async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) throw new Error("Resend not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Resend error");
  return { success: true, id: data.id, via: "resend" };
}

// ── Main handler ──

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.API_SECRET;
  const authHeader = req.headers.authorization;
  const hasSecret = secret && (req.headers["x-api-secret"] === secret || req.query.secret === secret);
  const hasJwt = authHeader && authHeader.startsWith("Bearer ");
  if (!hasSecret && !hasJwt) return res.status(401).json({ error: "Unauthorized" });

  const { advisorId, to, clientName, message, portalLink } = req.body;
  if (!to || !clientName || !message) return res.status(400).json({ error: "Missing: to, clientName, message" });
  if (!to.includes("@") || !to.includes(".")) return res.status(400).json({ error: "Invalid email address" });

  const subject = `GNI - Dossier d'adhésion de ${escapeHtml(clientName)}`;
  const html = buildHtml(message, portalLink, clientName);

  try {
    // Try Gmail first if advisorId provided
    if (advisorId) {
      const gmailResult = await sendViaGmail(advisorId, to, subject, html);
      if (gmailResult) return res.status(200).json(gmailResult);
      // null = no Google tokens → fallback to Resend
    }

    // Fallback: Resend
    const resendResult = await sendViaResend(to, subject, html);
    res.status(200).json(resendResult);
  } catch (err) {
    console.error("send-email error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};
