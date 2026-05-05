const Anthropic = require('@anthropic-ai/sdk');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { ApiError } = require('../middleware/errorHandler');

// Initialize Claude AI (reads ANTHROPIC_API_KEY from env when set)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || undefined,
});

/**
 * Intent classification using Gemini
 */
/**
 * Simple keyword-based intent detection (fallback when AI is not available)
 */
const classifyIntentByKeywords = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Product creation keywords
  if (lowerMessage.includes('add') && lowerMessage.includes('product') || 
      lowerMessage.includes('create') && lowerMessage.includes('product') ||
      (lowerMessage.includes('add') || lowerMessage.includes('create')) && 
      (lowerMessage.includes('named') || lowerMessage.includes('name'))) {
    return 'PRODUCT_CREATE';
  }
  
  // Low stock keywords
  if (lowerMessage.includes('low stock') || lowerMessage.includes('low inventory') ||
      lowerMessage.includes('out of stock') || lowerMessage.includes('stock level')) {
    return 'LOW_STOCK';
  }
  
  // Top selling keywords
  if (lowerMessage.includes('top selling') || lowerMessage.includes('best selling') ||
      lowerMessage.includes('most sold') || lowerMessage.includes('top products')) {
    return 'TOP_SELLING';
  }
  
  // Stock forecast keywords
  if (lowerMessage.includes('reorder') || lowerMessage.includes('forecast') ||
      lowerMessage.includes('stock recommendation') || lowerMessage.includes('how much stock')) {
    return 'STOCK_FORECAST';
  }
  
  // Order keywords
  if (lowerMessage.includes('order') && (lowerMessage.includes('recent') || 
      lowerMessage.includes('today') || lowerMessage.includes('show'))) {
    return 'ORDER_NOTIFICATIONS';
  }
  
  // Summary keywords
  if (lowerMessage.includes('daily summary') || lowerMessage.includes('today summary')) {
    return 'DAILY_SUMMARY';
  }
  if (lowerMessage.includes('weekly summary')) {
    return 'WEEKLY_SUMMARY';
  }
  if (lowerMessage.includes('monthly summary')) {
    return 'MONTHLY_SUMMARY';
  }
  
  // Review analysis
  if (lowerMessage.includes('review') && (lowerMessage.includes('analyze') || 
      lowerMessage.includes('sentiment'))) {
    return 'REVIEW_ANALYSIS';
  }
  
  // Fraud check
  if (lowerMessage.includes('fraud') || lowerMessage.includes('suspicious')) {
    return 'FRAUD_CHECK';
  }
  
  // Vendor ranking
  if (lowerMessage.includes('vendor ranking') || lowerMessage.includes('vendor performance')) {
    return 'VENDOR_RANKING';
  }
  
  // Inventory cleanup
  if (lowerMessage.includes('inventory cleanup') || lowerMessage.includes('dead stock') ||
      lowerMessage.includes('slow moving')) {
    return 'INVENTORY_CLEANUP';
  }
  
  // Customer insights
  if (lowerMessage.includes('customer insight') || lowerMessage.includes('customer behavior')) {
    return 'CUSTOMER_INSIGHTS';
  }
  
  return 'GENERAL_QUERY';
};

