module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.query.secret !== secret) return res.status(401).json({ error: "Unauthorized" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });

  const advisorId = req.query.advisorId;
  if (!advisorId) return res.status(400).json({ error: "Missing advisorId" });

  // Validate advisorId format
  if (!/^[\w-]+$/.test(advisorId)) return res.status(400).json({ error: "Invalid advisorId" });

  const redirectUri = "https://gni-onboarding.vercel.app/api/google-callback";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
    state: advisorId,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
