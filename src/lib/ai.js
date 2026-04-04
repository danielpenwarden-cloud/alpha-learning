// Claude API integration helpers
// All calls go through the Supabase Edge Function (ai-proxy).
// The Claude API key NEVER touches the browser.

import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai-proxy` : null;

async function getAuthToken() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function callClaude(systemPrompt, userMessage, { maxTokens = 2048 } = {}) {
  const messages = [{ role: 'user', content: userMessage }];
  return callViaEdgeFunction(systemPrompt, messages, { maxTokens, stream: false });
}

async function callClaudeStreaming(systemPrompt, messages, { maxTokens = 2048, onChunk } = {}) {
  return callViaEdgeFunction(systemPrompt, messages, { maxTokens, stream: true, onChunk });
}

// ─── Edge Function path ───────────────────────────

async function callViaEdgeFunction(system, messages, { maxTokens, stream, onChunk } = {}) {
  if (!EDGE_FUNCTION_URL) {
    throw new Error('AI unavailable: Supabase not configured');
  }

  const token = await getAuthToken();
  if (!token) {
    throw new Error('AI unavailable: Not authenticated. Please sign in.');
  }

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ system, messages, max_tokens: maxTokens, stream }),
  });

  if (res.status === 429) {
    throw new Error('Rate limit reached (20 requests/hour). Please wait before making more AI requests.');
  }

  if (res.status === 401) {
    throw new Error('Authentication expired. Please refresh the page and sign in again.');
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI proxy error: ${res.status} - ${err}`);
  }

  if (stream) {
    return processStream(res, onChunk);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ─── Streaming helper ─────────────────────────────

async function processStream(res, onChunk) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.type === 'content_block_delta' && json.delta?.text) {
            fullText += json.delta.text;
            onChunk?.(json.delta.text, fullText);
          }
        } catch {}
      }
    }
  }

  return fullText;
}

// ─── Public API ───────────────────────────────────

export function buildStudentContext(student, age, milestoneStatus, domainScores, milestones) {
  const statusSummary = milestones.map(m => {
    const s = milestoneStatus[m.id] || { status: 'not-started', progress: 0 };
    return `  ${m.id} ${m.name}: ${s.status} (${s.progress}%)${s.evidenceNotes ? ` — ${s.evidenceNotes}` : ''}`;
  }).join('\n');

  const scoreSummary = Object.entries(domainScores).map(([domain, s]) =>
    `  ${domain}: ${s.childScore}% vs age, ${s.comparison5yr.us}% vs age-5 US, ${s.comparison5yr.uk || 'N/A'}% vs age-5 UK, ${s.comparison5yr.nz || 'N/A'}% vs age-5 NZ`
  ).join('\n');

  return `You are an AI learning assistant for a child named ${student.firstName}, age ${age.years}yr ${age.months}mo.
They attend ${student.schoolName} and will enter school in NZ (${student.targetSchoolEntry}).
Their family follows the Alpha School 2hr mastery-based learning model.

Current milestone data:
${statusSummary}

Current domain scores:
${scoreSummary}

Benchmark context: Scores compared against 4 frameworks:
- US: DIBELS, Common Core K, Head Start ELOF (primary benchmark)
- UK: EYFS Profile, Cambridge Early Years, Development Matters
- NZ: Te Whāriki, School Entry Assessment, NZ Curriculum L1
- AU: EYLF, Foundation Year, AEDC
UK EYFS sits between US (more academic) and NZ (more holistic).
Science shows 4-5yr olds peak cognitively mid-morning (9-11am).

Answer the parent's question with specific, actionable, data-informed advice.
Reference specific milestone IDs and scores. Keep responses helpful and concise.`;
}

export async function chatWithAI(systemPrompt, messages, { onChunk } = {}) {
  if (onChunk) {
    return callClaudeStreaming(systemPrompt, messages, { maxTokens: 2048, onChunk });
  }
  const lastUser = messages.filter(m => m.role === 'user').pop();
  return callClaude(systemPrompt, lastUser?.content || '', { maxTokens: 2048 });
}

// ─── Worksheet sanitization ──────────────────────

const VALID_ACTIVITY_TYPES = [
  'trace', 'write', 'circle', 'match', 'count', 'draw', 'color', 'cut',
  'compare_groups', 'shapes', 'emotions', 'sizes', 'breathing', 'cut_shape',
];
const VALID_SHAPES = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'diamond', 'oval'];
const VALID_EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
const VALID_SIZES = ['tall', 'short', 'big', 'small', 'medium'];

