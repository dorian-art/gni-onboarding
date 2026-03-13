CREATE TABLE voice_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_type TEXT DEFAULT 'client',
  vapi_call_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  duration_seconds INTEGER,
  transcript JSONB,
  summary TEXT,
  missing_docs TEXT[],
  initiated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Index for fast lookup by vapi_call_id (used by webhook and status polling)
CREATE INDEX idx_voice_calls_vapi_call_id ON voice_calls(vapi_call_id);

-- Index for fetching call history per client
CREATE INDEX idx_voice_calls_client_id ON voice_calls(client_id, created_at DESC);
