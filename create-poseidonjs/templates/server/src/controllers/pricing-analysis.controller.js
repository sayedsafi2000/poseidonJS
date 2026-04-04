const Product = require('../models/Product');
const Category = require('../models/Category');
const PricingAnalysis = require('../models/PricingAnalysis');
const { ApiError } = require('../middleware/errorHandler');
const { isClaudeConfigured, generateClaudeText } = require('../services/claude.service');

/**
 * Analyze competitor pricing
 * @route   POST /api/pricing/analysis
 * @access  Private
 */
const analyzePricing = async (req, res, next) => {
  try {
    const { productId, categoryId } = req.body;
    const { role, id } = req.user;

    let product;
    if (productId) {
      product = await Product.findById(productId)
        .populate('categories')
        .populate('brand');
      
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (role === 'vendor' && product.vendor?.toString() !== id) {
        throw new ApiError(403, 'You can only analyze your own products');
      }
    } else {
      throw new ApiError(400, 'productId is required');
    }

    // Find similar products (same category or brand)
    const similarQuery = { isActive: true, _id: { $ne: product._id } };
    
    if (product.categories && product.categories.length > 0) {
      similarQuery.categories = { $in: product.categories.map(c => c._id || c) };
    } else if (product.brand) {
      similarQuery.brand = product.brand._id || product.brand;
    }

    const similarProducts = await Product.find(similarQuery)
      .populate('vendor', 'firstName lastName')
      .select('name price salePrice vendor')
      .limit(20);

    if (similarProducts.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No similar products found for comparison',
          product: {
            id: product._id,
            name: product.name,
            currentPrice: product.price,
          },
        },
      });
    }

    // Calculate market average
    const prices = similarProducts
      .map(p => p.salePrice || p.price)
      .filter(p => p > 0);
    
    const averageMarketPrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : product.price;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const currentPrice = product.salePrice || product.price;
    let priceStatus = 'competitive';
    let recommendedPrice = currentPrice;
    let suggestedDiscount = 0;
    let suggestedIncrease = 0;

    // Determine price status
    if (currentPrice > maxPrice * 1.2) {
      priceStatus = 'overpriced';
      recommendedPrice = averageMarketPrice;
      suggestedDiscount = Math.round(((currentPrice - recommendedPrice) / currentPrice) * 100);
    } else if (currentPrice < minPrice * 0.8) {
      priceStatus = 'underpriced';
      recommendedPrice = averageMarketPrice;
      suggestedIncrease = Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100);
    } else if (currentPrice > averageMarketPrice * 1.1) {
      priceStatus = 'overpriced';
      recommendedPrice = averageMarketPrice;
      suggestedDiscount = Math.round(((currentPrice - recommendedPrice) / currentPrice) * 100);
    } else if (currentPrice < averageMarketPrice * 0.9) {
      priceStatus = 'underpriced';
      recommendedPrice = averageMarketPrice;
      suggestedIncrease = Math.round(((recommendedPrice - currentPrice) / currentPrice) * 100);
    } else {
      priceStatus = 'optimal';
    }

    // Generate AI recommendation
    let aiRecommendation = '';
    if (isClaudeConfigured()) {
      try {
        const prompt = `Analyze pricing for this product:

Product: ${product.name}
Current Price: $${currentPrice}
Market Average: $${averageMarketPrice.toFixed(2)}
Market Range: $${minPrice} - $${maxPrice}
Price Status: ${priceStatus}

Provide a pricing recommendation with reasoning.`;

        const text = await generateClaudeText(prompt, { maxTokens: 512 });
        if (text) aiRecommendation = text.trim();
      } catch (error) {
        console.error('AI pricing analysis error:', error);
      }
    }

    if (!aiRecommendation) {
      if (priceStatus === 'overpriced') {
        aiRecommendation = `Your product is priced ${suggestedDiscount}% above market average. Consider reducing to $${recommendedPrice.toFixed(2)} to remain competitive.`;
      } else if (priceStatus === 'underpriced') {
        aiRecommendation = `Your product is priced below market average. You could increase by ${suggestedIncrease}% to $${recommendedPrice.toFixed(2)} to maximize revenue.`;
      } else {
        aiRecommendation = `Your pricing is competitive. Current price aligns well with market average.`;
      }
    }

    // Save analysis
    const analysis = await PricingAnalysis.create({
      product: product._id,
      category: product.categories?.[0]?._id || product.categories?.[0] || null,
      currentPrice,
      competitorPrices: similarProducts.map(p => ({
        vendor: p.vendor?._id || p.vendor,
        price: p.salePrice || p.price,
        productName: p.name,
      })),
      averageMarketPrice,
      recommendedPrice,
      priceStatus,
      aiRecommendation,
      suggestedDiscount,
      suggestedIncrease,
    });

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          currentPrice,
        },
        marketAnalysis: {
          averagePrice: averageMarketPrice,
          minPrice,
          maxPrice,
          competitorCount: similarProducts.length,
        },
        recommendation: {
          priceStatus,
          recommendedPrice,
          suggestedDiscount,
          suggestedIncrease,
          aiRecommendation,
        },
        competitors: similarProducts.slice(0, 10).map(p => ({
          name: p.name,
          vendor: p.vendor ? `${p.vendor.firstName} ${p.vendor.lastName}` : 'Unknown',
          price: p.salePrice || p.price,
        })),
        analysisId: analysis._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzePricing,
};

