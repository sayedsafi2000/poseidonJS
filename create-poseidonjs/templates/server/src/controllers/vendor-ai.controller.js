const Product = require('../models/Product');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Generate content (ad copy, SEO, translate)
 * @route   POST /api/vendor/ai/write
 * @access  Private (Vendor, Admin)
 */
const generateContent = async (req, res, next) => {
  try {
    const { type, productId, content, targetLanguage, platform } = req.body;
    const { role, id } = req.user;

    if (!isClaudeConfigured()) {
      throw new ApiError(500, 'AI service is not configured. Please set ANTHROPIC_API_KEY.');
    }

    let product = null;
    if (productId) {
      product = await Product.findById(productId)
        .populate('categories', 'name')
        .populate('brand', 'name');
      
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (role === 'vendor' && product.vendor?.toString() !== id) {
        throw new ApiError(403, 'You can only generate content for your own products');
      }
    }

    let prompt = '';

    switch (type) {
      case 'facebook_ad':
        prompt = `Create a compelling Facebook ad copy for this product:

Product Name: ${product?.name || 'Product'}
Description: ${product?.description || content || 'No description'}
Price: $${product?.price || 'N/A'}
Category: ${product?.categories?.[0]?.name || 'General'}

Requirements:
- Engaging headline (max 40 characters)
- Compelling description (2-3 sentences)
- Clear call-to-action
- Use emojis appropriately
- Focus on benefits, not just features

Format as JSON:
{
  "headline": "...",
  "description": "...",
  "cta": "...",
  "hashtags": ["#tag1", "#tag2"]
}`;
        break;

      case 'instagram_caption':
        prompt = `Create an Instagram caption for this product:

Product Name: ${product?.name || 'Product'}
Description: ${product?.description || content || 'No description'}
Price: $${product?.price || 'N/A'}

Requirements:
- Engaging opening line
- Product benefits
- Relevant hashtags (10-15)
- Emojis for visual appeal
- Call to action

Format the caption ready to post.`;
        break;

      case 'tiktok_script':
        prompt = `Create a short TikTok video script (15-30 seconds) for this product:

Product Name: ${product?.name || 'Product'}
Description: ${product?.description || content || 'No description'}

Requirements:
- Hook in first 3 seconds
- Show product benefits
- Engaging and trendy language
- Include text overlays suggestions
- Call to action at the end

Format as script with timing.`;
        break;

      case 'seo_keywords':
        prompt = `Generate SEO keywords for this product:

Product Name: ${product?.name || 'Product'}
Description: ${product?.description || content || 'No description'}
Category: ${product?.categories?.[0]?.name || 'General'}
Brand: ${product?.brand?.name || 'N/A'}

Provide:
- Primary keyword (1)
- Secondary keywords (5-10)
- Long-tail keywords (5-10)
- Related search terms (5-10)

Format as JSON:
{
  "primary": "...",
  "secondary": ["...", "..."],
  "longTail": ["...", "..."],
  "related": ["...", "..."]
}`;
        break;

      case 'seo_description':
        prompt = `Write an SEO-optimized product description (150-160 characters) for:

Product Name: ${product?.name || 'Product'}
Current Description: ${product?.description || content || 'No description'}

Requirements:
- Include primary keyword naturally
- Compelling and informative
- Exactly 150-160 characters
- Include key benefits
- Call to action`;
        break;

      case 'better_title':
        prompt = `Create a better, more SEO-friendly product title for:

Current Title: ${product?.name || content || 'Product'}
Description: ${product?.description || 'No description'}
Category: ${product?.categories?.[0]?.name || 'General'}

Requirements:
- Include brand if available
- Include key features
- SEO-optimized
- Max 60 characters
- Compelling and clear`;
        break;

      case 'better_description':
        prompt = `Rewrite and improve this product description:

Current Description: ${product?.description || content || 'No description'}
Product Name: ${product?.name || 'Product'}
Category: ${product?.categories?.[0]?.name || 'General'}

Requirements:
- More engaging and persuasive
- Highlight key benefits
- Use bullet points for features
- Include call to action
- Professional yet friendly tone`;
        break;

      case 'translate':
        if (!targetLanguage) {
          throw new ApiError(400, 'targetLanguage is required for translation');
        }
        
        // Support multiple languages
        const languageMap = {
          'bangla': 'Bengali',
          'bengali': 'Bengali',
          'hindi': 'Hindi',
          'arabic': 'Arabic',
          'english': 'English',
          'en': 'English',
          'bn': 'Bengali',
          'hi': 'Hindi',
          'ar': 'Arabic',
        };
        
        const targetLang = languageMap[targetLanguage.toLowerCase()] || targetLanguage;
        
        prompt = `Translate the following text to ${targetLang} (${targetLanguage}):

Text: ${product?.description || content || 'No content provided'}

Requirements:
- Natural translation (not word-for-word)
- Maintain original meaning
- Cultural appropriateness
- Professional tone
- Use proper ${targetLang} grammar and vocabulary`;
        break;

      default:
        throw new ApiError(400, `Invalid type. Use: facebook_ad, instagram_caption, tiktok_script, seo_keywords, seo_description, better_title, better_description, translate`);
    }

    const raw = await generateClaudeText(prompt, { maxTokens: 4096 });
    if (!raw) {
      throw new ApiError(500, 'AI failed to generate content. Try again.');
    }
    let generatedContent = raw.trim();

    // Try to parse JSON if it's a JSON response
    if (generatedContent.startsWith('{') || generatedContent.startsWith('[')) {
      try {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedContent = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Not JSON, keep as string
      }
    }

    res.json({
      success: true,
      data: {
        type,
        content: generatedContent,
        productId: product?._id || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate SEO content
 * @route   POST /api/vendor/ai/seo
 * @access  Private
 */
const generateSEO = async (req, res, next) => {
  req.body.type = 'seo_keywords';
  return generateContent(req, res, next);
};

/**
 * Generate ad copy
 * @route   POST /api/vendor/ai/adcopy
 * @access  Private
 */
const generateAdCopy = async (req, res, next) => {
  const { platform = 'facebook' } = req.body;
  req.body.type = platform === 'instagram' ? 'instagram_caption' : 
                   platform === 'tiktok' ? 'tiktok_script' : 'facebook_ad';
  return generateContent(req, res, next);
};

/**
 * Translate content
 * @route   POST /api/vendor/ai/translate
 * @access  Private
 */
const translateContent = async (req, res, next) => {
  req.body.type = 'translate';
  return generateContent(req, res, next);
};

module.exports = {
  generateContent,
  generateSEO,
  generateAdCopy,
  translateContent,
};

