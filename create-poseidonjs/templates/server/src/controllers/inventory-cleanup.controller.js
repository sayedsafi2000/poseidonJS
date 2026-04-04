const Product = require('../models/Product');
const Order = require('../models/Order');
const AIInsight = require('../models/AIInsight');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Get inventory cleanup suggestions
 * @route   GET /api/products/cleanup-suggestions
 * @access  Private
 */
const getCleanupSuggestions = async (req, res, next) => {
  try {
    const { role, id } = req.user;

    const productQuery = { isActive: true };
    if (role === 'vendor') {
      productQuery.vendor = id;
    }

    const products = await Product.find(productQuery)
      .select('name sku stock price salePrice soldCount createdAt categories');

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Analyze products
    const deadStock = [];
    const slowMoving = [];
    const discountCandidates = [];
    const clearanceCandidates = [];

    for (const product of products) {
      const daysSinceCreation = (now - product.createdAt) / (1000 * 60 * 60 * 24);
      const soldCount = product.soldCount || 0;
      const stock = product.stock || 0;
      const hasStock = stock > 0;

      // Dead stock: No sales in 6+ months, has stock
      if (hasStock && daysSinceCreation > 180 && soldCount === 0) {
        deadStock.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          stock,
          daysSinceCreation: Math.round(daysSinceCreation),
          soldCount: 0,
          recommendation: 'dead_stock',
          suggestedAction: 'Consider removing or heavy discount',
          suggestedDiscount: 50,
        });
      }
      // Slow moving: Low sales, old product
      else if (hasStock && daysSinceCreation > 90 && soldCount < 5) {
        slowMoving.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          stock,
          daysSinceCreation: Math.round(daysSinceCreation),
          soldCount,
          recommendation: 'slow_moving',
          suggestedAction: 'Consider promotion or price adjustment',
          suggestedDiscount: 30,
        });
      }
      // Discount candidates: Some sales but could be better
      else if (hasStock && soldCount > 0 && soldCount < 10 && daysSinceCreation > 60) {
        discountCandidates.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          stock,
          soldCount,
          recommendation: 'discount_candidate',
          suggestedAction: 'Run a promotion to boost sales',
          suggestedDiscount: 20,
        });
      }
      // Clearance: High stock, low sales
      else if (stock > 50 && soldCount < stock * 0.1) {
        clearanceCandidates.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          stock,
          soldCount,
          recommendation: 'clearance',
          suggestedAction: 'Clearance sale recommended',
          suggestedDiscount: 40,
        });
      }
    }

    // Generate AI recommendations
    let aiRecommendations = '';
    const summaryData = {
      deadStock: deadStock.length,
      slowMoving: slowMoving.length,
      discountCandidates: discountCandidates.length,
      clearanceCandidates: clearanceCandidates.length,
    };

    if (isClaudeConfigured()) {
      try {
        const prompt = `Analyze this inventory data and provide recommendations:

Dead Stock Products: ${deadStock.length}
Slow Moving Products: ${slowMoving.length}
Discount Candidates: ${discountCandidates.length}
Clearance Candidates: ${clearanceCandidates.length}

Provide actionable recommendations for inventory cleanup.`;

        const text = await generateClaudeText(prompt, { maxTokens: 1024 });
        if (text) aiRecommendations = text.trim();
      } catch (error) {
        console.error('AI recommendation error:', error);
      }
    }

    if (!aiRecommendations) {
      aiRecommendations = `Inventory Cleanup Recommendations:
- ${deadStock.length} dead stock products: Consider removing or 50%+ discount
- ${slowMoving.length} slow-moving products: Run promotions (30% discount)
- ${discountCandidates.length} discount candidates: Boost with 20% discount
- ${clearanceCandidates.length} clearance candidates: Clearance sale (40% discount)`;
    }

    // Save insight
    await AIInsight.create({
      type: 'inventory_cleanup',
      title: 'Inventory Cleanup Suggestions',
      insight: aiRecommendations,
      priority: deadStock.length > 10 ? 'high' : 'medium',
      actionable: true,
      metadata: summaryData,
    });

    res.json({
      success: true,
      data: {
        deadStock: deadStock.slice(0, 20),
        slowMoving: slowMoving.slice(0, 20),
        discountCandidates: discountCandidates.slice(0, 20),
        clearanceCandidates: clearanceCandidates.slice(0, 20),
        summary: {
          totalDeadStock: deadStock.length,
          totalSlowMoving: slowMoving.length,
          totalDiscountCandidates: discountCandidates.length,
          totalClearance: clearanceCandidates.length,
        },
        aiRecommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCleanupSuggestions,
};

