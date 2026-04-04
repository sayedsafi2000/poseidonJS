# Claude AI Integration Setup Guide

## ⚠️ IMPORTANT: Secure Your API Key

Your previous Claude API key has been exposed and should be **immediately regenerated**:

1. Go to https://console.anthropic.com/
2. Navigate to your API keys section
3. Delete any API key that was ever committed to git or pasted into docs (revoke it in the Anthropic console; never store real keys in markdown or repos)
4. Generate a new API key
5. Store it securely and never share it in messages or version control

## Setup Steps

### 1. Install Dependencies

```bash
cd create-poseidonjs/templates/server
npm install
```

This will install the Anthropic SDK: `@anthropic-ai/sdk`

### 2. Configure Environment Variables

Add the following to your `.env` file in the server directory:

```env
# Claude AI Configuration
ANTHROPIC_API_KEY=your_new_claude_api_key_here
```

**IMPORTANT**: 
- Replace `your_new_claude_api_key_here` with your actual Claude API key
- Never commit `.env` files to version control
- Use a `.env.example` file for team members to reference the required variables

### 3. What Changed

#### Backend Changes:
- **File**: `/templates/server/src/controllers/ai.controller.js`
  - Replaced Google Generative AI (Gemini) with Anthropic Claude SDK
  - Updated all API calls to use Claude's message format
  - Maintained keyword-based fallback detection for reliability
  - Model: `claude-3-5-sonnet-20241022` (latest Sonnet model)

- **File**: `/templates/server/package.json`
  - Removed: `@google/generative-ai`
  - Added: `@anthropic-ai/sdk`

#### Frontend Changes:
- **File**: `/templates/admin/src/components/AIChat.tsx`
  - Updated AI assistant badge from "Powered by Gemini" to "Powered by Claude"

### 4. AI Features Available

Your AI assistant can help with:
- ✅ **Product Management**: Create products with natural language
- ✅ **Inventory Management**: Check low stock, forecasting, cleanup suggestions
- ✅ **Sales Analytics**: Top-selling products, sales summaries
- ✅ **Order Management**: Recent orders, order notifications
- ✅ **Business Intelligence**: Daily/weekly/monthly summaries
- ✅ **Quality Assurance**: Review analysis, fraud detection
- ✅ **Performance**: Vendor ranking, customer insights

### 5. Example Prompts

```
"Add a product named Gold Ring with price $100 and stock 50"
"Show me low stock products"
"What are the top selling products?"
"Give me daily summary"
"Check for fraud"
"Show vendor ranking"
```

## API Comparison

### Gemini (Old)
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
const result = await model.generateContent(prompt);
```

### Claude (New)
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic();
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  messages: [{ role: 'user', content: prompt }]
});
```

## Fallback Mechanism

The system includes intelligent fallback handling:
1. **Keyword-based Detection**: Works even without API key
2. **Intent Classification**: First uses keywords, then Claude
3. **Product Extraction**: Keyword fallback if Claude fails
4. **Response Generation**: Built-in fallback responses for all intents

This ensures your dashboard remains functional even if the Claude API is temporarily unavailable.

## Monitoring & Debugging

Check logs for Claude integration status:
```bash
# Development
npm run dev  # Logs will show if API key is configured

# Production
NODE_ENV=production node src/server.js
```

Look for:
- ✅ `ANTHROPIC_API_KEY` configuration status
- ✅ Intent classification results
- ✅ Product extraction results
- ✅ Response generation logs

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"
- Ensure your `.env` file contains the key
- Restart the server after updating `.env`
- Verify the key format: `sk-ant-...`

### Empty responses from Claude
- The system falls back to keyword-based responses
- Check that your prompt is clear and specific
- Try simpler prompts first

### API Errors
- Check your Claude API account has remaining credits
- Verify the API key hasn't been revoked
- Check API rate limits (Claude has different limits than Gemini)

## Performance Notes

**Claude vs Gemini:**
- **Accuracy**: Claude generally provides better reasoning
- **Speed**: Claude is comparable or faster than Gemini 1.5
- **Cost**: Check current pricing at https://www.anthropic.com/pricing
- **Rate Limits**: 50 requests/minute for most plans

## Next Steps

1. ✅ Regenerate and secure your API key
2. ✅ Update `.env` with the new key
3. ✅ Run `npm install` to update dependencies
4. ✅ Restart your development/production server
5. ✅ Test the AI assistant in the dashboard

---

**Last Updated**: 2024
**Status**: ✅ Claude Integration Complete
**Model**: Claude 3.5 Sonnet