const classifyIntent = async (message) => {
  // First try keyword-based detection (always works)
  const keywordIntent = classifyIntentByKeywords(message);
  
  try {
    // If API key is not configured, use keyword-based detection
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      console.log('ANTHROPIC_API_KEY not configured, using keyword-based intent detection:', keywordIntent);
      return keywordIntent;
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `You are an intent classifier for an e-commerce admin dashboard. Classify the following user message into one of these intents:

INTENTS:
- PRODUCT_CREATE: User wants to create/add a new product
- LOW_STOCK: User is asking about low stock products
- TOP_SELLING: User is asking about top-selling/best-selling products
- STOCK_FORECAST: User is asking about stock recommendations, reorder quantities, or forecasting
- ORDER_NOTIFICATIONS: User is asking about orders, recent orders, or order notifications
- DAILY_SUMMARY: User wants daily business summary
- WEEKLY_SUMMARY: User wants weekly business summary
- MONTHLY_SUMMARY: User wants monthly business summary
- REVIEW_ANALYSIS: User wants to analyze reviews or check review sentiment
- FRAUD_CHECK: User wants to check for fraud or suspicious activity
- VENDOR_RANKING: User wants to see vendor performance ranking
- INVENTORY_CLEANUP: User wants inventory cleanup suggestions
- COMPETITOR_PRICING: User wants competitor price analysis
- SEO_CONTENT: User wants SEO content or keywords
- AD_COPY: User wants ad copy for products (Facebook, Instagram, etc.)
- AUTO_REPLY: User wants auto-generated customer response
- TRANSLATION: User wants to translate content
- VENDOR_IMPROVEMENT: User wants vendor improvement suggestions
- CUSTOMER_INSIGHTS: User wants customer behavior insights
- GENERAL_QUERY: General questions, greetings, or other queries

User message: "${message}"

Respond with ONLY the intent name (e.g., "PRODUCT_CREATE" or "LOW_STOCK"). Do not include any explanation.`
        }
      ]
    });

    const intent = response.content[0].text.trim().toUpperCase();

    // Validate intent
    const validIntents = [
      'PRODUCT_CREATE', 'LOW_STOCK', 'TOP_SELLING', 'STOCK_FORECAST', 'ORDER_NOTIFICATIONS',
      'DAILY_SUMMARY', 'WEEKLY_SUMMARY', 'MONTHLY_SUMMARY', 'REVIEW_ANALYSIS', 'FRAUD_CHECK',
      'VENDOR_RANKING', 'INVENTORY_CLEANUP', 'COMPETITOR_PRICING', 'SEO_CONTENT', 'AD_COPY',
      'AUTO_REPLY', 'TRANSLATION', 'VENDOR_IMPROVEMENT', 'CUSTOMER_INSIGHTS', 'GENERAL_QUERY'
    ];
    const aiIntent = validIntents.includes(intent) ? intent : keywordIntent;
    
    // If Claude returns GENERAL_QUERY but keywords suggest something else, trust keywords for product creation
    if (aiIntent === 'GENERAL_QUERY' && keywordIntent === 'PRODUCT_CREATE') {
      console.log('Claude returned GENERAL_QUERY but keywords suggest PRODUCT_CREATE, using PRODUCT_CREATE');
      return 'PRODUCT_CREATE';
    }
    
    return aiIntent;
  } catch (error) {
    console.error('Intent classification error:', error.message || error);
    // Fallback to keyword-based detection on error
    return keywordIntent;
  }
};

/**
 * Simple keyword-based product data extraction (fallback)
 */
