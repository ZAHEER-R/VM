// Vercel serverless function – Gemini proxy
// Set GEMINI_API_KEY in Vercel Environment Variables.
export const config = { runtime: 'edge' };

const SHOP = `You are the website assistant for Vijetha Medical & General Stores (also known as Nowroji Medicals), a licensed chemist and druggist in Machilipatnam, Andhra Pradesh.
FACTS YOU MAY USE:
- Address: Stall No. 64, Azad Road, Koneru Centre, Machilipatnam, Andhra Pradesh 521001.
- Also known locally as Nowroji Medicals.
- Serving since 1989. Founder: Rachakula Lakshmaiah. Proprietor: Rachakula Venkateswarlu (phone 98490 97880). Sub-Proprietor: Rachakula Srinivas (phone/WhatsApp 98493 65613).
- Sells: medicines (tablets, capsules, syrups, drops, injections), ointments and creams, hospital and surgical supplies (scissors, blades, cotton rolls, IV saline and NS solutions), sanitisers and hygiene, veterinary products, nutrition and milk powders, wellness and massage oils, personal care.
- Home delivery to Machilipatnam and nearby villages; confirm village and charges by phone.
- Orders: send list or prescription photo on WhatsApp or call; shop confirms every order by phone. Prescription medicines only against valid prescription.
- Hours: Monday–Saturday 9:30 AM–11:00 PM; Sunday 10:00 AM–10:00 PM.
- Licences: Drug Licence Form 20: 20/74/AP/KR-M/2007/R; Form 21: 21/74/AP/KR-M/2007/R; ABDM ID IN2810044422; GSTIN 37ADFPR9984E1ZV.
RULES:
- You are Lisa, the Vijetha Medical website assistant. Use a warm, clear customer-service style and answer only questions about this shop or information published on this website: listed product categories, ordering, delivery, location, contacts, licenses, and opening hours. Politely decline unrelated questions and invite the visitor to ask about the shop.
- You may describe the product categories listed above, but they are not a live inventory. Never claim a specific medicine, brand, strength, or product is in stock unless the shop confirms it.
- Never diagnose, recommend, select, compare, or suggest a medicine or treatment; never give dosage, prescription, or medicine substitution advice. For medicine questions, advise the customer to consult their doctor or pharmacist. Prescription medicines require a valid prescription.
- Never invent prices, discounts, or claim the shop has the lowest prices. Explain that current prices and generic availability must be confirmed by the pharmacist; give the customer the shop WhatsApp/phone contact.
- For an order, suggest sending the product list or a prescription photo to WhatsApp 98493 65613; tell them the shop confirms availability and price before order completion.
- Reply in Telugu if the user asks in Telugu or the requested language is Telugu, otherwise English. Give a complete answer to every part of the question. Use short paragraphs or numbered steps when useful. Do not use Markdown, asterisks, or bold markers.`;

let cachedTextModels = [];
let modelCacheExpiresAt = 0;

async function fetchJsonWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  let timeout;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Gemini request timed out.'));
    }, timeoutMs);
  });
  const request = (async () => {
    const response = await fetch(url, { ...options, signal: controller.signal });
    let data = {};
    let validJson = true;
    try {
      data = await response.json();
    } catch (error) {
      validJson = false;
      console.warn(`Gemini returned a non-JSON response (HTTP ${response.status}, ${response.headers.get('content-type') || 'unknown content type'}).`);
    }
    return { response, data, validJson };
  })();
  try {
    return await Promise.race([request, timeoutPromise]);
  } finally {
    clearTimeout(timeout);
  }
}

function isInvalidApiKey(status, data) {
  const message = String(data?.error?.message || '').toLowerCase();
  return status === 401 || status === 403 ||
    (status === 400 && /api key|credential|authentication/.test(message));
}

function supportsTextChat(model) {
  const name = model.toLowerCase();
  return name.includes('gemini') &&
    !/(embedding|(^|-)aqa|tts|image|audio|(^|-)live|robotics|computer-use)/.test(name);
}

