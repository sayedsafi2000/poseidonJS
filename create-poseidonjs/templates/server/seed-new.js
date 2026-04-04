const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Brand = require('./src/models/Brand');
const Collection = require('./src/models/Collection');
require('dotenv').config();

// Helper function to generate SKU
function generateSKU(prefix, index) {
  return `${prefix.substring(0, 3).toUpperCase()}-${String(index).padStart(5, '0')}`;
}

// ============================================================================
// COLLECTIONS - Top Level
// ============================================================================
const collectionsData = [
  {
    name: 'Tech & Gadgets',
    slug: 'tech-gadgets',
    description: 'Latest technology products and smart gadgets',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    isFeatured: true,
    sortOrder: 0,
  },
  {
    name: 'Fashion & Style',
    slug: 'fashion-style',
    description: 'Trending fashion and lifestyle products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: 'Shoes & Footwear',
    slug: 'shoes-footwear',
    description: 'Premium footwear for every occasion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Everything for your comfortable home',
    image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Athletic gear and fitness equipment',
    image: 'https://images.unsplash.com/photo-1517338277536-f5f99be501cd?w=800',
    isFeatured: true,
    sortOrder: 4,
  },
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Beauty products and wellness essentials',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    isFeatured: true,
    sortOrder: 5,
  },
];

// ============================================================================
// CATEGORIES - Organized under Collections
// ============================================================================
const categoriesData = [
  // Tech & Gadgets (4 categories)
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Latest mobile phones and devices',
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800',
    sortOrder: 0,
    collection: 'Tech & Gadgets',
  },
  {
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    description: 'High-performance computers and laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    sortOrder: 1,
    collection: 'Tech & Gadgets',
  },
  {
    name: 'Audio & Headphones',
    slug: 'audio-headphones',
    description: 'Premium sound equipment',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    sortOrder: 2,
    collection: 'Tech & Gadgets',
  },
  {
    name: 'Cameras & Photography',
    slug: 'cameras-photography',
    description: 'Professional and amateur cameras',
    image: 'https://images.unsplash.com/photo-1606980707123-6f9a52635d53?w=800',
    sortOrder: 3,
    collection: 'Tech & Gadgets',
  },

  // Fashion & Style (3 categories)
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Men and women apparel',
    image: 'https://images.unsplash.com/photo-1489195494159-2786d6d40204?w=800',
    sortOrder: 0,
    collection: 'Fashion & Style',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, belts, watches and more',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    sortOrder: 1,
    collection: 'Fashion & Style',
  },
  {
    name: 'Watches & Jewelry',
    slug: 'watches-jewelry',
    description: 'Luxury watches and jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    sortOrder: 2,
    collection: 'Fashion & Style',
  },

  // Shoes & Footwear (3 categories)
  {
    name: 'Mens Footwear',
    slug: 'mens-footwear',
    description: 'Premium shoes for men',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    sortOrder: 0,
    collection: 'Shoes & Footwear',
  },
  {
    name: 'Womens Footwear',
    slug: 'womens-footwear',
    description: 'Stylish shoes for women',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    sortOrder: 1,
    collection: 'Shoes & Footwear',
  },
  {
    name: 'Childrens Footwear',
    slug: 'childrens-footwear',
    description: 'Comfortable and fun shoes for kids',
    image: 'https://images.unsplash.com/photo-1560343090-abc9ca0af1dd?w=800',
    sortOrder: 2,
    collection: 'Shoes & Footwear',
  },

  // Home & Living (3 categories)
  {
    name: 'Kitchen Appliances',
    slug: 'kitchen-appliances',
    description: 'Modern kitchen equipment',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    sortOrder: 0,
    collection: 'Home & Living',
  },
  {
    name: 'Cookware & Utensils',
    slug: 'cookware-utensils',
    description: 'Professional cooking tools',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    sortOrder: 1,
    collection: 'Home & Living',
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Furniture and decorative items',
    image: 'https://images.unsplash.com/photo-1586023566565-fd537edd60f5?w=800',
    sortOrder: 2,
    collection: 'Home & Living',
  },

  // Sports & Fitness (3 categories)
  {
    name: 'Yoga & Pilates',
    slug: 'yoga-pilates',
    description: 'Yoga mats and pilates equipment',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
    sortOrder: 0,
    collection: 'Sports & Fitness',
  },
  {
    name: 'Strength Training',
    slug: 'strength-training',
    description: 'Weights and resistance equipment',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    sortOrder: 1,
    collection: 'Sports & Fitness',
  },
  {
    name: 'Running & Cardio',
    slug: 'running-cardio',
    description: 'Running gear and cardio equipment',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    sortOrder: 2,
    collection: 'Sports & Fitness',
  },

  // Beauty & Wellness (3 categories)
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Face and body skincare products',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    sortOrder: 0,
    collection: 'Beauty & Wellness',
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Shampoo, conditioner, and styling',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
    sortOrder: 1,
    collection: 'Beauty & Wellness',
  },
  {
    name: 'Fitness & Health',
    slug: 'fitness-health',
    description: 'Health trackers and wellness devices',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800',
    sortOrder: 2,
    collection: 'Beauty & Wellness',
  },
];

