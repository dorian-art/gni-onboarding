const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { code, state: advisorId } = req.query;
  if (!code || !advisorId) return res.status(400).json({ error: "Missing code or advisorId" });

  // Validate advisorId format
  if (!/^[\w-]+$/.test(advisorId)) return res.status(400).json({ error: "Invalid advisorId" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).json({ error: "Google OAuth not configured" });

  const redirectUri = "https://gni-onboarding.vercel.app/api/google-callback";

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(400).send(`<html><body><h2>Erreur de connexion Google</h2><p>Échec de l'authentification</p><script>setTimeout(()=>window.close(),3000)</script></body></html>`);
    }

    // Get user email for display
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    // Store tokens in Supabase (upsert by advisorId)
    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/advisor_tokens`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        advisor_id: advisorId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        google_email: userInfo.email || "",
        scopes: tokens.scope || "",
      }),
    });

    if (!upsertRes.ok) {
      console.error("Supabase upsert error:", await upsertRes.text());
      return res.status(500).send(`<html><body><h2>Erreur de sauvegarde</h2><p>Impossible de sauvegarder les tokens</p></body></html>`);
    }

    const safeEmail = escapeHtml(userInfo.email || "connecté");

    // Success page that auto-closes
    res.status(200).send(`
      <html>
        <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f7;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,.1);">
            <h2 style="color: #1d1d1f; margin: 0 0 8px;">Google Drive connecté !</h2>
            <p style="color: #86868b; margin: 0;">Compte : ${safeEmail}</p>
            <p style="color: #aeaeb2; margin-top: 16px; font-size: 13px;">Cette fenêtre va se fermer automatiquement...</p>
          </div>
          <script>setTimeout(() => window.close(), 2000)</script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send(`<html><body><h2>Erreur</h2><p>Une erreur est survenue</p></body></html>`);
  }
};