const extractProductDataByKeywords = (message) => {
  const data = {};
  console.log('Extracting product data from message:', message);
  
  // Extract product name (after "named" or "name")
  // Pattern: "named Gold Ring" or "name Gold Ring with price"
  let nameMatch = message.match(/(?:named|name)\s+([^,]+?)(?:\s+with|\s+price|\s+and|$)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
    console.log('Extracted name (method 1):', data.name);
  } else {
    // Try to find name after "add product" or "create product"
    // Pattern: "add product Gold Ring" or "add a product named Gold Ring"
    const addMatch = message.match(/(?:add|create)\s+(?:a\s+)?product\s+(?:named\s+)?([^,]+?)(?:\s+with|\s+price|\s+and|$)/i);
    if (addMatch && addMatch[1]) {
      data.name = addMatch[1].trim();
      console.log('Extracted name (method 2):', data.name);
    } else {
      // Last resort: try to extract between "product" and "with" or "price"
      const fallbackMatch = message.match(/product\s+([^,]+?)(?:\s+with|\s+price)/i);
      if (fallbackMatch && fallbackMatch[1] && !fallbackMatch[1].includes('named')) {
        data.name = fallbackMatch[1].trim();
        console.log('Extracted name (method 3):', data.name);
      }
    }
  }
  
  // Extract price (look for $XXX or price XXX)
  // Pattern: "$100" or "price $100" or "price 100"
  const priceMatch = message.match(/\$(\d+(?:\.\d+)?)/) || 
                     message.match(/(?:price|cost)\s*(?:is|of|:)?\s*\$?(\d+(?:\.\d+)?)/i);
  if (priceMatch && priceMatch[1]) {
    data.price = parseFloat(priceMatch[1]);
    console.log('Extracted price:', data.price);
  } else {
    // Try to find any number that might be a price
    const numberMatch = message.match(/\$?(\d+(?:\.\d+)?)/);
    if (numberMatch && numberMatch[1]) {
      const num = parseFloat(numberMatch[1]);
      // If it's a reasonable price (between 0.01 and 1000000), assume it's the price
      if (num >= 0.01 && num <= 1000000) {
        data.price = num;
        console.log('Extracted price (fallback):', data.price);
      }
    }
  }
  
  // Extract stock (look for "stock XXX" or "quantity XXX")
  const stockMatch = message.match(/(?:stock|quantity|qty)\s*(?:is|of|:)?\s*(\d+)/i);
  if (stockMatch && stockMatch[1]) {
    data.stock = parseInt(stockMatch[1]);
    console.log('Extracted stock:', data.stock);
  }
  
  // Extract description if available
  const descMatch = message.match(/(?:description|desc|details?)\s*:?\s*([^,]+)/i);
  if (descMatch && descMatch[1]) {
    data.description = descMatch[1].trim();
  }
  
  // Extract SKU if available
  const skuMatch = message.match(/(?:sku|code)\s*:?\s*([A-Z0-9-]+)/i);
  if (skuMatch && skuMatch[1]) {
    data.sku = skuMatch[1].trim();
  }
  
  console.log('Final extracted data:', data);
  return data;
};

/**
 * Extract product data from message using Claude
 */
