const SUPABASE_URL = process.env.SUPABASE_URL || "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  const authHeader = req.headers.authorization;
  const hasSecret = secret && (req.headers["x-api-secret"] === secret || req.query.secret === secret);
  const hasJwt = authHeader && authHeader.startsWith("Bearer ");
  if (!hasSecret && !hasJwt) return res.status(401).json({ error: "Unauthorized" });

  const advisorId = req.query.advisorId;
  if (!advisorId) return res.status(400).json({ error: "Missing advisorId" });

  // Validate advisorId format
  if (!/^[\w-]+$/.test(advisorId)) return res.status(400).json({ error: "Invalid advisorId" });

  try {
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/advisor_tokens?advisor_id=eq.${encodeURIComponent(advisorId)}&select=google_email,expires_at,scopes`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await sbRes.json();
    if (data.length > 0) {
      const gmailEnabled = (data[0].scopes || "").includes("gmail.send");
      res.status(200).json({ connected: true, email: data[0].google_email, gmailEnabled });
    } else {
      res.status(200).json({ connected: false, gmailEnabled: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
