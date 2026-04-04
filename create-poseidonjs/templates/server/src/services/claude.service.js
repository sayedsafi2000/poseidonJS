const Anthropic = require('@anthropic-ai/sdk');

const INVALID_KEYS = new Set(['', 'your_claude_api_key_here', 'your_gemini_api_key_here']);

function isClaudeConfigured() {
  const k = process.env.ANTHROPIC_API_KEY;
  return Boolean(k && !INVALID_KEYS.has(String(k).trim()));
}

function getModel() {
  return process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
}

function getClient() {
  if (!isClaudeConfigured()) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * @param {string} prompt
 * @param {{ maxTokens?: number, system?: string, model?: string }} [options]
 * @returns {Promise<string|null>}
 */
async function generateClaudeText(prompt, options = {}) {
  const client = getClient();
  if (!client) return null;
  try {
    const max_tokens = options.maxTokens ?? 2048;
    const model = options.model || getModel();
    const payload = {
      model,
      max_tokens,
      messages: [{ role: 'user', content: prompt }],
    };
    if (options.system) {
      payload.system = options.system;
    }
    const response = await client.messages.create(payload);
    const first = response.content?.[0];
    if (first?.type === 'text' && first.text) {
      return first.text.trim();
    }
    return '';
  } catch (err) {
    console.error('Claude generateClaudeText error:', err.message || err);
    return null;
  }
}

module.exports = {
  isClaudeConfigured,
  generateClaudeText,
  getClient,
  getModel,
};