const extractProductData = async (message) => {
  // First try keyword-based extraction (always works). Hoisted so the catch
  // block below can fall back to it when the AI call throws.
  const keywordData = extractProductDataByKeywords(message);

  try {
    // If API key is not configured, use keyword-based extraction
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      console.log('Using keyword-based product extraction:', keywordData);
      return keywordData;
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract product information from the following message and return it as JSON. Only include fields that are mentioned.

Message: "${message}"

Return JSON with these possible fields:
{
  "name": "product name",
  "description": "product description",
  "price": number,
  "salePrice": number (optional),
  "sku": "SKU code",
  "stock": number,
  "category": "category name",
  "brand": "brand name",
  "tags": "comma separated tags"
}

If a field is not mentioned, omit it from the JSON. Return ONLY valid JSON, no other text.`
        }
      ]
    });

    const jsonText = response.content[0].text.trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiData = JSON.parse(jsonMatch[0]);
      // Merge AI data with keyword data (keyword data as fallback)
      return { ...keywordData, ...aiData };
    }
    
    // If AI extraction fails, return keyword-based data
    return keywordData;
  } catch (error) {
    console.error('Product extraction error:', error.message || error);
    // Fallback to keyword-based extraction on error
    return keywordData;
  }
};

/**
 * Generate AI response based on intent and data
 */
const generateAIResponse = async (intent, data, userMessage) => {
  try {
    // If no API key, return a helpful fallback response
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      return getFallbackResponse(intent, data, userMessage);
    }

    let systemPrompt = '';
    let contextData = '';

    switch (intent) {
      case 'PRODUCT_CREATE':
        systemPrompt = `You are an AI assistant helping an admin create a product. The user wants to add a product.`;
        contextData = `Product data extracted: ${JSON.stringify(data)}`;
        break;

      case 'LOW_STOCK':
        systemPrompt = `You are an AI assistant helping an admin manage inventory. Provide a helpful summary of low stock products.`;
        contextData = `Low stock products: ${JSON.stringify(data)}`;
        break;

      case 'TOP_SELLING':
        systemPrompt = `You are an AI assistant helping an admin analyze sales. Provide insights about top-selling products.`;
        contextData = `Top selling products: ${JSON.stringify(data)}`;
        break;

      case 'STOCK_FORECAST':
        systemPrompt = `You are an AI assistant helping an admin with inventory management. Provide stock recommendations and forecasting insights.`;
        contextData = `Stock data: ${JSON.stringify(data)}`;
        break;

      case 'ORDER_NOTIFICATIONS':
        systemPrompt = `You are an AI assistant helping an admin manage orders. Provide information about recent orders.`;
        contextData = `Recent orders: ${JSON.stringify(data)}`;
        break;

      default:
        systemPrompt = `You are a helpful AI assistant for an e-commerce admin dashboard. Answer the user's question helpfully.`;
        contextData = '';
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}

${contextData ? `Context Data:\n${contextData}\n\n` : ''}User message: "${userMessage}"

Provide a helpful, concise response. If product creation was requested, confirm what will be created.`
        }
      ]
    });

    const text = response.content[0].text;
    
    // Ensure we always return a non-empty string
    if (!text || text.trim().length === 0) {
      console.warn('Empty response from Claude, using fallback');
      return getFallbackResponse(intent, data, userMessage);
    }
    
    return text.trim();
  } catch (error) {
    console.error('Claude response generation error:', error.message || error);
    // Return fallback response based on intent
    const fallback = getFallbackResponse(intent, data, userMessage);
    return fallback || 'I apologize, but I encountered an error processing your request. Please try again.';
  }
};

/**
 * Fallback response when AI is not available
 */
const getFallbackResponse = (intent, data, userMessage) => {
  switch (intent) {
    case 'LOW_STOCK':
      if (data && Array.isArray(data) && data.length > 0) {
        const productList = data.slice(0, 5).map(p => `- ${p.name} (Stock: ${p.stock})`).join('\n');
        return `Here are the low stock products:\n\n${productList}${data.length > 5 ? `\n\n...and ${data.length - 5} more products with low stock.` : ''}\n\nPlease consider restocking these items soon.`;
      }
      return 'No low stock products found at the moment.';

    case 'TOP_SELLING':
      if (data && Array.isArray(data) && data.length > 0) {
        const productList = data.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - Sold: ${p.soldCount || 0}`).join('\n');
        return `Top selling products:\n\n${productList}`;
      }
      return 'No sales data available at the moment.';

    case 'STOCK_FORECAST':
      if (data && Array.isArray(data) && data.length > 0) {
        const recommendations = data.slice(0, 5).map(p => 
          `- ${p.name}: Current stock ${p.currentStock}, Recommended: ${p.recommendedStock} (${p.urgency} priority)`
        ).join('\n');
        return `Stock recommendations:\n\n${recommendations}`;
      }
      return 'No stock forecast data available.';

    case 'ORDER_NOTIFICATIONS':
      if (data && Array.isArray(data) && data.length > 0) {
        return `You have ${data.length} recent order${data.length > 1 ? 's' : ''}. Check the Orders page for details.`;
      }
      return 'No recent orders found.';

    case 'PRODUCT_CREATE':
      return 'I can help you create products. Please provide the product name, price, and other details.';

    default:
    case 'GENERAL_QUERY':
      // For general queries, provide a helpful response based on the user message
      const lowerMessage = (userMessage || '').toLowerCase();
      
      if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('product')) {
        return 'I can help you create products! Try saying something like: "Add a product named Gold Ring with price $100 and stock 50"';
      }
      if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
        return 'I can check your inventory! Try asking: "Which products are low stock?" or "Show me low stock items"';
      }
      if (lowerMessage.includes('order') || lowerMessage.includes('sales')) {
        return 'I can help with orders! Try asking: "Show me recent orders" or "What are today\'s orders?"';
      }
      if (lowerMessage.includes('top') || lowerMessage.includes('selling') || lowerMessage.includes('best')) {
        return 'I can show you top-selling products! Try asking: "Which products sold the most?" or "Show top selling products"';
      }
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
        return `Hello! I'm your AI assistant. I can help you with:

- Creating products (e.g., "Add a product named Gold Ring with price $100")
- Checking low stock items (e.g., "Which products are low stock?")
- Viewing top-selling products (e.g., "Show me top selling products")
- Stock recommendations (e.g., "What should I reorder?")
- Order information (e.g., "Show recent orders")
- Business summaries (e.g., "Show daily summary")
- Review analysis (e.g., "Analyze reviews")
- Vendor ranking (e.g., "Show vendor ranking")
- Inventory cleanup (e.g., "Suggest inventory cleanup")

How can I assist you today?`;
      }
      
      return `I understand you're asking about: "${userMessage || 'something'}". 

I can help you with:
- Creating products
- Checking low stock items  
- Viewing top-selling products
- Stock recommendations
- Order information
- Business summaries
- Review analysis
- Vendor performance
- Inventory management

Try asking me something specific, like "Show me low stock products" or "Add a product named [name] with price $[amount]".`;
  }
};

