module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  const authHeader = req.headers.authorization;
  const hasSecret = secret && (req.headers["x-api-secret"] === secret || req.query.secret === secret);
  const hasJwt = authHeader && authHeader.startsWith("Bearer ");
  if (!hasSecret && !hasJwt) return res.status(401).json({ error: "Unauthorized" });

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SMS_FROM)
    return res.status(500).json({ error: "Twilio SMS not configured" });

  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: "Missing: to, message" });

  // Validate phone format (French numbers)
  const phone = to.replace(/\s/g, "").replace(/^0/, "+33");
  if (!/^\+33\d{9}$/.test(phone)) return res.status(400).json({ error: "Invalid phone number" });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        },
        body: new URLSearchParams({ From: TWILIO_SMS_FROM, To: phone, Body: message }).toString(),
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "Twilio SMS error" });
    res.status(200).json({ success: true, sid: data.sid });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
