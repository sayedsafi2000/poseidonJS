const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantAttributeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Variant option name cannot exceed 50 characters'],
    },
    values: [
      {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Variant option value cannot exceed 50 characters'],
      },
    ],
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Variant title cannot exceed 120 characters'],
    },
    color: {
      type: String,
      trim: true,
    },
    optionValues: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Variant price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Variant sale price cannot be negative'],
    },
    cost: {
      type: Number,
      min: [0, 'Variant cost cannot be negative'],
    },
    sku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Variant stock quantity is required'],
      min: [0, 'Variant stock cannot be negative'],
      default: 0,
    },
    lowStock: {
      type: Number,
      min: [0, 'Variant low stock alert cannot be negative'],
      default: 0,
    },
    weight: {
      type: Number,
      min: [0, 'Variant weight cannot be negative'],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    image: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Product Schema
 */
const ProductSchema = new Schema(
  {
    hasVariants: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStock: {
      type: Number,
      min: [0, 'Low stock threshold cannot be negative'],
      default: 0,
    },
    barcode: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    // Main collection (single) - AUTO-POPULATED from category's collection
    collection: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
    },
    // Brand (single)
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    // Primary category - determines the collection
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must have a category'],
    },
    // Additional categories (if product appears in multiple categories)
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    // Vendor (for multi-vendor support)
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    specifications: {
      type: Map,
      of: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isSpecialOffer: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
    seoKeywords: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    variantOptions: [VariantAttributeSchema],
    variants: [VariantSchema],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true, // Suppress "collection" field warning
  }
);

// Index for search optimization
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ collection: 1, isActive: 1 });
ProductSchema.index({ brand: 1, isActive: 1 });
ProductSchema.index({ categories: 1, isActive: 1 });
ProductSchema.index({ vendor: 1 });
ProductSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// Middleware: Auto-populate collection from category before saving
ProductSchema.pre('save', async function (next) {
  if (this.isModified('category') && this.category) {
    try {
      const Category = mongoose.model('Category');
      const cat = await Category.findById(this.category);
      if (cat && cat.collection) {
        this.collection = cat.collection;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Middleware: Auto-populate collection from category after findByIdAndUpdate
ProductSchema.post('findByIdAndUpdate', async function (doc, next) {
  if (doc && doc.category) {
    try {
      const Category = mongoose.model('Category');
      const cat = await Category.findById(doc.category);
      if (cat && cat.collection) {
        doc.collection = cat.collection;
        await doc.save();
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Product', ProductSchema);