/**
 * Handle PRODUCT_CREATE intent
 */
const handleProductCreate = async (extractedData, userId) => {
  try {
    console.log('handleProductCreate called with data:', JSON.stringify(extractedData, null, 2));
    
    // Validate required fields
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return {
        success: false,
        message: 'I couldn\'t extract product information from your message. Please provide: product name, price, and stock. Example: "Add a product named Gold Ring with price $100 and stock 50"',
        data: null,
      };
    }
    
    if (!extractedData.name || extractedData.name.trim() === '') {
      return {
        success: false,
        message: 'Product name is required. Please specify the product name. Example: "Add a product named Gold Ring..."',
        data: null,
      };
    }
    
    if (extractedData.price === undefined || extractedData.price === null || isNaN(extractedData.price)) {
      return {
        success: false,
        message: 'Product price is required. Please specify the price. Example: "...with price $100..."',
        data: null,
      };
    }

    // Generate slug from name
    const slug = extractedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    let finalSlug = slug;
    if (existingProduct) {
      finalSlug = `${slug}-${Date.now()}`;
    }
    
    // Create product
    const productData = {
      name: extractedData.name,
      slug: finalSlug,
      description: extractedData.description || `Product: ${extractedData.name}`,
      price: parseFloat(extractedData.price) || 0,
      salePrice: extractedData.salePrice ? parseFloat(extractedData.salePrice) : undefined,
      sku: extractedData.sku || `SKU-${Date.now()}`,
      stock: parseInt(extractedData.stock) || 0,
      isActive: true,
    };

    // Handle category and brand if provided
    if (extractedData.category) {
      const Category = require('../models/Category');
      let category = await Category.findOne({ name: { $regex: new RegExp(`^${extractedData.category}$`, 'i') } });
      if (category) {
        productData.categories = [category._id];
      }
    }

    if (extractedData.brand) {
      const Brand = require('../models/Brand');
      let brand = await Brand.findOne({ name: { $regex: new RegExp(`^${extractedData.brand}$`, 'i') } });
      if (brand) {
        productData.brand = brand._id;
      }
    }

    // Assign product to vendor if user is a vendor
    if (userId) {
      const user = await require('../models/User').findById(userId);
      if (user && user.role === 'vendor') {
        productData.vendor = userId;
      }
    }

    const product = new Product(productData);
    await product.save();
    
    console.log('Product created successfully via AI:', product._id, product.name);

    // Create notification
    try {
      const NotificationService = require('../services/notification.service');
      await NotificationService.createProductAddedNotification(product, 'ai');
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError.message);
      // Don't fail product creation if notification fails
    }

    return {
      success: true,
      message: `Product "${product.name}" has been created successfully!`,
      data: { product },
    };
  } catch (error) {
    console.error('Product creation error:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: `Failed to create product: ${error.message || 'Unknown error'}. Please check the product details and try again.`,
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }
};

/**
 * Handle LOW_STOCK intent
 */