/** Keyword heuristic to remap unknown types */
function inferTypeFromPrompt(prompt, content) {
  const text = `${prompt || ''} ${content || ''}`.toLowerCase();
  if (/\b(bigger group|more|fewer|less|greater|compare.*group)/i.test(text)) return 'compare_groups';
  if (/\b(happy|sad|angry|surprised|neutral|face|feeling|emotion)/i.test(text)) return 'emotions';
  if (/\b(tall|short|bigger|smaller|size|long)/i.test(text)) return 'sizes';
  if (/\b(breath|calm|inhale|exhale)/i.test(text)) return 'breathing';
  if (/\b(cut)\b/.test(text) && VALID_SHAPES.some(sh => text.includes(sh))) return 'cut_shape';
  if (/\b(shape|circle|square|triangle|rectangle)/i.test(text) && !/\bcircle (the|all|each)\b/i.test(text)) return 'shapes';
  if (/\b(draw|picture|sketch)/i.test(text)) return 'draw';
  if (/\b(trace)/i.test(text)) return 'trace';
  if (/\b(count)/i.test(text)) return 'count';
  if (/\b(color|colour)/i.test(text)) return 'color';
  return 'draw'; // safe fallback — empty box
}

/** Strip emoji / unicode junk from content string */
function stripEmoji(str) {
  return (str || '').replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .trim();
}

/** Validate and fix worksheet activities after JSON parse. */
function sanitizeWorksheet(worksheet, childName = 'Child') {
  if (!worksheet || !worksheet.activities) return worksheet;
  worksheet.activities = worksheet.activities.map(act => {
    act.content = stripEmoji(act.content || '');
    act.type = (act.type || '').toLowerCase().replace(/\s+/g, '_');
    const combined = `${act.type} ${act.content} ${act.prompt || ''}`.toLowerCase();

    const contentWords = act.content.toLowerCase().split(/[\s,;|]+/).filter(Boolean);
    const shapeWords = contentWords.filter(w => VALID_SHAPES.includes(w));
    const emotionWords = contentWords.filter(w => VALID_EMOTIONS.includes(w));
    const sizeWords = contentWords.filter(w => VALID_SIZES.includes(w));

    if (shapeWords.length >= 2 && !['shapes', 'color', 'cut_shape', 'circle'].includes(act.type) && !/circle (the|all|each)/i.test(act.prompt)) {
      act.type = 'shapes';
      act.content = shapeWords.join(',');
    } else if (emotionWords.length >= 2 && act.type !== 'emotions') {
      act.type = 'emotions';
      act.content = emotionWords.join(',');
    } else if (sizeWords.length >= 2 && act.type !== 'sizes') {
      act.type = 'sizes';
      act.content = sizeWords.join(',');
    }

    if (!VALID_ACTIVITY_TYPES.includes(act.type)) {
      act.type = inferTypeFromPrompt(act.prompt, act.content);
    }

    if (act.type === 'cut' && VALID_SHAPES.some(sh => combined.includes(sh))) {
      act.type = 'cut_shape';
      act.content = VALID_SHAPES.find(sh => combined.includes(sh));
    }

    switch (act.type) {
      case 'count': {
        const n = parseInt((act.content.match(/\d+/) || [])[0], 10);
        act.content = String(isNaN(n) ? 5 : Math.min(n, 20));
        break;
      }
      case 'compare_groups': {
        const nums = (act.content.match(/\d+/g) || []).map(Number);
        act.content = nums.length >= 2
          ? `${Math.min(nums[0], 15)},${Math.min(nums[1], 15)}`
          : '3,7';
        break;
      }
      case 'circle': {
        const items = act.content.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
        act.content = items.join(',');
        break;
      }
      case 'shapes': {
        const shapes = act.content.toLowerCase().split(/[,;|\s]+/).map(s => s.trim());
        const valid = shapes.filter(sh => VALID_SHAPES.includes(sh));
        act.content = valid.length > 0 ? valid.join(',') : 'circle,square,triangle';
        break;
      }
      case 'emotions': {
        const emos = act.content.toLowerCase().split(/[,;|\s]+/).map(s => s.trim());
        const valid = emos.filter(e => VALID_EMOTIONS.includes(e));
        act.content = valid.length > 0 ? valid.join(',') : 'happy,sad,angry';
        break;
      }
      case 'sizes': {
        const sizes = act.content.toLowerCase().split(/[,;|\s]+/).map(s => s.trim());
        const valid = sizes.filter(sz => VALID_SIZES.includes(sz));
        act.content = valid.length > 0 ? valid.join(',') : 'tall,short,tall,short';
        break;
      }
      case 'draw':
        act.content = '';
        break;
      case 'breathing': {
        const n = parseInt((act.content.match(/\d+/) || [])[0], 10);
        act.content = String(isNaN(n) ? 4 : Math.min(n, 8));
        break;
      }
      case 'cut_shape': {
        const sh = (act.content || '').toLowerCase().trim();
        act.content = VALID_SHAPES.includes(sh) ? sh : (VALID_SHAPES.find(s => combined.includes(s)) || 'square');
        break;
      }
      case 'trace':
      case 'write':
        act.content = act.content.replace(/[^\w\s]/g, '').trim();
        if (!act.content) act.content = act.type === 'trace' ? 'A B C' : childName;
        break;
      case 'color': {
        const shapes = act.content.toLowerCase().split(/[,;|\s]+/).map(s => s.trim());
        const valid = shapes.filter(sh => VALID_SHAPES.includes(sh));
        act.content = valid.length > 0 ? valid.join(',') : 'circle,square,triangle';
        break;
      }
    }
    return act;
  });
  return worksheet;
}

