const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Collection = require('../models/Collection');
const Promotion = require('../models/Promotion');
const { ApiError } = require('../middleware/errorHandler');

/** Storefront ?offer=true: sale below list price, variant discounts, legacy flag, or active promotion targets. */
const buildSpecialOfferOrMatch = async () => {
  const now = new Date();
  const promos = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .select('applicableProducts applicableCategories')
    .lean();

  const productIdSet = new Set();
  const categoryIdSet = new Set();
  for (const p of promos) {
    for (const id of p.applicableProducts || []) {
      if (id) productIdSet.add(String(id));
    }
    for (const id of p.applicableCategories || []) {
      if (id) categoryIdSet.add(String(id));
    }
  }

  const or = [
    {
      $and: [
        { $or: [{ hasVariants: false }, { hasVariants: { $exists: false } }] },
        { salePrice: { $exists: true, $ne: null } },
        {
          $expr: {
            $and: [
              { $gt: [{ $ifNull: ['$price', 0] }, 0] },
              { $lt: ['$salePrice', '$price'] },
            ],
          },
        },
      ],
    },
    {
      $and: [
        { hasVariants: true },
        {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ['$variants', []] },
                    as: 'v',
                    cond: {
                      $and: [
                        { $ne: ['$$v.salePrice', null] },
                        { $gt: [{ $ifNull: ['$$v.price', 0] }, 0] },
                        {
                          $lt: [{ $ifNull: ['$$v.salePrice', 0] }, '$$v.price'],
                        },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      ],
    },
    { isSpecialOffer: true },
  ];

  if (productIdSet.size > 0) {
    const ids = [];
    for (const id of productIdSet) {
      try {
        ids.push(new mongoose.Types.ObjectId(id));
      } catch {
        /* skip invalid */
      }
    }
    if (ids.length) or.push({ _id: { $in: ids } });
  }

  if (categoryIdSet.size > 0) {
    const catIds = [];
    for (const id of categoryIdSet) {
      try {
        catIds.push(new mongoose.Types.ObjectId(id));
      } catch {
        /* skip invalid */
      }
    }
    if (catIds.length) {
      or.push({
        $or: [{ category: { $in: catIds } }, { categories: { $in: catIds } }],
      });
    }
  }

  return { $or: or };
};

const isObjectIdString = (value) =>
  typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);

const resolveCategoryIds = async (categoryParam) => {
  if (!categoryParam) return [];
  const parts = Array.isArray(categoryParam)
    ? categoryParam
    : String(categoryParam)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  const ids = [];
  for (const p of parts) {
    if (isObjectIdString(p)) {
      ids.push(new mongoose.Types.ObjectId(p));
      continue;
    }
    const cat = await Category.findOne({ slug: p }).select('_id').lean();
    if (cat) ids.push(cat._id);
  }
  return ids;
};

const resolveBrandId = async (brandParam) => {
  if (!brandParam) return null;
  if (isObjectIdString(brandParam)) return brandParam;
  const doc = await Brand.findOne({ slug: brandParam }).select('_id').lean();
  return doc?._id || null;
};

const resolveCollectionId = async (collectionParam) => {
  if (!collectionParam) return null;
  if (isObjectIdString(collectionParam)) return collectionParam;
  const doc = await Collection.findOne({ slug: collectionParam }).select('_id').lean();
  return doc?._id || null;
};

const buildSortFromQuery = (sortParam) => {
  const allowed = new Set(['createdAt', 'price', 'name', 'soldCount']);
  const raw = typeof sortParam === 'string' && sortParam.trim() ? sortParam.trim() : '-createdAt';
  const desc = raw.startsWith('-');
  const field = desc ? raw.slice(1) : raw;
  if (!allowed.has(field)) {
    return { createdAt: -1 };
  }
  return { [field]: desc ? -1 : 1 };
};

/** Escape user input so it is matched literally in MongoDB $regex (avoids invalid / unsafe patterns). */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeDimensions = (dimensions = {}) => {
  if (!dimensions) return undefined;

  const length = toNumber(dimensions.length);
  const width = toNumber(dimensions.width);
  const height = toNumber(dimensions.height);

  if (length === undefined && width === undefined && height === undefined) {
    return undefined;
  }

  return {
    length,
    width,
    height,
  };
};

const buildVariantOptions = (variants = []) => {
  const optionMap = new Map();

  variants.forEach((variant) => {
    if (!variant.optionValues) return;
    Object.entries(variant.optionValues).forEach(([name, value]) => {
      if (!name || !value) return;
      const trimmedName = name.trim();
      const trimmedValue = String(value).trim();
      if (!trimmedName || !trimmedValue) return;

      if (!optionMap.has(trimmedName)) {
        optionMap.set(trimmedName, new Set());
      }
      optionMap.get(trimmedName).add(trimmedValue);
    });
  });

  return Array.from(optionMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
};

const normalizeOptionValues = (optionValues) => {
  if (!optionValues || typeof optionValues !== 'object') {
    return {};
  }

  return Object.entries(optionValues).reduce((acc, [key, value]) => {
    const name = key?.trim();
    const normalizedValue =
      value === undefined || value === null ? '' : typeof value === 'string' ? value.trim() : String(value).trim();

    if (name && normalizedValue) {
      acc[name] = normalizedValue;
    }
    return acc;
  }, {});
};

const sanitizeVariantOptions = (options = []) => {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => {
      const name = option?.name?.trim();
      const values = Array.isArray(option?.values)
        ? option.values.map((value) => value?.trim()).filter(Boolean)
        : [];
      return name && values.length
        ? {
            name,
            values,
          }
        : null;
    })
    .filter(Boolean);
};

const prepareProductPayload = (payload = {}) => {
  const productData = { ...payload };
  productData.hasVariants = productData.hasVariants === true || productData.hasVariants === 'true';

  productData.images = Array.isArray(productData.images)
    ? productData.images.filter(Boolean)
    : productData.images
    ? [productData.images].filter(Boolean)
    : [];

  productData.categories = Array.isArray(productData.categories)
    ? productData.categories.filter(Boolean)
    : productData.categories
    ? [productData.categories]
    : [];

  // Handle colors - ensure it's always an array of unique, trimmed, non-empty strings
  if (Array.isArray(productData.colors)) {
    productData.colors = Array.from(
      new Set(
        productData.colors
          .filter((color) => color && typeof color === 'string' && color.trim())
          .map((color) => color.trim())
      )
    );
  } else if (productData.colors && typeof productData.colors === 'string') {
    // If a single string is sent, convert to array
    productData.colors = [productData.colors.trim()].filter(Boolean);
  } else {
    productData.colors = [];
  }

  productData.tags = Array.isArray(productData.tags)
    ? productData.tags.filter(Boolean)
    : productData.tags
    ? [productData.tags]
    : [];

  if (productData.hasVariants) {
    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      throw new ApiError(400, 'At least one variant is required for variant products');
    }

    productData.variants = productData.variants.map((variant, index) => {
      const price = toNumber(variant.price);

      if (price === undefined) {
        throw new ApiError(400, `Variant #${index + 1} price is required`);
      }

      if (!variant.sku) {
        throw new ApiError(400, `Variant #${index + 1} SKU is required`);
      }

      return {
        title: variant.title?.trim() || `Variant ${index + 1}`,
        color: variant.color?.trim(),
        optionValues: normalizeOptionValues(variant.optionValues),
        price,
        salePrice: toNumber(variant.salePrice),
        cost: toNumber(variant.cost),
        sku: variant.sku?.trim(),
        barcode: variant.barcode?.trim(),
        stock: variant.stock !== undefined ? Number(variant.stock) : 0,
        lowStock: variant.lowStock !== undefined ? Number(variant.lowStock) : 0,
        weight: toNumber(variant.weight),
        dimensions: normalizeDimensions(variant.dimensions),
        image: variant.image,
        images: Array.isArray(variant.images) ? variant.images.filter(Boolean) : [],
        isActive: typeof variant.isActive === 'boolean' ? variant.isActive : true,
      };
    });

    const variantPrices = productData.variants
      .map((variant) => variant.price)
      .filter((value) => typeof value === 'number' && !Number.isNaN(value));

    if (variantPrices.length) {
      productData.price = Math.min(...variantPrices);
    }

    const variantSalePrices = productData.variants
      .map((variant) => variant.salePrice)
      .filter((value) => typeof value === 'number' && !Number.isNaN(value));

    if (variantSalePrices.length) {
      productData.salePrice = Math.min(...variantSalePrices);
    } else {
      productData.salePrice = undefined;
    }

    productData.stock = productData.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
    productData.weight = undefined;
    productData.dimensions = undefined;
    productData.cost = undefined;
    productData.lowStock = undefined;
    productData.variantOptions = sanitizeVariantOptions(productData.variantOptions);

    if (!productData.variantOptions.length) {
      productData.variantOptions = buildVariantOptions(productData.variants);
    }

    // For variant products, if no product-level colors are set, 
    // collect unique colors from variants (but don't overwrite if colors already exist)
    if (!productData.colors || productData.colors.length === 0) {
      const variantColors = Array.from(
        new Set(
          productData.variants
            .map((variant) => variant.color)
            .filter((color) => color && typeof color === 'string' && color.trim())
            .map((color) => color.trim())
        )
      );
      if (variantColors.length > 0) {
        productData.colors = variantColors;
      }
    }
  } else {
    productData.hasVariants = false;
    productData.variants = [];
    productData.variantOptions = [];

    const price = toNumber(productData.price);
    if (price === undefined) {
      throw new ApiError(400, 'Product price is required');
    }
    if (!productData.sku) {
      throw new ApiError(400, 'Product SKU is required');
    }

    productData.price = price;
    productData.salePrice = toNumber(productData.salePrice);
    productData.cost = toNumber(productData.cost);
    productData.stock = productData.stock !== undefined ? Number(productData.stock) : 0;
    productData.lowStock = productData.lowStock !== undefined ? Number(productData.lowStock) : 0;
    productData.weight = toNumber(productData.weight);
    productData.dimensions = normalizeDimensions(productData.dimensions);
  }

  return productData;
};

