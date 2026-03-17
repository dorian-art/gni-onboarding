const VAPI_API_URL = "https://api.vapi.ai/call/phone";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.headers["x-api-secret"] !== secret) return res.status(401).json({ error: "Unauthorized" });

  const { VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

  if (!VAPI_API_KEY || !VAPI_PHONE_NUMBER_ID) {
    return res.status(500).json({ error: "Vapi not configured" });
  }

  const { phone, clientName, civility, contactFirstName, contact, missingDocs, message, history, clientId, clientType } = req.body;

  if (!phone || !clientName) {
    return res.status(400).json({ error: "phone and clientName are required" });
  }

  // Validate phone format
  const cleanPhone = phone.replace(/\s/g, "");
  if (!/^\+\d{10,15}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Fetch previous call history from Supabase for memory
  let previousCalls = [];
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY && clientId) {
    try {
      const historyRes = await fetch(
        `${SUPABASE_URL}/rest/v1/voice_calls?client_id=eq.${encodeURIComponent(clientId)}&status=eq.ended&order=created_at.desc&limit=5`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      if (historyRes.ok) {
        previousCalls = await historyRes.json();
      }
    } catch (e) {
      console.error("Failed to fetch call history:", e);
    }
  }

  // Build memory section from previous calls
  const memorySection = previousCalls.length > 0
    ? `\nHISTORIQUE DES APPELS PRÉCÉDENTS :\n${previousCalls.map((c, i) => `- Appel ${i + 1} (${new Date(c.created_at).toLocaleDateString("fr-FR")}): ${c.summary || "Pas de résumé disponible"}`).join("\n")}\nUtilise ces informations pour personnaliser la conversation. Fais référence aux échanges précédents si pertinent.`
    : "\nC'est le premier appel à ce contact.";

  // Build missing docs section
  const missingSection = missingDocs && missingDocs.length > 0
    ? `\nDOCUMENTS/ÉLÉMENTS MANQUANTS :\n${missingDocs.map(d => `- ${d}`).join("\n")}`
    : "\nTous les documents ont été reçus.";

  // Build system prompt
  const systemPrompt = `Tu es l'assistant vocal du Groupe National de l'Immobilier (GNI).
Tu appelles ${civility || ""} ${contactFirstName || ""} ${contact || ""} de ${clientName}.
Tu parles en français, de manière professionnelle et chaleureuse.
${missingSection}

GUIDE DE CONVERSATION :
${message || "Présentez-vous et demandez des nouvelles concernant les documents manquants."}
${memorySection}

INSTRUCTIONS :
- Présente-toi : "Bonjour, je suis l'assistant du Groupe National de l'Immobilier."
- Demande poliment des nouvelles sur les documents ou éléments manquants
- Propose ton aide pour faciliter l'envoi des documents
- Reste bref et concis (2-3 minutes maximum)
- Si tu tombes sur un répondeur, laisse un message court et professionnel
- Sois toujours poli et bienveillant
- Ne répète jamais mot pour mot le guide de conversation, adapte-le naturellement`;

  // Initiate Vapi call
  try {
    const vapiRes = await fetch(VAPI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        assistantId: process.env.VAPI_ASSISTANT_ID || "2a4b1d9b-c76a-499d-9044-a75ad9e519f4",
        assistantOverrides: {
          variableValues: {
            systemPrompt: systemPrompt,
          },
          firstMessage: `Bonjour ${civility || ""} ${contact || ""}. Je suis l'assistant du Groupe National de l'Immobilier. Comment allez-vous ?`,
        },
        customer: {
          number: cleanPhone,
        },
      }),
    });

    if (!vapiRes.ok) {
      const errBody = await vapiRes.text();
      console.error("Vapi error:", errBody);
      return res.status(vapiRes.status).json({ error: "Vapi call failed" });
    }

    const vapiData = await vapiRes.json();

    // Store call record in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/voice_calls`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId || clientName,
            client_type: clientType || "client",
            vapi_call_id: vapiData.id,
            phone: cleanPhone,
            status: "queued",
            missing_docs: missingDocs || [],
            initiated_by: req.body.initiatedBy || "unknown",
          }),
        });
      } catch (e) {
        console.error("Failed to store call record:", e);
      }
    }

    return res.status(200).json({ callId: vapiData.id, status: vapiData.status || "queued" });
  } catch (e) {
    console.error("Voice call error:", e);
    return res.status(500).json({ error: "Failed to initiate call" });
  }
}
