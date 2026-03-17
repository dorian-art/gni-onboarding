export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const event = req.body;
  const eventType = event.message?.type || event.type;

  // Handle end-of-call report
  if (eventType === "end-of-call-report") {
    const callId = event.message?.call?.id || event.call?.id;
    const transcript = event.message?.transcript || event.transcript;
    const summary = event.message?.summary || event.summary;
    const duration = event.message?.call?.duration || event.call?.duration;
    const endedAt = event.message?.call?.endedAt || event.call?.endedAt || new Date().toISOString();

    if (!callId) {
      return res.status(400).json({ error: "Missing call ID" });
    }

    try {
      // Update voice_calls record
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/voice_calls?vapi_call_id=eq.${encodeURIComponent(callId)}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            status: "ended",
            duration_seconds: Math.round(duration || 0),
            transcript: transcript || null,
            summary: summary || null,
            ended_at: endedAt,
          }),
        }
      );

      if (!updateRes.ok) {
        console.error("Failed to update voice_calls:", await updateRes.text());
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Webhook processing error:", e);
      return res.status(500).json({ error: "Failed to process webhook" });
    }
  }

  // Handle status updates
  if (eventType === "status-update") {
    const callId = event.message?.call?.id || event.call?.id;
    const status = event.message?.status || event.status;

    if (callId && status) {
      try {
        await fetch(
          `${SUPABASE_URL}/rest/v1/voice_calls?vapi_call_id=eq.${encodeURIComponent(callId)}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_SERVICE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ status: status === "in-progress" ? "in_progress" : status }),
          }
        );
      } catch (e) {
        console.error("Status update error:", e);
      }
    }

    return res.status(200).json({ ok: true });
  }

  // Acknowledge other events
  return res.status(200).json({ ok: true });
}
