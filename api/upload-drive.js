const { google } = require("googleapis");
const { Readable } = require("stream");

const SUPABASE_URL = "https://niueqiwxhljhouqsjqqx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdWVxaXd4aGxqaG91cXNqcXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODYzNzYsImV4cCI6MjA4ODY2MjM3Nn0.I1SqvRG3-boMOd2F9SW0yyZG5iFMAwjGHvsxadOOjg0";

const ALLOWED_FILE_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;

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

  // Update token in Supabase
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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth check
  const secret = process.env.API_SECRET;
  if (secret && req.headers["x-api-secret"] !== secret) return res.status(401).json({ error: "Unauthorized" });

  const { fileUrl, fileName, advisorId, clientName, folderId } = req.body;
  if (!fileUrl || !fileName || !advisorId || !clientName) {
    return res.status(400).json({ error: "Missing: fileUrl, fileName, advisorId, clientName" });
  }

  // SSRF protection — only allow Supabase storage URLs
  if (!fileUrl.startsWith(ALLOWED_FILE_URL_PREFIX)) {
    return res.status(400).json({ error: "Invalid file URL" });
  }

  try {
    // Get advisor's Google tokens
    const tokens = await getAdvisorTokens(advisorId);
    if (!tokens?.refresh_token) {
      return res.status(400).json({ error: "Google Drive non connecté pour ce conseiller" });
    }

    // Refresh access token if expired
    let accessToken = tokens.access_token;
    if (new Date(tokens.expires_at) < new Date()) {
      accessToken = await refreshAccessToken(advisorId, tokens.refresh_token);
    }

    // Auth with OAuth2
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Determine parent folder: use folderId if provided, otherwise root
    const parentId = folderId || "root";

    // Find or create client subfolder
    const folderQuery = await drive.files.list({
      q: `'${parentId}' in parents and name='${clientName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    let clientFolderId;
    if (folderQuery.data.files.length > 0) {
      clientFolderId = folderQuery.data.files[0].id;
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name: clientName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentId],
        },
        fields: "id",
      });
      clientFolderId = folder.data.id;
    }

    // Download file from Supabase Storage URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to download file" });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await response.arrayBuffer());

    // Check if file already exists → update instead of duplicate
    const existingQuery = await drive.files.list({
      q: `'${clientFolderId}' in parents and name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
      fields: "files(id, name)",
    });

    let driveFileId;
    if (existingQuery.data.files.length > 0) {
      driveFileId = existingQuery.data.files[0].id;
      await drive.files.update({
        fileId: driveFileId,
        media: { mimeType: contentType, body: Readable.from(buffer) },
      });
    } else {
      const file = await drive.files.create({
        requestBody: { name: fileName, parents: [clientFolderId] },
        media: { mimeType: contentType, body: Readable.from(buffer) },
        fields: "id",
      });
      driveFileId = file.data.id;
    }

    res.status(200).json({ success: true, driveFileId, clientFolderId });
  } catch (err) {
    console.error("Drive upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
