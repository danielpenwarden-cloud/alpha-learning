// Supabase Edge Function: AI Proxy
// Proxies requests to Claude API, keeping the API key server-side.
// Validates Supabase JWT, rate-limits 20 requests/user/hour.
//
// Deploy: supabase functions deploy ai-proxy --no-verify-jwt
// Set secret: supabase secrets set CLAUDE_API_KEY=sk-ant-...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Simple in-memory rate limiter (resets on cold start — good enough for moderate traffic)
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (bucket.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: RATE_LIMIT - bucket.count };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ─── Verify JWT ────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract the token (strip "Bearer ")
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Rate limiting ─────────────────────────────
    const { allowed, remaining } = checkRateLimit(user.id);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. 20 AI requests per hour. Try again later.' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(RATE_LIMIT),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // ─── Get API key ───────────────────────────────
    const apiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'CLAUDE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Parse and validate request ────────────────
    const body = await req.json();
    const { system, messages, max_tokens = 2048, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cap max_tokens to prevent abuse
    const safeMaxTokens = Math.min(max_tokens, 4096);

    const claudeBody: Record<string, unknown> = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: safeMaxTokens,
      messages,
      ...(system ? { system } : {}),
      ...(stream ? { stream: true } : {}),
    };

    // ─── Call Claude API ───────────────────────────
    const claudeRes = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(claudeBody),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeRes.status}`, detail: errText }),
        {
          status: claudeRes.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      );
    }

    if (stream) {
      return new Response(claudeRes.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Remaining': String(remaining),
        },
      });
    }

    const data = await claudeRes.json();
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