// ─── Worksheet generation ────────────────────────

export async function generateWorksheet(age, domain, milestonesSummary, targetSkills, childName = 'Child') {
  const system = `You are an expert early childhood educator creating printable worksheets.
Output ONLY valid JSON, no markdown code fences.

CRITICAL RULES — VIOLATION CAUSES RENDERING FAILURE:
1. ONLY use these 14 activity types: trace, write, circle, match, count, draw, color, cut, compare_groups, shapes, emotions, sizes, breathing, cut_shape
2. "content" is machine-parsed structured data — NEVER sentences, descriptions, emoji, or unicode
3. The PDF engine renders SVG graphics for each type. You provide DATA ONLY.
4. If a concept doesn't fit a type above, use "draw" with content ""
5. The child's name is ${childName} — always use "${childName}" when a name is needed, never make up names
6. DOMAIN RULES — EVERY activity must belong to the requested domain:
   - literacy: trace, write, match (letters/words), circle (letters), count (letters in a word)
   - numeracy: count, compare_groups, match (numbers), trace (numbers), shapes, circle (numbers)
   - social: emotions, breathing, draw (feelings), circle (picture-based coping), sizes (sharing concepts)
   - motor: cut, cut_shape, trace, draw (patterns), color (shapes)
7. The child is 4-5 years old and PRE-LITERATE. NEVER create activities requiring reading words. Use pictures/SVGs/drawing instead.`;

  const prompt = `Create a worksheet for ${childName}, age ${age.years}yr ${age.months}mo.
Domain: ${domain}
Current level: ${milestonesSummary}
Target skills: ${targetSkills}

RULES:
- 6-8 activities suitable for a 4-5 year old
- Short prompts a parent reads aloud (the child CANNOT read)
- content = ONLY structured tokens the PDF engine parses
- EVERY activity must be ${domain}-specific. Never mix domains

TYPE CATALOG (use ONLY these):

trace → content: letters/digits to trace (e.g. "A B C" or "1 2 3")
write → content: target word (e.g. "cat" or "${childName}")
circle → content: comma-separated items to display in boxes. For "circle the letter" activities use single letters (e.g. "S,M,N,T,B,S,P,S"). For "find the sight word" activities use words with target repeated among distractors (e.g. "the,cat,the,dog,run,the,ball,the")
match → content: dash-separated pairs (e.g. "A-apple,B-ball,C-cat")
count → content: single integer only (e.g. "7")
draw → content: "" (always empty)
color → content: shape names only (e.g. "circle,square,triangle")
cut → content: "" (always empty)
compare_groups → content: two comma-separated integers (e.g. "3,6")
shapes → content: shape names only (e.g. "circle,square,triangle,rectangle")
emotions → content: emotion names only from {happy,sad,angry,surprised,neutral}
sizes → content: size labels only from {tall,short,big,small}
breathing → content: single integer (e.g. "4")
cut_shape → content: single shape name (e.g. "square")

JSON format:
{
  "title": "worksheet title",
  "instructions": "1-2 sentence parent instructions",
  "activities": [
    {"type": "trace", "prompt": "Trace the letter A", "content": "A", "hint": "Start at the top"}
  ]
}`;

  const text = await callClaude(system, prompt, { maxTokens: 2048 });
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const worksheet = JSON.parse(cleaned);
    return sanitizeWorksheet(worksheet, childName);
  } catch {
    throw new Error('Failed to parse worksheet JSON from AI response');
  }
}