// ============================================================================
// BRANDS
// ============================================================================
const brandsData = [
  { name: 'Apple', slug: 'apple', description: 'Innovative technology leader', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800', isFeatured: true, sortOrder: 0 },
  { name: 'Samsung', slug: 'samsung', description: 'Electronics and appliances', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', isFeatured: true, sortOrder: 1 },
  { name: 'Sony', slug: 'sony', description: 'Audio and electronics', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', sortOrder: 2 },
  { name: 'Nike', slug: 'nike', description: 'Sports and athletic wear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', isFeatured: true, sortOrder: 3 },
  { name: 'Adidas', slug: 'adidas', description: 'Sports performance gear', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800', isFeatured: true, sortOrder: 4 },
  { name: 'Canon', slug: 'canon', description: 'Cameras and imaging', image: 'https://images.unsplash.com/photo-1606980707123-6f9a52635d53?w=800', sortOrder: 5 },
  { name: 'Dyson', slug: 'dyson', description: 'Premium appliances', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800', sortOrder: 6 },
  { name: 'LG', slug: 'lg', description: 'Electronics and appliances', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', sortOrder: 7 },
  { name: 'Puma', slug: 'puma', description: 'Sports footwear and apparel', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', sortOrder: 8 },
  { name: 'New Balance', slug: 'new-balance', description: 'Athletic footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', sortOrder: 9 },
];

// ============================================================================
// PRODUCTS - 40+ total organized by category
// ============================================================================
const productsData = [
  // ==================== TECH & GADGETS ====================

  // Smartphones (4)
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Latest flagship iPhone with advanced camera and A17 Pro chip',
    shortDescription: '6.7" OLED display, 48MP camera, titanium design',
    price: 1299.99,
    salePrice: 1199.99,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800'],
    category: 'Smartphones',
    brand: 'Apple',
    isFeatured: true,
    tags: ['smartphone', 'iphone', 'flagship', 'camera'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Premium Android flagship with exceptional camera system',
    shortDescription: '6.8" display, 200MP camera, S Pen included',
    price: 1199.99,
    salePrice: 1099.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=800'],
    category: 'Smartphones',
    brand: 'Samsung',
    isFeatured: true,
    tags: ['smartphone', 'android', 'flagship', 'spen'],
  },
  {
    name: 'Sony Xperia 1 VI',
    slug: 'sony-xperia-1-vi',
    description: 'Professional-grade smartphone with cinema capabilities',
    shortDescription: '6.5" OLED, Zeiss optics, 8K video',
    price: 999.99,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800'],
    category: 'Smartphones',
    brand: 'Sony',
    tags: ['smartphone', 'professional', 'camera', '8k'],
  },
  {
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description: 'Advanced AI-powered smartphone from Google',
    shortDescription: '6.7" display, Magic Eraser, Tensor 3 chip',
    price: 999.99,
    salePrice: 899.99,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'],
    category: 'Smartphones',
    brand: 'Samsung',
    tags: ['smartphone', 'pixel', 'ai', 'google'],
  },

  // Laptops (4)
  {
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'Professional laptop with incredible performance',
    shortDescription: '16GB RAM, 512GB SSD, 18h battery',
    price: 2499.99,
    salePrice: 2299.99,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    category: 'Laptops & Computers',
    brand: 'Apple',
    isFeatured: true,
    tags: ['laptop', 'professional', 'macbook', 'performance'],
  },
  {
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    description: 'Premium Windows laptop for creators',
    shortDescription: '15.6" 4K display, RTX 4080, Intel i9',
    price: 2699.99,
    salePrice: 2499.99,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1588872657840-790ff3bde4c5?w=800'],
    category: 'Laptops & Computers',
    brand: 'Samsung',
    isFeatured: true,
    tags: ['laptop', 'windows', 'creator', '4k'],
  },
  {
    name: 'ASUS ROG Gaming Laptop',
    slug: 'asus-rog-gaming-laptop',
    description: 'High-performance gaming laptop',
    shortDescription: '16" 240Hz display, RTX 4090, Core i9',
    price: 2399.99,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800'],
    category: 'Laptops & Computers',
    brand: 'Samsung',
    tags: ['laptop', 'gaming', 'high-performance', '240hz'],
  },
  {
    name: 'ThinkPad X1 Carbon',
    slug: 'thinkpad-x1-carbon',
    description: 'Ultra-lightweight business laptop',
    shortDescription: '14" display, Intel Core i7, 10h battery',
    price: 1499.99,
    stock: 22,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
    category: 'Laptops & Computers',
    brand: 'Samsung',
    tags: ['laptop', 'business', 'lightweight', 'portable'],
  },

  // Audio (4)
  {
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    description: 'Industry-leading noise cancellation headphones',
    shortDescription: '30h battery, LDAC, multipoint connection',
    price: 399.99,
    salePrice: 349.99,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
    category: 'Audio & Headphones',
    brand: 'Sony',
    isFeatured: true,
    tags: ['headphones', 'wireless', 'noise-canceling', 'premium'],
  },
  {
    name: 'Apple AirPods Pro 2',
    slug: 'apple-airpods-pro-2',
    description: 'Premium wireless earbuds with adaptive audio',
    shortDescription: 'USB-C, Active Noise Cancellation, Spatial Audio',
    price: 249.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    category: 'Audio & Headphones',
    brand: 'Apple',
    isFeatured: true,
    tags: ['earbuds', 'wireless', 'apple', 'premium'],
  },
  {
    name: 'Bose QuietComfort Ultra',
    slug: 'bose-quiet-comfort-ultra',
    description: 'Best-in-class comfort and sound quality',
    shortDescription: 'Advanced noise cancellation, 24h battery',
    price: 429.99,
    salePrice: 379.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'],
    category: 'Audio & Headphones',
    brand: 'Sony',
    tags: ['headphones', 'comfort', 'noise-canceling', 'bose'],
  },
  {
    name: 'JBL Tune 770NC',
    slug: 'jbl-tune-770nc',
    description: 'Lightweight noise-canceling headphones',
    shortDescription: '30h battery, touch controls, foldable',
    price: 229.99,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1487235810519-e21cc028cb29?w=800'],
    category: 'Audio & Headphones',
    brand: 'Sony',
    tags: ['headphones', 'wireless', 'lightweight', 'portable'],
  },

  // Cameras (3)
  {
    name: 'Canon EOS R6 Mark II',
    slug: 'canon-eos-r6-mark-ii',
    description: 'Professional full-frame mirrorless camera',
    shortDescription: '24.2MP, 4K60p, advanced AF system',
    price: 2499.99,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1606980707123-6f9a52635d53?w=800'],
    category: 'Cameras & Photography',
    brand: 'Canon',
    isFeatured: true,
    tags: ['camera', 'mirrorless', 'professional', '4k'],
  },
  {
    name: 'Sony A7R V',
    slug: 'sony-a7r-v',
    description: 'High-resolution full-frame mirrorless',
    shortDescription: '61MP resolution, 8K video, fast AF',
    price: 3498.99,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
    category: 'Cameras & Photography',
    brand: 'Sony',
    isFeatured: true,
    tags: ['camera', 'mirrorless', 'high-resolution', '8k'],
  },
  {
    name: 'Canon PowerShot G7X Mark III',
    slug: 'canon-powershot-g7x',
    description: 'Compact premium camera for travel',
    shortDescription: '20.1MP, 4.2x zoom, compact design',
    price: 699.99,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
    category: 'Cameras & Photography',
    brand: 'Canon',
    tags: ['camera', 'compact', 'portable', 'travel'],
  },

  // ==================== FASHION & STYLE ====================

  // Clothing (4)
  {
    name: 'Classic White Cotton T-Shirt',
    slug: 'classic-white-cotton-tshirt',
    description: 'Essential basic white t-shirt for everyday wear',
    shortDescription: '100% cotton, comfortable fit, versatile',
    price: 29.99,
    stock: 200,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    category: 'Clothing',
    brand: 'Apple',
    tags: ['clothing', 'tshirt', 'casual', 'basic'],
  },
  {
    name: 'Premium Denim Jeans',
    slug: 'premium-denim-jeans',
    description: 'High-quality denim jeans with perfect fit',
    shortDescription: 'Comfort stretch, fade-resistant, multiple sizes',
    price: 79.99,
    salePrice: 59.99,
    stock: 150,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    category: 'Clothing',
    brand: 'Nike',
    tags: ['clothing', 'jeans', 'denim', 'casual'],
  },
  {
    name: 'Casual Button-Up Shirt',
    slug: 'casual-button-up-shirt',
    description: 'Versatile shirt for casual or semi-formal wear',
    shortDescription: 'Breathable fabric, multiple colors',
    price: 59.99,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
    category: 'Clothing',
    brand: 'Samsung',
    tags: ['clothing', 'shirt', 'casual', 'versatile'],
  },
  {
    name: 'Cozy Winter Sweater',
    slug: 'cozy-winter-sweater',
    description: 'Warm and comfortable winter sweater',
    shortDescription: 'Wool blend, insulated, stylish design',
    price: 89.99,
    stock: 80,
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6a186?w=800'],
    category: 'Clothing',
    brand: 'Dyson',
    tags: ['clothing', 'sweater', 'winter', 'warm'],
  },

  // Accessories (4)
  {
    name: 'Premium Leather Messenger Bag',
    slug: 'premium-leather-messenger-bag',
    description: 'Handcrafted genuine leather messenger bag',
    shortDescription: 'Laptop compartment, multiple pockets, vintage look',
    price: 189.99,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    category: 'Accessories',
    brand: 'Apple',
    tags: ['bag', 'leather', 'messenger', 'professional'],
  },
  {
    name: 'Canvas Travel Backpack',
    slug: 'canvas-travel-backpack',
    description: 'Durable canvas backpack for travel',
    shortDescription: 'Multiple compartments, waterproof, spacious',
    price: 99.99,
    salePrice: 79.99,
    stock: 60,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    category: 'Accessories',
    brand: 'Samsung',
    tags: ['bag', 'backpack', 'travel', 'durable'],
  },
  {
    name: 'Elegant Leather Belt',
    slug: 'elegant-leather-belt',
    description: 'Classic leather belt with polished buckle',
    shortDescription: 'Adjustable, versatile, professional look',
    price: 49.99,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    category: 'Accessories',
    brand: 'Nike',
    tags: ['accessories', 'belt', 'leather', 'classic'],
  },
  {
    name: 'Silk Scarf Collection',
    slug: 'silk-scarf-collection',
    description: 'Premium silk scarves in various patterns',
    shortDescription: '100% silk, elegant prints, versatile',
    price: 69.99,
    stock: 75,
    images: ['https://images.unsplash.com/photo-1604705209147-f7d9a40c6e3f?w=800'],
    category: 'Accessories',
    brand: 'Adidas',
    tags: ['accessories', 'scarf', 'silk', 'elegant'],
  },

  // Watches & Jewelry (3)
  {
    name: 'Luxury Stainless Steel Watch',
    slug: 'luxury-stainless-steel-watch',
    description: 'Premium stainless steel watch with Swiss movement',
    shortDescription: 'Sapphire crystal, water-resistant, elegant',
    price: 499.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1523170335684-f042fbbb9a18?w=800'],
    category: 'Watches & Jewelry',
    brand: 'Apple',
    tags: ['watch', 'luxury', 'premium', 'elegant'],
  },
  {
    name: 'Diamond Stud Earrings',
    slug: 'diamond-stud-earrings',
    description: 'Exquisite diamond stud earrings',
    shortDescription: 'Certified diamonds, white gold setting',
    price: 799.99,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
    category: 'Watches & Jewelry',
    brand: 'Sony',
    tags: ['jewelry', 'earrings', 'diamonds', 'luxury'],
  },
  {
    name: 'Gold Bracelet',
    slug: 'gold-bracelet',
    description: 'Classic gold bracelet for any occasion',
    shortDescription: '14k gold, adjustable, timeless design',
    price: 349.99,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'],
    category: 'Watches & Jewelry',
    brand: 'Canon',
    tags: ['jewelry', 'bracelet', 'gold', 'classic'],
  },

  // ==================== SHOES & FOOTWEAR ====================

  // Mens Footwear (4)
  {
    name: 'Nike Air Max 270 Mens',
    slug: 'nike-air-max-270-mens',
    description: 'Iconic Nike running shoes for men with maximum comfort',
    shortDescription: 'Air cushioning, breathable mesh, multiple colors',
    price: 159.99,
    salePrice: 129.99,
    stock: 80,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    category: 'Mens Footwear',
    brand: 'Nike',
    isFeatured: true,
    tags: ['shoes', 'running', 'mens', 'comfort'],
  },
  {
    name: 'Adidas Ultraboost 22 Mens',
    slug: 'adidas-ultraboost-22-mens',
    description: 'Premium running shoes with Boost technology for men',
    shortDescription: 'Responsive cushioning, Continental sole',
    price: 189.99,
    salePrice: 149.99,
    stock: 65,
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
    category: 'Mens Footwear',
    brand: 'Adidas',
    isFeatured: true,
    tags: ['shoes', 'running', 'mens', 'performance'],
  },
  {
    name: 'Puma Future Z Football Boots',
    slug: 'puma-future-z-football-boots',
    description: 'Professional football boots for elite players',
    shortDescription: 'Dynamic Yellow, FutureZ technology',
    price: 139.99,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    category: 'Mens Footwear',
    brand: 'Puma',
    tags: ['shoes', 'football', 'sports', 'professional'],
  },
  {
    name: 'Casual Brown Leather Oxford',
    slug: 'casual-brown-leather-oxford',
    description: 'Classic leather oxford shoes for formal occasions',
    shortDescription: 'Premium leather, comfortable, versatile',
    price: 129.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'Mens Footwear',
    brand: 'Nike',
    tags: ['shoes', 'formal', 'leather', 'classic'],
  },

  // Womens Footwear (4)
  {
    name: 'Nike Revolution Running Shoes Womens',
    slug: 'nike-revolution-running-shoes-womens',
    description: 'Stylish running shoes designed for women',
    shortDescription: 'Lightweight, responsive, fashionable',
    price: 79.99,
    salePrice: 59.99,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'Womens Footwear',
    brand: 'Nike',
    isFeatured: true,
    tags: ['shoes', 'running', 'womens', 'stylish'],
  },
  {
    name: 'Adidas Stan Smith Womens',
    slug: 'adidas-stan-smith-womens',
    description: 'Iconic tennis-inspired shoes for women',
    shortDescription: 'Minimalist design, versatile, classic',
    price: 84.99,
    stock: 90,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'Womens Footwear',
    brand: 'Adidas',
    isFeatured: true,
    tags: ['shoes', 'tennis', 'womens', 'classic'],
  },
  {
    name: 'Elegant Black Heels',
    slug: 'elegant-black-heels',
    description: 'Sophisticated black heels for formal occasions',
    shortDescription: '3.5" heel, comfortable, timeless',
    price: 119.99,
    stock: 55,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'Womens Footwear',
    brand: 'Apple',
    tags: ['shoes', 'heels', 'formal', 'elegant'],
  },
  {
    name: 'Comfortable Yoga Flats',
    slug: 'comfortable-yoga-flats',
    description: 'Lightweight flats perfect for yoga and casual wear',
    shortDescription: 'Breathable, flexible sole, comfortable',
    price: 69.99,
    stock: 75,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'Womens Footwear',
    brand: 'Adidas',
    tags: ['shoes', 'flats', 'casual', 'comfortable'],
  },

  // Childrens Footwear (3)
  {
    name: 'Colorful Kids Sneakers',
    slug: 'colorful-kids-sneakers',
    description: 'Fun and colorful sneakers for children',
    shortDescription: 'Durable, comfortable, bright colors',
    price: 49.99,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1560343090-abc9ca0af1dd?w=800'],
    category: 'Childrens Footwear',
    brand: 'Nike',
    isFeatured: true,
    tags: ['shoes', 'kids', 'colorful', 'playful'],
  },
  {
    name: 'School Uniform Shoes',
    slug: 'school-uniform-shoes',
    description: 'Classic black school shoes for children',
    shortDescription: 'Comfortable, durable, easy to clean',
    price: 44.99,
    stock: 110,
    images: ['https://images.unsplash.com/photo-1560343090-abc9ca0af1dd?w=800'],
    category: 'Childrens Footwear',
    brand: 'Adidas',
    tags: ['shoes', 'kids', 'school', 'practical'],
  },
  {
    name: 'Light-Up LED Kids Shoes',
    slug: 'light-up-led-kids-shoes',
    description: 'Fun LED light-up shoes for kids',
    shortDescription: 'Built-in LED lights, exciting colors',
    price: 69.99,
    stock: 85,
    images: ['https://images.unsplash.com/photo-1560343090-abc9ca0af1dd?w=800'],
    category: 'Childrens Footwear',
    brand: 'Puma',
    tags: ['shoes', 'kids', 'fun', 'light-up'],
  },

  // ==================== HOME & LIVING ====================

  // Kitchen Appliances (3)
  {
    name: 'Breville Barista Express Coffee Machine',
    slug: 'breville-barista-express',
    description: 'Professional espresso machine with built-in grinder',
    shortDescription: '15-bar pump, PID temperature control',
    price: 699.99,
    salePrice: 599.99,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800'],
    category: 'Kitchen Appliances',
    brand: 'Sony',
    isFeatured: true,
    tags: ['coffee', 'espresso', 'kitchen', 'appliance'],
  },
  {
    name: 'KitchenAid Artisan Stand Mixer',
    slug: 'kitchenaid-artisan-stand-mixer',
    description: '5-quart stand mixer for professional baking',
    shortDescription: '10 speeds, tilt-head design, 3 attachments',
    price: 449.99,
    salePrice: 379.99,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800'],
    category: 'Kitchen Appliances',
    brand: 'LG',
    isFeatured: true,
    tags: ['mixer', 'kitchen', 'baking', 'appliance'],
  },
  {
    name: 'Instant Pot Pressure Cooker',
    slug: 'instant-pot-pressure-cooker',
    description: 'Multi-function pressure cooker for quick meals',
    shortDescription: '7-in-1 functionality, programmable',
    price: 79.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1584990347498-7a0b8f313b2e?w=800'],
    category: 'Kitchen Appliances',
    brand: 'Dyson',
    tags: ['cooker', 'kitchen', 'quick', 'convenient'],
  },

  // Cookware (3)
  {
    name: 'Le Creuset Dutch Oven 5.5 Qt',
    slug: 'le-creuset-dutch-oven',
    description: 'Premium enameled cast iron for slow cooking',
    shortDescription: 'Lifetime warranty, heat distribution',
    price: 379.99,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800'],
    category: 'Cookware & Utensils',
    brand: 'Dyson',
    isFeatured: true,
    tags: ['cookware', 'dutch-oven', 'cast-iron', 'premium'],
  },
  {
    name: 'T-fal Cookware Set 12-Piece',
    slug: 'tfal-cookware-set',
    description: '12-piece hard anodized cookware set',
    shortDescription: 'Thermo-Spot indicator, scratch-resistant',
    price: 199.99,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1584990347498-7a0b8f313b2e?w=800'],
    category: 'Cookware & Utensils',
    brand: 'Samsung',
    tags: ['cookware', 'set', 'non-stick', 'kitchen'],
  },
  {
    name: 'Stainless Steel Knife Set',
    slug: 'stainless-steel-knife-set',
    description: 'Professional knife set for kitchen',
    shortDescription: '6-piece set, ergonomic handles',
    price: 89.99,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800'],
    category: 'Cookware & Utensils',
    brand: 'Canon',
    tags: ['knives', 'kitchen', 'professional', 'cooking'],
  },

  // Home Decor (2)
  {
    name: 'Modern Minimalist Wall Clock',
    slug: 'modern-minimalist-wall-clock',
    description: 'Contemporary wall clock with clean design',
    shortDescription: '12" diameter, silent sweep movement',
    price: 79.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1563308503-b86a84627e9f?w=800'],
    category: 'Home Decor',
    brand: 'Apple',
    tags: ['decor', 'clock', 'modern', 'minimalist'],
  },
  {
    name: 'Decorative Floor Lamp',
    slug: 'decorative-floor-lamp',
    description: 'Stylish floor lamp with adjustable brightness',
    shortDescription: 'LED, dimmable, elegant design',
    price: 149.99,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1565636192335-14c3bead5a65?w=800'],
    category: 'Home Decor',
    brand: 'Dyson',
    tags: ['lamp', 'decor', 'lighting', 'stylish'],
  },

  // ==================== SPORTS & FITNESS ====================

  // Yoga & Pilates (2)
  {
    name: 'Manduka PRO Yoga Mat',
    slug: 'manduka-pro-yoga-mat',
    description: 'Professional yoga mat with lifetime warranty',
    shortDescription: 'Dense cushioning, closed-cell surface',
    price: 129.99,
    salePrice: 99.99,
    stock: 60,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
    category: 'Yoga & Pilates',
    brand: 'Nike',
    isFeatured: true,
    tags: ['yoga', 'mat', 'fitness', 'meditation'],
  },
  {
    name: 'Lululemon Mat 5mm',
    slug: 'lululemon-yoga-mat',
    description: 'Premium yoga mat with exceptional grip',
    shortDescription: 'Reversible design, eco-friendly materials',
    price: 88.00,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800'],
    category: 'Yoga & Pilates',
    brand: 'Adidas',
    tags: ['yoga', 'mat', 'premium', 'eco-friendly'],
  },

  // Strength Training (2)
  {
    name: 'Bowflex SelectTech 552 Dumbbells',
    slug: 'bowflex-selecttech-552',
    description: 'Adjustable dumbbells replacing 15 weight sets',
    shortDescription: 'Space-saving, 5-52.5 lbs per hand',
    price: 399.99,
    salePrice: 349.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
    category: 'Strength Training',
    brand: 'Nike',
    isFeatured: true,
    tags: ['dumbbells', 'weights', 'adjustable', 'home-gym'],
  },
  {
    name: 'TRX PRO4 Suspension System',
    slug: 'trx-pro4-suspension',
    description: 'Professional suspension training system',
    shortDescription: 'Supports 350+ lbs, full workout guide',
    price: 199.99,
    stock: 40,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800'],
    category: 'Strength Training',
    brand: 'Adidas',
    tags: ['suspension', 'training', 'fitness', 'portable'],
  },

  // Running & Cardio (2)
  {
    name: 'Garmin Forerunner 265 GPS Watch',
    slug: 'garmin-forerunner-265',
    description: 'Advanced GPS running watch with AMOLED display',
    shortDescription: 'Training readiness, race predictor, sleep tracking',
    price: 449.99,
    salePrice: 399.99,
    stock: 35,
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800'],
    category: 'Running & Cardio',
    brand: 'Canon',
    isFeatured: true,
    tags: ['watch', 'fitness', 'gps', 'running'],
  },
  {
    name: 'Treadmill Digital Display',
    slug: 'treadmill-digital-display',
    description: 'Home treadmill with digital tracking',
    shortDescription: 'Foldable, motorized, preset programs',
    price: 599.99,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
    category: 'Running & Cardio',
    brand: 'Sony',
    tags: ['treadmill', 'cardio', 'fitness', 'home-gym'],
  },

  // ==================== BEAUTY & WELLNESS ====================

  // Skincare (2)
  {
    name: "L'Oreal Revitalift Triple Power Serum",
    slug: 'loreal-revitalift-serum',
    description: 'Anti-aging serum with Pro-Retinol & Vitamin C',
    shortDescription: 'Reduces wrinkles, evens skin tone',
    price: 54.99,
    salePrice: 44.99,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
    category: 'Skincare',
    brand: 'LG',
    isFeatured: true,
    tags: ['skincare', 'serum', 'anti-aging', 'beauty'],
  },
  {
    name: 'Neutrogena Hydro Boost Toner',
    slug: 'neutrogena-hydro-boost-toner',
    description: 'Lightweight hydrating toner with hyaluronic acid',
    shortDescription: 'Oil-free, non-comedogenic formula',
    price: 8.99,
    stock: 200,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'],
    category: 'Skincare',
    brand: 'Samsung',
    tags: ['skincare', 'toner', 'hydrating', 'sensitive'],
  },

  // Hair Care (2)
  {
    name: 'Dyson Supersonic Hair Dryer',
    slug: 'dyson-supersonic-hair-dryer',
    description: 'Intelligent heat control hair dryer',
    shortDescription: '40x/sec temperature measurement, quieter',
    price: 429.99,
    salePrice: 379.99,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800'],
    category: 'Hair Care',
    brand: 'Dyson',
    isFeatured: true,
    tags: ['hair-dryer', 'professional', 'ionic', 'beauty'],
  },
  {
    name: 'Premium Argan Oil Shampoo',
    slug: 'premium-argan-oil-shampoo',
    description: 'Luxurious shampoo with pure argan oil',
    shortDescription: '250ml, sulfate-free, nourishing',
    price: 16.99,
    stock: 150,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
    category: 'Hair Care',
    brand: 'Canon',
    tags: ['shampoo', 'hair-care', 'argan', 'premium'],
  },

  // Fitness & Health (2)
  {
    name: 'Fitbit Charge 6 Fitness Tracker',
    slug: 'fitbit-charge-6-tracker',
    description: 'Advanced fitness tracker with health monitoring',
    shortDescription: 'Heart rate, sleep tracking, water resistant',
    price: 179.99,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800'],
    category: 'Fitness & Health',
    brand: 'Apple',
    tags: ['tracker', 'fitness', 'health', 'smart-watch'],
  },
  {
    name: 'Withings Body+ Smart Scale',
    slug: 'withings-body-plus-scale',
    description: 'Smart scale with body composition analysis',
    shortDescription: 'WiFi connected, app sync, accurate',
    price: 99.99,
    stock: 60,
    images: ['https://images.unsplash.com/photo-1526136606519-c8dde4af96d2?w=800'],
    category: 'Fitness & Health',
    brand: 'Sony',
    tags: ['scale', 'fitness', 'health', 'smart'],
  },
];

// ============================================================================
// SEEDING FUNCTION
// ============================================================================
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Collection.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create Brands
    console.log('🏢 Creating brands...');
    const brandMap = {};
    for (const brandData of brandsData) {
      const brand = await Brand.create(brandData);
      brandMap[brand.name] = brand._id;
      console.log(`   ✅ ${brand.name}`);
    }
    console.log();

    // Create Collections
    console.log('📦 Creating collections...');
    const collectionMap = {};
    for (const collectionData of collectionsData) {
      const collection = await Collection.create(collectionData);
      collectionMap[collection.name] = collection._id;
      console.log(`   ✅ ${collection.name}`);
    }
    console.log();

    // Create Categories
    console.log('🏷️  Creating categories...');
    const categoryMap = {};
    for (const categoryData of categoriesData) {
      const collectionId = collectionMap[categoryData.collection];
      const category = await Category.create({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        image: categoryData.image,
        sortOrder: categoryData.sortOrder,
        collection: collectionId,
        isActive: true,
      });
      categoryMap[category.name] = category._id;
      console.log(`   ✅ ${categoryData.collection} → ${category.name}`);
    }
    console.log();

    // Create Products
    console.log('🛍️  Creating products...');
    let productIndex = 1;
    for (const productData of productsData) {
      const categoryId = categoryMap[productData.category];
      const brandId = brandMap[productData.brand];

      const product = await Product.create({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: productData.price,
        salePrice: productData.salePrice || undefined,
        stock: productData.stock,
        images: productData.images,
        category: categoryId,
        categories: [categoryId],
        brand: brandId,
        tags: productData.tags,
        isFeatured: productData.isFeatured || false,
        isActive: true,
        sku: generateSKU(productData.category, productIndex),
      });
      console.log(`   ✅ ${productData.name} ($${productData.price}) - ${productData.category}`);
      productIndex++;
    }
    console.log();

    // Summary
    console.log('🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Total Brands: ${Object.keys(brandMap).length}`);
    console.log(`   Total Collections: ${Object.keys(collectionMap).length}`);
    console.log(`   Total Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   Total Products: ${productsData.length}`);
    console.log();
    console.log('📈 Product Distribution:');
    
    // Count products per collection
    const collectionStats = {};
    for (const categoryData of categoriesData) {
      if (!collectionStats[categoryData.collection]) {
        collectionStats[categoryData.collection] = 0;
      }
    }
    
    for (const productData of productsData) {
      const categoryData = categoriesData.find(c => c.name === productData.category);
      if (categoryData) {
        collectionStats[categoryData.collection]++;
      }
    }
    
    for (const [collection, count] of Object.entries(collectionStats)) {
      console.log(`   ${collection}: ${count} products`);
    }
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
