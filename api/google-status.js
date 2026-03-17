const SUPABASE_URL = "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdWVxaXd4aGxqaG91cXNqcXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODYzNzYsImV4cCI6MjA4ODY2MjM3Nn0.I1SqvRG3-boMOd2F9SW0yyZG5iFMAwjGHvsxadOOjg0";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.headers["x-api-secret"] !== secret) return res.status(401).json({ error: "Unauthorized" });

  const advisorId = req.query.advisorId;
  if (!advisorId) return res.status(400).json({ error: "Missing advisorId" });

  // Validate advisorId format
  if (!/^[\w-]+$/.test(advisorId)) return res.status(400).json({ error: "Invalid advisorId" });

  try {
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/advisor_tokens?advisor_id=eq.${encodeURIComponent(advisorId)}&select=google_email,expires_at`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await sbRes.json();
    if (data.length > 0) {
      res.status(200).json({ connected: true, email: data[0].google_email });
    } else {
      res.status(200).json({ connected: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
