export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check
  const secret = process.env.API_SECRET;
  const authHeader = req.headers.authorization;
  const hasSecret = secret && (req.headers["x-api-secret"] === secret || req.query.secret === secret);
  const hasJwt = authHeader && authHeader.startsWith("Bearer ");
  if (!hasSecret && !hasJwt) return res.status(401).json({ error: "Unauthorized" });

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const callId = req.query.callId;
  if (!callId) {
    return res.status(400).json({ error: "callId is required" });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/voice_calls?vapi_call_id=eq.${encodeURIComponent(callId)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch call status" });
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Call not found" });
    }

    const call = data[0];
    return res.status(200).json({
      callId: call.vapi_call_id,
      status: call.status,
      durationSeconds: call.duration_seconds,
      transcript: call.transcript,
      summary: call.summary,
      endedAt: call.ended_at,
    });
  } catch (e) {
    console.error("Call status error:", e);
    return res.status(500).json({ error: "Failed to fetch call status" });
  }
}