const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search: searchRaw = '',
      collection: collectionParam = '',
      brand: brandParam = '',
      category: categoryParam = '',
      status = '',
      sort: sortParam,
    } = req.query;

    const searchFirst = Array.isArray(searchRaw) ? searchRaw[0] : searchRaw;
    const search = typeof searchFirst === 'string' ? searchFirst : '';

    const query = {};
    const andParts = [];
    let impossible = false;

    // Vendor dashboard: only their inventory when explicitly scoped (storefront must show full catalog)
    const vendorManageScope =
      req.user &&
      req.user.role === 'vendor' &&
      String(req.query.scope || '').toLowerCase() === 'manage';
    if (vendorManageScope) {
      query.vendor = req.user.id;
    }

    const featuredParam = req.query.featured;
    const offerParam = req.query.offer;
    const specialOfferParam = req.query.specialOffer;
    const wantsFeatured = String(featuredParam).toLowerCase() === 'true';
    const wantsOffer =
      String(offerParam).toLowerCase() === 'true' ||
      String(specialOfferParam).toLowerCase() === 'true';
    const isStorefrontFacet = wantsFeatured || wantsOffer;

    // Storefront (no admin/vendor): only active products
    const isPrivileged = req.user && ['admin', 'vendor'].includes(req.user.role);
    if (!isPrivileged) {
      query.isActive = true;
    } else if (isStorefrontFacet && status !== 'inactive') {
      // Home / widgets use the same API; keep catalog customer-visible even with admin JWT
      query.isActive = true;
    }

    if (wantsFeatured) {
      query.isFeatured = true;
    }
    if (wantsOffer) {
      andParts.push(await buildSpecialOfferOrMatch());
    }

    // Search filter (escaped regex + length cap)
    const searchTrimmed =
      typeof search === 'string' ? search.trim().slice(0, 200) : '';
    if (searchTrimmed) {
      const safe = escapeRegex(searchTrimmed);
      andParts.push({
        $or: [
          { name: { $regex: safe, $options: 'i' } },
          { sku: { $regex: safe, $options: 'i' } },
          { shortDescription: { $regex: safe, $options: 'i' } },
          { description: { $regex: safe, $options: 'i' } },
          { tags: { $regex: safe, $options: 'i' } },
          { 'variants.sku': { $regex: safe, $options: 'i' } },
          { 'variants.title': { $regex: safe, $options: 'i' } },
        ],
      });
    }

    // Category: slug or ObjectId; match legacy `category` or `categories`
    if (categoryParam) {
      const categoryIds = await resolveCategoryIds(categoryParam);
      if (!categoryIds.length) {
        impossible = true;
      } else {
        andParts.push({
          $or: [{ category: { $in: categoryIds } }, { categories: { $in: categoryIds } }],
        });
      }
    }

    // Collection: slug or ObjectId - only check single collection field
    if (!impossible && collectionParam) {
      const collId = await resolveCollectionId(collectionParam);
      if (!collId) {
        impossible = true;
      } else {
        andParts.push({
          collection: collId,
        });
      }
    }

    // Brand: slug or ObjectId
    if (!impossible && brandParam) {
      const brandId = await resolveBrandId(brandParam);
      if (!brandId) {
        impossible = true;
      } else {
        andParts.push({ brand: brandId });
      }
    }

    // Status filter (admin/vendor tooling)
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (impossible) {
      query._id = { $in: [] };
    } else if (andParts.length === 1) {
      Object.assign(query, andParts[0]);
    } else if (andParts.length > 1) {
      query.$and = andParts;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortObj = buildSortFromQuery(sortParam);

    const products = await Product.find(query)
      .populate('collection', 'name slug')
      .populate('brand', 'name slug')
      .populate('categories', 'name slug')
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if it's a MongoDB ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const vendorManageDetail =
      req.user &&
      req.user.role === 'vendor' &&
      String(req.query.scope || '').toLowerCase() === 'manage';
    if (vendorManageDetail) {
      query.vendor = req.user.id;
    }

    const product = await Product.findOne(query)
      .populate('collection', 'name slug')
      .populate('categories', 'name slug')
      .populate('category', 'name slug')
      .populate('brand', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const productData = prepareProductPayload(req.body);

    // If vendor, assign product to vendor
    if (req.user && req.user.role === 'vendor') {
      productData.vendor = req.user.id;
    }

    // Generate slug from name if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('collection', 'name slug')
      .populate('category', 'name slug collection')
      .populate('categories', 'name slug collection')
      .populate('brand', 'name slug');

    // Create notification for product added
    const notificationService = require('../services/notification.service');
    await notificationService.createProductAddedNotification(product, 'admin');

    // Check for low stock notification
    if (product.stock < 5) {
      await notificationService.createLowStockNotification(product);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Product with this SKU or slug already exists'));
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = prepareProductPayload(req.body);

    const query = { _id: req.params.id };

    // If vendor, only allow updating their products
    if (req.user.role === 'vendor') {
      query.vendor = req.user.id;
    }

    const product = await Product.findOneAndUpdate(query, payload, {
      new: true,
      runValidators: true,
    })
      .populate('collection', 'name slug')
      .populate('category', 'name slug collection')
      .populate('categories', 'name slug collection')
      .populate('brand', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check for low stock notification
    const notificationService = require('../services/notification.service');
    if (product.stock < 5) {
      await notificationService.createLowStockNotification(product);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Product with this SKU or slug already exists'));
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // If vendor, only allow deleting their products
    if (req.user.role === 'vendor') {
      query.vendor = req.user.id;
    }

    const product = await Product.findOneAndDelete(query);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