const handleLowStock = async (userId) => {
  try {
    const query = { stock: { $lte: 5 }, isActive: true };
    
    // If vendor, only show their products
    if (userId) {
      const user = await require('../models/User').findById(userId);
      if (user && user.role === 'vendor') {
        query.vendor = userId;
      }
    }

    const lowStockProducts = await Product.find(query)
      .select('name sku stock price')
      .sort({ stock: 1 })
      .limit(20);

    return {
      success: true,
      data: lowStockProducts,
    };
  } catch (error) {
    console.error('Low stock query error:', error);
    return {
      success: false,
      data: [],
    };
  }
};

/**
 * Handle TOP_SELLING intent
 */
const handleTopSelling = async (userId) => {
  try {
    const query = {};
    
    // If vendor, only show their products
    if (userId) {
      const user = await require('../models/User').findById(userId);
      if (user && user.role === 'vendor') {
        query.vendor = userId;
      }
    }

    const topProducts = await Product.find(query)
      .select('name sku soldCount price stock')
      .sort({ soldCount: -1 })
      .limit(10);

    return {
      success: true,
      data: topProducts,
    };
  } catch (error) {
    console.error('Top selling query error:', error);
    return {
      success: false,
      data: [],
    };
  }
};

/**
 * Handle STOCK_FORECAST intent
 */
const handleStockForecast = async (userId) => {
  try {
    const query = { stock: { $lte: 10 }, isActive: true };
    
    // If vendor, only show their products
    if (userId) {
      const user = await require('../models/User').findById(userId);
      if (user && user.role === 'vendor') {
        query.vendor = userId;
      }
    }

    const lowStockProducts = await Product.find(query)
      .select('name sku stock price soldCount')
      .sort({ stock: 1 })
      .limit(20);

    // Calculate recommended restock based on soldCount
    const recommendations = lowStockProducts.map((product) => {
      const avgMonthlySales = (product.soldCount || 0) / 12; // Rough estimate
      const recommendedStock = Math.max(20, Math.ceil(avgMonthlySales * 2));
      return {
        name: product.name,
        currentStock: product.stock,
        recommendedStock,
        urgency: product.stock <= 2 ? 'high' : product.stock <= 5 ? 'medium' : 'low',
      };
    });

    return {
      success: true,
      data: recommendations,
    };
  } catch (error) {
    console.error('Stock forecast error:', error);
    return {
      success: false,
      data: [],
    };
  }
};

/**
 * Handle ORDER_NOTIFICATIONS intent
 */
const handleOrderNotifications = async (userId) => {
  try {
    const query = {};
    
    // If vendor, only show orders with their products
    if (userId) {
      const user = await require('../models/User').findById(userId);
      if (user && user.role === 'vendor') {
        const vendorProducts = await Product.find({ vendor: userId }).select('_id');
        const productIds = vendorProducts.map(p => p._id);
        query['items.product'] = { $in: productIds };
      }
    }

    const recentOrders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber total orderStatus paymentStatus createdAt items');

    return {
      success: true,
      data: recentOrders,
    };
  } catch (error) {
    console.error('Order notifications error:', error);
    return {
      success: false,
      data: [],
    };
  }
};

/**
 * Main AI chat endpoint
 * @route   POST /api/ai
 * @access  Private
 */
