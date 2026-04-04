const Review = require('../models/Review');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Analyze sentiment using AI
 */
const analyzeSentiment = async (text) => {
  if (!isClaudeConfigured()) {
    // Simple keyword-based sentiment
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointed', 'worst', 'broken', 'defective'];
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'best'];
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  try {
    const prompt = `Analyze the sentiment of this review: "${text}". Respond with ONLY one word: "positive", "neutral", or "negative".`;
    const out = await generateClaudeText(prompt, { maxTokens: 20 });
    const sentiment = (out || '').trim().toLowerCase();
    return ['positive', 'neutral', 'negative'].includes(sentiment) ? sentiment : 'neutral';
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 'neutral';
  }
};

/**
 * Analyze reviews for a product or vendor
 * @route   GET /api/reviews/analyze
 * @access  Private
 */
const analyzeReviews = async (req, res, next) => {
  try {
    const { productId, vendorId, type = 'overall' } = req.query;
    const { role, id } = req.user;

    let query = {};

    if (productId) {
      query.product = productId;
    } else if (vendorId) {
      if (role === 'vendor' && vendorId !== id) {
        throw new ApiError(403, 'You can only analyze your own reviews');
      }
      query.vendor = vendorId;
    }

    // Get reviews
    const reviews = await Review.find(query)
      .populate('product', 'name')
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No reviews found for analysis',
          sentiment: { positive: 0, neutral: 0, negative: 0, overall: 'neutral' },
          commonProblems: [],
          improvements: [],
          serviceQualityScore: 0,
        },
      });
    }

    // Analyze sentiment
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const allComments = [];

    for (const review of reviews) {
      const sentiment = await analyzeSentiment(review.comment);
      sentimentCounts[sentiment]++;
      allComments.push({ comment: review.comment, sentiment, rating: review.rating });
    }

    const total = reviews.length;
    const overallSentiment = 
      sentimentCounts.positive > sentimentCounts.negative ? 'positive' :
      sentimentCounts.negative > sentimentCounts.positive ? 'negative' : 'neutral';

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    // Find common problems (using AI if available)
    let commonProblems = [];
    let improvements = [];
    let aiSummary = '';

    if (isClaudeConfigured()) {
      try {
        const commentsText = allComments.map(c => c.comment).join('\n');
        const prompt = `Analyze these customer reviews and identify:
1. Common problems mentioned (list top 5)
2. Improvement suggestions (list top 5)

Reviews:
${commentsText}

Respond in JSON format:
{
  "problems": [{"issue": "problem description", "frequency": number, "severity": "low|medium|high"}],
  "improvements": ["suggestion1", "suggestion2", ...],
  "summary": "brief summary"
}`;

        const jsonText = await generateClaudeText(prompt, { maxTokens: 2048 });
        const jsonMatch = jsonText?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          commonProblems = analysis.problems || [];
          improvements = analysis.improvements || [];
          aiSummary = analysis.summary || '';
        }
      } catch (error) {
        console.error('AI analysis error:', error);
      }
    }

    // Fallback: simple keyword extraction
    if (commonProblems.length === 0) {
      const problemKeywords = ['broken', 'defective', 'damaged', 'late', 'slow', 'wrong', 'missing'];
      const problemCounts = {};
      allComments.forEach(({ comment }) => {
        problemKeywords.forEach(keyword => {
          if (comment.toLowerCase().includes(keyword)) {
            problemCounts[keyword] = (problemCounts[keyword] || 0) + 1;
          }
        });
      });
      commonProblems = Object.entries(problemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, frequency]) => ({
          issue,
          frequency,
          severity: frequency > 5 ? 'high' : frequency > 2 ? 'medium' : 'low',
        }));
    }

    // Calculate service quality score (0-100)
    const serviceQualityScore = Math.round(
      (avgRating / 5) * 40 + // Rating contributes 40%
      (sentimentCounts.positive / total) * 40 + // Positive sentiment 40%
      (1 - sentimentCounts.negative / total) * 20 // Negative sentiment penalty 20%
    );

    // Save analysis
    const analysis = await ReviewAnalysis.create({
      product: productId || null,
      vendor: vendorId || null,
      analysisType: productId ? 'product' : vendorId ? 'vendor' : 'overall',
      sentiment: {
        ...sentimentCounts,
        overall: overallSentiment,
      },
      commonProblems,
      improvements,
      serviceQualityScore,
      aiSummary: aiSummary || `Average rating: ${avgRating.toFixed(1)}/5. ${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative reviews.`,
    });

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        totalReviews: total,
        averageRating: avgRating.toFixed(2),
        sentiment: {
          ...sentimentCounts,
          overall: overallSentiment,
        },
        commonProblems,
        improvements,
        serviceQualityScore,
        aiSummary: analysis.aiSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor review analysis
 * @route   GET /api/vendor/:id/review-analysis
 * @access  Private
 */
const getVendorReviewAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    if (role === 'vendor' && id !== userId) {
      throw new ApiError(403, 'You can only view your own analysis');
    }

    const analysis = await ReviewAnalysis.findOne({ vendor: id })
      .sort({ analyzedAt: -1 });

    if (!analysis) {
      // Trigger new analysis
      req.query.vendorId = id;
      return analyzeReviews(req, res, next);
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeReviews,
  getVendorReviewAnalysis,
};