export async function generateInsights(studentContext) {
  const system = `You are an expert early childhood development analyst. Output ONLY valid JSON, no markdown code fences.`;

  const prompt = `${studentContext}

Analyze all the milestone data above and generate insights. Return JSON:
{
  "strengths": [{"title": "...", "detail": "..."}],
  "focusAreas": [{"title": "...", "detail": "...", "milestoneId": "..."}],
  "crossDomain": [{"title": "...", "detail": "..."}],
  "plateauAlerts": [{"milestoneId": "...", "title": "...", "detail": "...", "suggestion": "..."}],
  "nextBestStep": [{"domain": "...", "milestoneId": "...", "title": "...", "detail": "..."}],
  "benchmarkNote": "one line comparing NZ vs US positioning"
}

Be specific. Reference milestone IDs. Keep each detail to 1-2 sentences.`;

  const text = await callClaude(system, prompt, { maxTokens: 3000 });
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse insights JSON from AI response');
  }
}

export async function generateWeeklyPlan(studentContext) {
  const system = `You are an expert early childhood curriculum planner following the Alpha School mastery model. Output ONLY valid JSON, no markdown code fences.`;

  const prompt = `${studentContext}

Generate a weekly learning plan. Return JSON:
{
  "weekFocus": "one sentence overview",
  "domains": [
    {
      "domain": "literacy|numeracy|social|motor",
      "focus": "what to prioritize this week",
      "targets": ["measurable target 1", "measurable target 2"],
      "activities": [
        {"day": "Mon-Fri or Daily", "activity": "specific activity", "duration": "15-30min", "milestoneId": "L03"}
      ]
    }
  ],
  "tips": ["practical tip 1", "practical tip 2"]
}

Be specific to the child's current levels. Focus on the highest-impact milestones.`;

  const text = await callClaude(system, prompt, { maxTokens: 3000 });
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse weekly plan JSON from AI response');
  }
}

export async function analyzeDocument(docType, studentContext, { textContent, imageBase64, imageMimeType, pageImages, fileName } = {}) {
  const system = `You are an expert early childhood assessor analyzing documents for a young child. Output ONLY valid JSON, no markdown code fences.

Guidelines:
- Only reference milestone IDs that exist in the student context
- Be conservative with confidence ratings
- Note evidence that directly demonstrates skill levels
- If the document doesn't contain clear milestone evidence, return empty findings`;

  let documentDescription = '';
  if (textContent) {
    documentDescription = `\nDocument text content:\n---\n${textContent}\n---`;
  } else if (pageImages?.length > 0) {
    documentDescription = `\nThe document pages are attached as images (${pageImages.length} page${pageImages.length > 1 ? 's' : ''}). Read all text, tables, and data from the images.`;
  } else if (fileName) {
    documentDescription = `\nDocument filename: ${fileName} (type: ${docType})`;
  }

  const prompt = `${studentContext}

A ${docType} has been uploaded.${documentDescription}

Analyze this document and extract any evidence of developmental skill progress. Map findings to the specific milestone IDs listed in the student context above.

Return JSON:
{
  "summary": "1-2 sentence overview of what the document shows",
  "findings": [
    {"milestoneId": "L03", "observedLevel": "not-started|emerging|in-progress|proficient|mastered", "suggestedProgress": 50, "evidence": "specific description of what was observed", "confidence": "high|medium|low"}
  ],
  "strengths": ["notable strength observed"],
  "concerns": ["any concern, or empty array if none"]
}`;

  // Multi-page PDF images
  if (pageImages?.length > 0) {
    const imageContent = pageImages.map(b64 => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: b64 },
    }));
    const messages = [{
      role: 'user',
      content: [...imageContent, { type: 'text', text: prompt }],
    }];

    const text = await callViaEdgeFunction(system, messages, { maxTokens: 3000 });
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse document analysis JSON');
    }
  }

  // Single image
  if (imageBase64 && !textContent) {
    const messages = [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: imageMimeType || 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }];

    const text = await callViaEdgeFunction(system, messages, { maxTokens: 2048 });
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse document analysis JSON');
    }
  }

  // Text-only fallback
  const text = await callClaude(system, prompt, { maxTokens: 2048 });
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse document analysis JSON');
  }
}