const chatWithAI = async (req, res, next) => {
  try {
    const { message, stream = false } = req.body;

    if (!message || typeof message !== 'string') {
      throw new ApiError(400, 'Message is required');
    }

    // Check if Claude API key is configured (but don't throw error, use fallback)
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      console.warn('ANTHROPIC_API_KEY not configured, using fallback responses');
      // Continue with fallback responses instead of throwing error
    }

    // Classify intent
    const intent = await classifyIntent(message);

    let intentData = null;
    let actionResult = null;

    // Handle different intents
    switch (intent) {
      case 'PRODUCT_CREATE':
        try {
          const extractedData = await extractProductData(message);
          console.log('Extracted product data:', extractedData);
          actionResult = await handleProductCreate(extractedData, req.user.id);
          console.log('Product creation result:', actionResult);
          if (actionResult && actionResult.success) {
            intentData = actionResult.data;
          } else {
            // If product creation failed, return error message
            return res.json({
              success: false,
              data: {
                message: actionResult?.message || 'Failed to create product. Please check the product details and try again.',
                intent: 'PRODUCT_CREATE',
                error: true,
              },
            });
          }
        } catch (productError) {
          console.error('Product creation error in chatWithAI:', productError);
          return res.json({
            success: false,
            data: {
              message: `Failed to create product: ${productError.message || 'Unknown error'}. Please try again with complete details.`,
              intent: 'PRODUCT_CREATE',
              error: true,
            },
          });
        }
        break;

      case 'LOW_STOCK':
        const lowStockData = await handleLowStock(req.user.id);
        intentData = lowStockData.data;
        break;

      case 'TOP_SELLING':
        const topSellingData = await handleTopSelling(req.user.id);
        intentData = topSellingData.data;
        break;

      case 'STOCK_FORECAST':
        const forecastData = await handleStockForecast(req.user.id);
        intentData = forecastData.data;
        break;

      case 'ORDER_NOTIFICATIONS':
        const orderData = await handleOrderNotifications(req.user.id);
        intentData = orderData.data;
        break;

      case 'DAILY_SUMMARY':
      case 'WEEKLY_SUMMARY':
      case 'MONTHLY_SUMMARY':
        // Redirect to summary endpoint
        const summaryController = require('./ai-summary.controller');
        req.params.period = intent.toLowerCase().replace('_summary', '');
        await summaryController.getBusinessSummary(req, res, next);
        return;

      case 'REVIEW_ANALYSIS':
        const reviewController = require('./review-analysis.controller');
        await reviewController.analyzeReviews(req, res, next);
        return;

      case 'FRAUD_CHECK':
        const fraudController = require('./fraud-detection.controller');
        await fraudController.checkFraud(req, res, next);
        return;

      case 'VENDOR_RANKING':
        const vendorController = require('./vendor-performance.controller');
        await vendorController.getVendorRanking(req, res, next);
        return;

      case 'INVENTORY_CLEANUP':
        const inventoryController = require('./inventory-cleanup.controller');
        await inventoryController.getCleanupSuggestions(req, res, next);
        return;

      case 'CUSTOMER_INSIGHTS':
        const insightsController = require('./customer-insights.controller');
        await insightsController.getCustomerInsights(req, res, next);
        return;

      default:
        intentData = null;
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(intent, intentData, message);

    // Ensure we have a valid response
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('Empty AI response, using default');
      const defaultResponse = intent === 'GENERAL_QUERY' 
        ? 'I\'m here to help! Try asking me about products, orders, stock levels, or business summaries.'
        : 'I processed your request, but couldn\'t generate a response. Please try again.';
      
      return res.json({
        success: true,
        data: {
          message: defaultResponse,
          intent,
          data: intentData,
        },
      });
    }

    // If product was created, include that in response
    if (intent === 'PRODUCT_CREATE' && actionResult) {
      if (actionResult.success) {
        return res.json({
          success: true,
          data: {
            message: aiResponse || actionResult.message || `Product "${actionResult.data?.product?.name || 'Unknown'}" has been created successfully!`,
            intent,
            action: {
              type: 'product_created',
              product: actionResult.data?.product || actionResult.data,
            },
          },
        });
      } else {
        // Product creation failed, return error message
        return res.json({
          success: false,
          data: {
            message: actionResult.message || 'Failed to create product. Please check the details and try again.',
            intent: 'PRODUCT_CREATE',
            error: true,
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        intent,
        data: intentData,
      },
    });
  } catch (error) {
    console.error('Chat with AI endpoint error:', error);
    // Return a helpful error response instead of throwing
    return res.json({
      success: false,
      data: {
        message: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        intent: 'GENERAL_QUERY',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

module.exports = {
  chatWithAI,
};