function compareModels(a, b) {
  const version = model => {
    const match = model.match(/gemini-(\d+)(?:\.(\d+))?/i);
    return match ? [Number(match[1]), Number(match[2] || 0)] : [0, 0];
  };
  const [aMajor, aMinor] = version(a);
  const [bMajor, bMinor] = version(b);
  return bMajor - aMajor || bMinor - aMinor ||
    Number(a.includes('lite')) - Number(b.includes('lite')) ||
    a.localeCompare(b);
}

async function chat(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'Lisa chat API',
      configured: Boolean(process.env.GEMINI_API_KEY),
      preferredModel: process.env.GEMINI_MODEL || 'auto-discover',
      apiRouteVersion: 2,
      message: 'API is reachable. Send customer messages with POST to start a chat.',
    });
  }
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'GET, POST');
    return res.status(405).json({ reply: 'Use GET to check the API or POST to send a chat message.' });
  }
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  } catch (e) {
    return res.status(400).json({ reply: 'Invalid JSON request body.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ reply: 'Request must be a JSON object.' });
  }
  const rawMessages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  if (rawMessages[0]?.role === 'model') rawMessages.shift();
  const msgs = [];
  for (const message of rawMessages) {
    if (!message || typeof message !== 'object' ||
        !['user', 'model'].includes(message.role) ||
        typeof message.text !== 'string' || !message.text.trim()) {
      return res.status(400).json({ reply: 'Each chat message needs a valid role and non-empty text.' });
    }
    const text = message.text.trim().slice(0, 500);
    const previous = msgs[msgs.length - 1];
    if (previous && previous.role === message.role) {
      previous.parts[0].text += `\n${text}`;
    } else {
      msgs.push({ role: message.role, parts: [{ text }] });
    }
  }
  if (!msgs.length || msgs[0].role !== 'user' || msgs[msgs.length - 1].role !== 'user') {
    return res.status(400).json({ reply: 'Chat history must start and end with a customer message.' });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({
      reply: body.lang === 'te'
        ? 'AI సహాయకుడు ఇంకా సెట్ కాలేదు. Vercel Project Settingsలో GEMINI_API_KEYని జోడించి మళ్లీ deploy చేయండి.'
        : 'AI assistant is not configured. Add GEMINI_API_KEY in Vercel Project Settings and redeploy.',
    });
  }
  const preferredModels = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ].filter(Boolean)
    .map(model => String(model).replace(/^models\//, ''))
    .filter(supportsTextChat)
    .filter((model, index, list) => list.indexOf(model) === index);
  const deadline = Date.now() + 21000;
  try {
    let availableModels = cachedTextModels;
    if (Date.now() >= modelCacheExpiresAt) {
      try {
        const modelUrl = new URL('https://generativelanguage.googleapis.com/v1beta/models');
        modelUrl.searchParams.set('pageSize', '100');
        const { response: listing, data, validJson } = await fetchJsonWithTimeout(
          modelUrl,
          { headers: { 'x-goog-api-key': key } },
          Math.min(2500, deadline - Date.now())
        );
        if (!listing.ok) {
          if (isInvalidApiKey(listing.status, data)) {
            return res.status(502).json({
              reply: body.lang === 'te'
                ? 'Gemini API కీ చెల్లదు లేదా అనుమతి లేదు. Google AI Studioలో కీని తనిఖీ చేసి, Vercelలో GEMINI_API_KEYని నవీకరించండి.'
                : 'Gemini API key is invalid or unauthorized. Check the key in Google AI Studio and update GEMINI_API_KEY in Vercel.',
            });
          }
          console.warn(`Gemini model lookup failed (${listing.status}); trying the configured text models.`);
          availableModels = [];
          cachedTextModels = [];
          modelCacheExpiresAt = Date.now() + 30000;
        } else if (!validJson) {
          console.warn('Gemini model lookup returned an unreadable response; trying configured text models.');
          availableModels = [];
          cachedTextModels = [];
          modelCacheExpiresAt = Date.now() + 30000;
        } else {
          availableModels = (Array.isArray(data.models) ? data.models : [])
            .filter(model => (model.supportedGenerationMethods || []).includes('generateContent'))
            .map(model => String(model.name || '').replace(/^models\//, ''))
            .filter(supportsTextChat);
          cachedTextModels = availableModels;
          modelCacheExpiresAt = Date.now() + (availableModels.length ? 5 * 60 * 1000 : 30000);
        }
      } catch (error) {
        console.warn('Gemini text-model lookup failed; trying configured text models.', error);
        availableModels = [];
        cachedTextModels = [];
        modelCacheExpiresAt = Date.now() + 30000;
      }
    }

    let candidates = preferredModels;
    if (availableModels.length) {
      const discovered = availableModels.slice().sort((a, b) => {
        const flashOrder = Number(!a.includes('flash')) - Number(!b.includes('flash'));
        return flashOrder || compareModels(a, b);
      });
      candidates = discovered.concat(preferredModels.filter(model => !discovered.includes(model)));
    }

    if (!candidates.length) {
      return res.status(503).json({
        reply: body.lang === 'te'
          ? 'ఈ API కీకి టెక్స్ట్ చాట్ మోడల్ అందుబాటులో లేదు. Google AI Studioలో text generation మోడల్‌ను ప్రారంభించి, GEMINI_MODELని తనిఖీ చేయండి.'
          : 'No text chat model is available for this API key. Enable a text-generation model in Google AI Studio and check GEMINI_MODEL.',
      });
    }

    let lastStatus = 502;
    let incompleteResponse = false;
    let repeatedResponse = false;
    const previousReply = msgs.slice(0, -1).reverse()
      .find(message => message.role === 'model')
      ?.parts.map(part => part.text).join('\n').trim().toLowerCase();
    for (const model of candidates) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      let response;
      let data;
      try {
        const result = await fetchJsonWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: SHOP +
                  `\nUser language: ${body.lang === 'te' ? 'Telugu' : 'English'}.` +
                  '\nAnswer the latest customer message directly. Tailor each answer to its specific question. Do not reuse a generic or previous answer when the customer asks something different. If several questions are asked, address each one.',
              }],
            },
            contents: msgs,
            generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 900 },
          }),
        }, Math.min(7000, remaining));
        response = result.response;
        data = result.data;
      } catch (error) {
        lastStatus = /timed out/i.test(String(error.message)) ? 504 : 502;
        console.warn(`Gemini request failed for ${model}; trying the next available model.`, error);
        continue;
      }
      if (response.ok) {
        const candidate = data.candidates?.[0];
        const reply = candidate?.content?.parts
          ?.map(part => typeof part.text === 'string' ? part.text : '')
          .filter(Boolean)
          .join('\n');
        if (candidate?.finishReason === 'MAX_TOKENS') {
          incompleteResponse = true;
          lastStatus = 502;
          console.warn(`Gemini model ${model} reached its output limit; trying the next available model.`);
          continue;
        }
        if (reply && previousReply &&
            reply.trim().toLowerCase().replace(/\s+/g, ' ') === previousReply.replace(/\s+/g, ' ')) {
          repeatedResponse = true;
          lastStatus = 502;
          console.warn(`Gemini model ${model} repeated the previous answer; trying the next available model.`);
          continue;
        }
        if (reply) return res.status(200).json({ reply, model });
        console.warn(`Gemini model ${model} returned no text; trying the next available model.`);
        lastStatus = 502;
        continue;
      }

      lastStatus = response.status;
      if (isInvalidApiKey(response.status, data)) {
        return res.status(502).json({
          reply: body.lang === 'te'
            ? 'Gemini API కీ చెల్లదు లేదా అనుమతి లేదు. Google AI Studioలో కీని తనిఖీ చేసి, Vercelలో GEMINI_API_KEYని నవీకరించండి.'
            : 'Gemini API key is invalid or unauthorized. Check the key in Google AI Studio and update GEMINI_API_KEY in Vercel.',
        });
      }
      const errorMessage = String(data?.error?.message || '');
      const modelUnavailable = response.status === 400 &&
        /model.*(not found|unsupported|not support)|does not support.*generatecontent|response modalities.*not supported|requested combination/i.test(errorMessage);
      if (modelUnavailable) {
        console.warn(`Gemini model ${model} is unsupported; trying the next available model.`);
        continue;
      }
      if (![404, 429, 500, 502, 503, 504].includes(response.status)) {
        console.error(`Gemini request failed for ${model}:`, data.error || response.statusText);
        return res.status(502).json({ reply: 'The assistant could not complete that request. Please call 98490 97880 or 98493 65613.' });
      }
      console.warn(`Gemini model ${model} unavailable (${response.status}); trying the next available model.`);
    }

    console.error('All available Gemini models failed.');
    if (repeatedResponse) {
      return res.status(502).json({
        reply: body.lang === 'te'
          ? 'మీ కొత్త ప్రశ్నకు ప్రత్యేకమైన సమాధానం రూపొందించలేకపోయాము. దయచేసి ప్రశ్నను మరో విధంగా అడగండి.'
          : 'I could not produce a new answer for that question. Please rephrase it and try again.',
        code: 'GEMINI_REPEATED_RESPONSE',
      });
    }
    if (incompleteResponse && lastStatus === 502) {
      return res.status(502).json({
        reply: body.lang === 'te'
          ? 'సమాధానం పూర్తిగా రూపొందలేదు. దయచేసి ప్రశ్నను మళ్లీ పంపండి.'
          : 'The answer could not be completed. Please send your question again.',
        code: 'GEMINI_INCOMPLETE',
      });
    }
    const reply = lastStatus === 429
      ? (body.lang === 'te'
        ? 'Gemini text మోడళ్ల కోటా పూర్తయింది. తర్వాత మళ్లీ ప్రయత్నించండి లేదా Google AI Studioలో అందుబాటులో ఉన్న quotaను తనిఖీ చేయండి.'
        : 'The available Gemini text models are over quota. Try again later or check the quota in Google AI Studio.')
      : lastStatus === 504
        ? (body.lang === 'te'
          ? 'Gemini సమాధానం ఇవ్వడానికి ఎక్కువ సమయం తీసుకుంది. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.'
          : 'Gemini took too long to respond. Please try again in a moment.')
      : lastStatus === 404
        ? (body.lang === 'te'
          ? 'ఈ API కీకి అందుబాటులో ఉన్న text chat మోడల్ దొరకలేదు. Google AI Studioలో మోడల్ access మరియు GEMINI_MODELని తనిఖీ చేయండి.'
          : 'No available text chat model was found for this API key. Check model access in Google AI Studio and verify GEMINI_MODEL.')
        : (body.lang === 'te'
          ? 'Gemini AI ప్రస్తుతం అందుబాటులో లేదు. దయచేసి API కీ, కోటా మరియు మోడల్ సెట్టింగ్‌లను తనిఖీ చేయండి.'
          : 'Gemini AI is temporarily unavailable. Check the API key, quota, and model configuration.');
    const code = lastStatus === 429
      ? 'GEMINI_QUOTA_EXCEEDED'
      : lastStatus === 504
        ? 'GEMINI_TIMEOUT'
        : lastStatus === 404
          ? 'GEMINI_MODELS_UNAVAILABLE'
          : 'GEMINI_UNAVAILABLE';
    res.status(lastStatus >= 500 ? lastStatus : 503).json({ reply, code });
  } catch (e) {
    console.error('Gemini chat request failed:', e);
    res.status(502).json({
      reply: body.lang === 'te'
        ? 'Gemini AIకి కనెక్ట్ కాలేకపోయాము. దయచేసి API కీ మరియు నెట్‌వర్క్‌ను తనిఖీ చేయండి.'
        : 'Could not connect to Gemini AI. Check the API key and network connection.',
    });
  }
}

export default async function handler(request) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  let statusCode = 200;
  let result;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      result = new Response(JSON.stringify(data), { status: statusCode, headers });
      return result;
    },
    setHeader(name, value) {
      headers.set(name, value);
    },
  };

  let body = '';
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > 64 * 1024) {
      return response.status(413).json({ reply: 'Request is too large.' });
    }
    body = await request.text();
    if (new TextEncoder().encode(body).length > 64 * 1024) {
      return response.status(413).json({ reply: 'Request is too large.' });
    }
  }

  await chat({ method: request.method, body }, response);
  if (result) return result;

  console.error('Chat handler completed without a response.');
  return response.status(500).json({ reply: 'The chat service could not complete the request.' });
}
