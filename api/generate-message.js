module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.headers["x-api-secret"] !== secret) return res.status(401).json({ error: "Unauthorized" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing: prompt" });

  // Limit prompt length to prevent abuse
  if (prompt.length > 5000) return res.status(400).json({ error: "Prompt too long" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: "AI generation failed" });

    const text = data.content?.[0]?.text?.trim();
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
