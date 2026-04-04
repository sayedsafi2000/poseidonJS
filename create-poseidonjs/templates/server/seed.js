const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Brand = require('./src/models/Brand');
const Collection = require('./src/models/Collection');
require('dotenv').config();

// Helper function to generate SKU
function generateSKU(categorySlug, index) {
  const prefix = categorySlug.substring(0, 4).toUpperCase();
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

// Brands data
const brandsData = [
  { name: 'Apple', slug: 'apple', description: 'Innovative technology products', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800' },
  { name: 'Samsung', slug: 'samsung', description: 'Electronics and appliances leader', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800' },
  { name: 'Sony', slug: 'sony', description: 'Audio and electronics excellence', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800' },
  { name: 'Nike', slug: 'nike', description: 'Sports and athletic wear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
  { name: 'Adidas', slug: 'adidas', description: 'Sports performance gear', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800' },
  { name: 'Loreal', slug: 'loreal', description: 'Beauty and cosmetics', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800' },
  { name: 'Canon', slug: 'canon', description: 'Cameras and imaging', image: 'https://images.unsplash.com/photo-1606980707123-6f9a52635d53?w=800' },
  { name: 'Moleskine', slug: 'moleskine', description: 'Premium notebooks and stationery', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800' },
];

// Collections data (featured set shown on home hero rail; 7 curated collections)
const collectionsData = [
  { name: 'Summer Sale 2024', slug: 'summer-sale-2024', description: 'Hot deals for the summer season', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', isFeatured: true, sortOrder: 0 },
  { name: 'Tech Essentials', slug: 'tech-essentials', description: 'Must-have technology products', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', isFeatured: true, sortOrder: 1 },
  { name: 'Home Office Setup', slug: 'home-office-setup', description: 'Everything for your perfect home office', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', isFeatured: true, sortOrder: 2 },
  { name: 'Fitness & Wellness', slug: 'fitness-wellness', description: 'Products for a healthy lifestyle', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', isFeatured: true, sortOrder: 3 },
  { name: 'Best Sellers', slug: 'best-sellers', description: 'Our most popular products', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800', isFeatured: true, sortOrder: 4 },
  { name: 'New Arrivals', slug: 'new-arrivals', description: 'Fresh drops and latest products', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', isFeatured: true, sortOrder: 5 },
  { name: 'Gaming Zone', slug: 'gaming-zone', description: 'Gear and accessories for gamers', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', isFeatured: true, sortOrder: 6 },
];

// Enhanced product data with proper structure
const productData = {
  electronics: {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic gadgets and cutting-edge devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    products: [
      {
        name: 'Apple MacBook Pro 16" M3 Pro',
        slug: 'apple-macbook-pro-16-m3',
        description: 'Supercharged for pros. The most powerful MacBook Pro ever is here with the blazing-fast M3 Pro chip, up to 18 hours of battery life, and a stunning Liquid Retina XDR display. Perfect for video editing, 3D rendering, and software development.',
        shortDescription: 'Powerful laptop with M3 Pro chip, 16GB RAM, 512GB SSD',
        price: 2499.99,
        salePrice: 2299.99,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
        ],
        tags: ['laptop', 'apple', 'macbook', 'professional', 'm3-chip', 'programming', 'video-editing'],
        brand: 'Apple',
        collections: ['Tech Essentials', 'Best Sellers', 'Home Office Setup', 'New Arrivals'],
        isFeatured: true,
        seoTitle: 'Apple MacBook Pro 16" M3 Pro - Professional Laptop',
        seoDescription: 'Buy Apple MacBook Pro 16" with M3 Pro chip. Perfect for professionals. Fast shipping & warranty included.',
        seoKeywords: ['macbook pro', 'apple laptop', 'm3 chip', 'professional laptop', 'video editing laptop'],
      },
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        slug: 'sony-wh-1000xm5-headphones',
        description: 'Industry-leading noise canceling with two processors controlling 8 microphones for unprecedented noise cancellation. Up to 30-hour battery life with quick charging. Crystal clear hands-free calling with 4 beamforming microphones.',
        shortDescription: 'Premium noise-canceling wireless headphones with 30h battery',
        price: 399.99,
        salePrice: 349.99,
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        ],
        tags: ['headphones', 'sony', 'wireless', 'noise-canceling', 'bluetooth', 'premium-audio', 'travel'],
        brand: 'Sony',
        collections: ['Tech Essentials', 'Best Sellers', 'Summer Sale 2024', 'Gaming Zone'],
        isFeatured: true,
        seoTitle: 'Sony WH-1000XM5 Noise Canceling Headphones - Best Sound Quality',
        seoDescription: 'Experience premium audio with Sony WH-1000XM5 wireless headphones. Industry-leading noise cancellation & 30h battery.',
        seoKeywords: ['sony headphones', 'noise canceling', 'wireless headphones', 'premium audio', 'bluetooth headphones'],
      },
      {
        name: 'Samsung 55" 4K QLED Smart TV',
        slug: 'samsung-55-4k-qled-smart-tv',
        description: 'Quantum Dot technology delivers over a billion shades of brilliant color. 4K AI Upscaling transforms everything you watch. Smart TV powered by Tizen with built-in voice assistants. Motion Xcelerator Turbo+ for smooth action scenes.',
        shortDescription: 'Crystal clear 4K QLED display with Quantum Dot technology',
        price: 899.99,
        salePrice: 749.99,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800',
          'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800',
        ],
        tags: ['tv', 'samsung', '4k', 'smart-tv', 'qled', 'home-entertainment', 'streaming'],
        brand: 'Samsung',
        collections: ['Tech Essentials', 'Summer Sale 2024'],
        seoTitle: 'Samsung 55" 4K QLED Smart TV - Premium Home Entertainment',
        seoDescription: 'Buy Samsung QLED TV with Quantum Dot technology. Stunning 4K display, smart features & AI upscaling.',
        seoKeywords: ['samsung tv', '4k tv', 'qled tv', 'smart tv', 'home entertainment'],
      },
      {
        name: 'Canon EOS R6 Mark II Mirrorless Camera',
        slug: 'canon-eos-r6-mark-ii-camera',
        description: 'Professional full-frame mirrorless camera with 24.2MP sensor, advanced Dual Pixel CMOS AF II, and 4K 60p video recording. In-body 5-axis image stabilization. Perfect for photography professionals and serious enthusiasts.',
        shortDescription: 'Professional 24MP full-frame camera with 4K 60p video',
        price: 2499.99,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
          'https://images.unsplash.com/photo-1606980707123-6f9a52635d53?w=800',
        ],
        tags: ['camera', 'canon', 'mirrorless', 'photography', 'professional', 'full-frame', '4k-video'],
        brand: 'Canon',
        collections: ['Tech Essentials', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Canon EOS R6 Mark II - Professional Mirrorless Camera',
        seoDescription: 'Canon EOS R6 Mark II with 24MP sensor, 4K video & advanced autofocus. Perfect for professional photography.',
        seoKeywords: ['canon camera', 'mirrorless camera', 'professional camera', 'eos r6', 'full frame camera'],
      },
    ],
  },
  fashion: {
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    description: 'Trendy fashion and premium quality clothing',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    products: [
      {
        name: 'Nike Air Max 270 Running Shoes',
        slug: 'nike-air-max-270-running-shoes',
        description: 'Featuring Nike\'s biggest Air unit yet for all-day comfort. Breathable mesh upper for ventilation. Durable rubber outsole with waffle pattern for traction. Perfect for running, gym, or casual wear. Available in multiple colors.',
        shortDescription: 'Comfortable athletic sneakers with superior Air cushioning',
        price: 159.99,
        salePrice: 129.99,
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
          'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
        ],
        tags: ['shoes', 'sneakers', 'nike', 'running', 'sports', 'athletic', 'comfortable', 'air-max'],
        brand: 'Nike',
        collections: ['Best Sellers', 'Summer Sale 2024', 'Fitness & Wellness'],
        isFeatured: true,
        seoTitle: 'Nike Air Max 270 - Premium Running Shoes for Men & Women',
        seoDescription: 'Shop Nike Air Max 270 running shoes with maximum cushioning. Perfect for athletes. Free shipping on orders $50+',
        seoKeywords: ['nike shoes', 'air max 270', 'running shoes', 'athletic shoes', 'sports shoes'],
      },
      {
        name: 'Adidas Ultraboost 22 Running Shoes',
        slug: 'adidas-ultraboost-22-running',
        description: 'Premium running shoes with responsive Boost cushioning and flexible Primeknit upper. Continental rubber outsole for superior grip in all conditions. Engineered for long-distance comfort and energy return.',
        shortDescription: 'High-performance running shoes with Boost technology',
        price: 189.99,
        salePrice: 149.99,
        stock: 75,
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
          'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
        ],
        tags: ['shoes', 'running', 'adidas', 'ultraboost', 'sports', 'marathon', 'fitness'],
        brand: 'Adidas',
        collections: ['Fitness & Wellness', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Adidas Ultraboost 22 - Professional Running Shoes',
        seoDescription: 'Premium Adidas Ultraboost 22 with Boost cushioning. Perfect for marathons and daily runs.',
        seoKeywords: ['adidas ultraboost', 'running shoes', 'boost technology', 'marathon shoes'],
      },
      {
        name: 'Classic Levi\'s Denim Jacket',
        slug: 'levis-classic-denim-jacket',
        description: 'Timeless denim trucker jacket crafted from premium denim. Button front closure with chest pockets. Perfect layering piece for any season. Fits true to size with a classic, relaxed fit.',
        shortDescription: 'Iconic denim jacket for timeless style',
        price: 98.99,
        salePrice: 79.99,
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
        ],
        tags: ['jacket', 'denim', 'casual', 'fashion', 'unisex', 'vintage', 'classic'],
        brand: 'Levis',
        collections: ['Summer Sale 2024'],
        seoTitle: 'Levi\'s Classic Denim Jacket - Timeless Fashion',
        seoDescription: 'Authentic Levi\'s denim jacket. Classic style, premium quality. Available in multiple sizes.',
        seoKeywords: ['levis jacket', 'denim jacket', 'classic jacket', 'casual wear'],
      },
      {
        name: 'Premium Leather Messenger Bag',
        slug: 'premium-leather-messenger-bag',
        description: 'Handcrafted genuine leather messenger bag with laptop compartment (fits up to 15"). Multiple interior pockets for organization. Adjustable shoulder strap. Ages beautifully with use.',
        shortDescription: 'Genuine leather bag with laptop compartment',
        price: 189.99,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        ],
        tags: ['bag', 'leather', 'messenger', 'laptop-bag', 'professional', 'accessory', 'work'],
        collections: ['Home Office Setup', 'Best Sellers'],
        seoTitle: 'Premium Leather Messenger Bag - Professional & Stylish',
        seoDescription: 'Handcrafted leather messenger bag with laptop compartment. Perfect for work and travel.',
        seoKeywords: ['leather bag', 'messenger bag', 'laptop bag', 'professional bag'],
      },
    ],
  },
  home: {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Premium home essentials and kitchen appliances',
    image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
    products: [
      {
        name: 'Breville Barista Express Coffee Machine',
        slug: 'breville-barista-express-coffee-machine',
        description: 'Professional espresso machine with built-in grinder. 15-bar Italian pump for optimal espresso extraction. Precise espresso extraction with digital temperature control (PID). Steam wand for microfoam milk texturing.',
        shortDescription: 'Professional espresso machine with built-in grinder',
        price: 699.99,
        salePrice: 599.99,
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        ],
        tags: ['coffee', 'espresso', 'kitchen', 'appliance', 'barista', 'home-cafe', 'premium'],
        collections: ['Home Office Setup', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Breville Barista Express - Professional Home Espresso Machine',
        seoDescription: 'Make café-quality espresso at home with Breville Barista Express. Built-in grinder & steam wand.',
        seoKeywords: ['espresso machine', 'coffee maker', 'breville', 'home barista', 'coffee grinder'],
      },
      {
        name: 'Le Creuset Cast Iron Dutch Oven 5.5 Qt',
        slug: 'le-creuset-dutch-oven-5qt',
        description: 'Premium enameled cast iron Dutch oven. Superior heat distribution and retention. Perfect for slow cooking, braising, and baking bread. Oven safe up to 500°F. Lifetime warranty. Available in signature colors.',
        shortDescription: 'Premium cast iron Dutch oven for versatile cooking',
        price: 379.99,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
          'https://images.unsplash.com/photo-1584990347498-7a0b8f313b2e?w=800',
        ],
        tags: ['cookware', 'dutch-oven', 'cast-iron', 'kitchen', 'cooking', 'le-creuset', 'premium'],
        collections: ['Best Sellers'],
        isFeatured: true,
        seoTitle: 'Le Creuset Cast Iron Dutch Oven - Premium Cookware',
        seoDescription: 'Le Creuset 5.5 Qt Dutch Oven. Perfect for slow cooking & baking. Lifetime warranty.',
        seoKeywords: ['dutch oven', 'cast iron', 'le creuset', 'cookware', 'kitchen essentials'],
      },
      {
        name: 'KitchenAid Artisan Stand Mixer',
        slug: 'kitchenaid-artisan-stand-mixer',
        description: '5-quart stainless steel bowl with comfortable handle. 10 speeds for precision mixing. Tilt-head design for easy access. Includes flat beater, dough hook, and wire whip. Powerful enough for bread dough.',
        shortDescription: 'Professional 5-qt stand mixer for baking enthusiasts',
        price: 449.99,
        salePrice: 379.99,
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800',
          'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
        ],
        tags: ['mixer', 'kitchen', 'baking', 'appliance', 'kitchenaid', 'stand-mixer', 'cooking'],
        collections: ['Home Office Setup'],
        seoTitle: 'KitchenAid Artisan Stand Mixer - Professional Baking',
        seoDescription: 'KitchenAid 5-qt stand mixer with 10 speeds. Perfect for baking bread, cakes & more.',
        seoKeywords: ['kitchenaid mixer', 'stand mixer', 'baking mixer', 'kitchen appliance'],
      },
      {
        name: 'Dyson V15 Detect Cordless Vacuum',
        slug: 'dyson-v15-detect-vacuum',
        description: 'Laser reveals invisible dust. Intelligent sensor counts and measures particles. Powerful suction with up to 60 minutes runtime. Converts to handheld. HEPA filtration captures 99.99% of particles.',
        shortDescription: 'Advanced cordless vacuum with laser dust detection',
        price: 749.99,
        salePrice: 649.99,
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
          'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800',
        ],
        tags: ['vacuum', 'dyson', 'cordless', 'cleaning', 'home', 'appliance', 'hepa'],
        collections: ['Tech Essentials', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Dyson V15 Detect - Advanced Cordless Vacuum Cleaner',
        seoDescription: 'Dyson V15 with laser dust detection & powerful suction. HEPA filtration for clean air.',
        seoKeywords: ['dyson vacuum', 'cordless vacuum', 'hepa vacuum', 'laser vacuum'],
      },
    ],
  },
  sports: {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Professional sports equipment and fitness gear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    products: [
      {
        name: 'Manduka PRO Yoga Mat',
        slug: 'manduka-pro-yoga-mat',
        description: 'Professional-grade yoga mat with superior cushioning. Dense cushioning protects joints without compromising stability. Closed-cell surface prevents sweat from seeping into mat. Lifetime guarantee. Eco-friendly materials.',
        shortDescription: 'Professional yoga mat with lifetime guarantee',
        price: 129.99,
        salePrice: 99.99,
        stock: 80,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800',
        ],
        tags: ['yoga', 'fitness', 'exercise', 'mat', 'workout', 'pilates', 'meditation', 'eco-friendly'],
        collections: ['Fitness & Wellness', 'Best Sellers', 'Summer Sale 2024'],
        isFeatured: true,
        seoTitle: 'Manduka PRO Yoga Mat - Professional Grade with Lifetime Warranty',
        seoDescription: 'Premium Manduka PRO yoga mat with superior cushioning. Perfect for yoga & pilates. Lifetime guarantee.',
        seoKeywords: ['yoga mat', 'manduka', 'professional yoga mat', 'exercise mat', 'pilates mat'],
      },
      {
        name: 'Bowflex SelectTech 552 Adjustable Dumbbells',
        slug: 'bowflex-selecttech-552-dumbbells',
        description: 'Replaces 15 sets of weights with adjustable dial system from 5 to 52.5 lbs per hand. Space-saving design perfect for home gyms. Durable molding for quieter workouts. Includes free Bowflex SelectTech app.',
        shortDescription: 'Adjustable dumbbells replacing 15 weight sets',
        price: 399.99,
        salePrice: 349.99,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
          'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
        ],
        tags: ['dumbbells', 'weights', 'strength-training', 'fitness', 'home-gym', 'adjustable', 'bowflex'],
        collections: ['Fitness & Wellness', 'Home Office Setup'],
        isFeatured: true,
        seoTitle: 'Bowflex SelectTech 552 - Adjustable Dumbbells Set',
        seoDescription: 'Space-saving adjustable dumbbells from 5-52.5 lbs. Perfect for home gym workouts.',
        seoKeywords: ['adjustable dumbbells', 'bowflex', 'home gym', 'weight training', 'fitness equipment'],
      },
      {
        name: 'TRX PRO4 Suspension Training System',
        slug: 'trx-pro4-suspension-training',
        description: 'Professional-grade suspension trainer used by elite athletes. Highly durable straps support 350+ lbs. Includes anchor, mesh carry bag, and workout guide. Train anywhere with bodyweight exercises.',
        shortDescription: 'Professional suspension training system',
        price: 199.99,
        stock: 60,
        images: [
          'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800',
          'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800',
        ],
        tags: ['trx', 'suspension-training', 'fitness', 'workout', 'bodyweight', 'portable', 'strength'],
        collections: ['Fitness & Wellness'],
        seoTitle: 'TRX PRO4 Suspension Trainer - Professional Workout System',
        seoDescription: 'TRX PRO4 suspension training system. Train anywhere with bodyweight exercises. Professional grade.',
        seoKeywords: ['trx', 'suspension trainer', 'bodyweight training', 'fitness equipment'],
      },
      {
        name: 'Garmin Forerunner 265 GPS Watch',
        slug: 'garmin-forerunner-265-gps-watch',
        description: 'Advanced GPS running watch with AMOLED touchscreen. Training Readiness score. Race Predictor for goal times. Full-color maps. Up to 13 days battery in smartwatch mode. Sleep tracking with sleep score.',
        shortDescription: 'Advanced GPS fitness watch with AMOLED display',
        price: 449.99,
        salePrice: 399.99,
        stock: 55,
        images: [
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800',
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
        ],
        tags: ['watch', 'fitness-tracker', 'gps', 'running', 'smart-watch', 'garmin', 'health', 'training'],
        collections: ['Tech Essentials', 'Fitness & Wellness', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Garmin Forerunner 265 - Advanced GPS Running Watch',
        seoDescription: 'Garmin Forerunner 265 with AMOLED display & advanced training features. Perfect for runners.',
        seoKeywords: ['garmin watch', 'running watch', 'gps watch', 'fitness tracker', 'forerunner'],
      },
    ],
  },
  beauty: {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Premium beauty products and personal care essentials',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    products: [
      {
        name: 'L\'Oreal Revitalift Triple Power Serum',
        slug: 'loreal-revitalift-serum',
        description: 'Advanced anti-aging serum with Pro-Retinol, Vitamin C, and Hyaluronic Acid. Visibly reduces wrinkles, evens skin tone, and refines texture. Lightweight, fast-absorbing formula. Dermatologist tested. Suitable for all skin types.',
        shortDescription: 'Anti-aging serum with Pro-Retinol & Vitamin C',
        price: 54.99,
        salePrice: 44.99,
        stock: 150,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
        ],
        tags: ['skincare', 'serum', 'anti-aging', 'vitamin-c', 'loreal', 'facial-care', 'beauty'],
        brand: 'Loreal',
        collections: ['Best Sellers', 'Summer Sale 2024'],
        isFeatured: true,
        seoTitle: 'L\'Oreal Revitalift Triple Power Serum - Anti-Aging Skincare',
        seoDescription: 'L\'Oreal anti-aging serum with Pro-Retinol & Vitamin C. Reduces wrinkles & evens skin tone.',
        seoKeywords: ['loreal serum', 'anti-aging serum', 'vitamin c serum', 'skincare', 'face serum'],
      },
      {
        name: 'Dyson Supersonic Hair Dryer',
        slug: 'dyson-supersonic-hair-dryer',
        description: 'Intelligent heat control measures air temperature 40 times per second. Fast drying with no extreme heat damage. Magnetic attachments for styling versatility. Acoustically tuned for quieter operation.',
        shortDescription: 'Professional ionic hair dryer with intelligent heat control',
        price: 429.99,
        salePrice: 379.99,
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
          'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800',
        ],
        tags: ['hair-dryer', 'dyson', 'styling', 'professional', 'beauty', 'hair-care', 'ionic'],
        collections: ['Tech Essentials', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Dyson Supersonic Hair Dryer - Professional Styling Tool',
        seoDescription: 'Dyson Supersonic with intelligent heat control. Fast drying without heat damage. Professional results.',
        seoKeywords: ['dyson hair dryer', 'supersonic', 'professional hair dryer', 'ionic dryer'],
      },
      {
        name: 'Foreo LUNA 3 Facial Cleansing Device',
        slug: 'foreo-luna-3-cleansing-device',
        description: 'Smart facial cleansing and firming massage device. T-Sonic pulsations for deep yet gentle cleansing. App-connected for customized skincare routines. 100% waterproof. USB rechargeable, 650 uses per charge.',
        shortDescription: 'Smart facial cleansing device with app connectivity',
        price: 199.99,
        stock: 70,
        images: [
          'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
          'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=800',
        ],
        tags: ['facial-cleanser', 'skincare', 'beauty-device', 'foreo', 'smart-beauty', 'tech'],
        collections: ['Tech Essentials'],
        seoTitle: 'Foreo LUNA 3 - Smart Facial Cleansing Device',
        seoDescription: 'App-connected facial cleansing device with T-Sonic technology. Gentle & effective skincare.',
        seoKeywords: ['foreo luna', 'facial cleanser', 'beauty device', 'skincare device'],
      },
      {
        name: 'Lush Aromatherapy Bath Bomb Gift Set',
        slug: 'lush-bath-bomb-gift-set',
        description: 'Luxury gift set with 12 handmade bath bombs. Made with natural essential oils and moisturizing ingredients. Each bomb transforms your bath into a spa-like experience. Vegan and cruelty-free.',
        shortDescription: 'Luxury set of 12 handmade aromatherapy bath bombs',
        price: 64.99,
        salePrice: 49.99,
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
        ],
        tags: ['bath-bombs', 'spa', 'relaxation', 'gift', 'aromatherapy', 'natural', 'vegan'],
        collections: ['Summer Sale 2024'],
        seoTitle: 'Lush Aromatherapy Bath Bomb Gift Set - Natural Spa Experience',
        seoDescription: '12-piece luxury bath bomb set. Natural essential oils, vegan & cruelty-free. Perfect gift.',
        seoKeywords: ['bath bombs', 'spa gift', 'aromatherapy', 'lush', 'bath set'],
      },
    ],
  },
  books: {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Premium books, notebooks, and office supplies',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    products: [
      {
        name: 'Moleskine Classic Leather Notebook Large',
        slug: 'moleskine-leather-notebook-large',
        description: 'Premium Italian leather-bound notebook with 240 ivory pages (120 sheets). Acid-free paper perfect for fountain pens. Ribbon bookmark, elastic closure, and expandable inner pocket. Available in ruled, plain, or dotted.',
        shortDescription: 'Premium leather journal with 240 ivory pages',
        price: 89.99,
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
        ],
        tags: ['notebook', 'journal', 'moleskine', 'leather', 'writing', 'stationery', 'premium'],
        brand: 'Moleskine',
        collections: ['Home Office Setup', 'Best Sellers'],
        isFeatured: true,
        seoTitle: 'Moleskine Classic Leather Notebook - Premium Journal',
        seoDescription: 'Moleskine leather notebook with 240 acid-free pages. Perfect for writing & sketching.',
        seoKeywords: ['moleskine', 'leather notebook', 'journal', 'premium notebook', 'writing journal'],
      },
      {
        name: 'Lamy Safari Fountain Pen Set',
        slug: 'lamy-safari-fountain-pen-set',
        description: 'Iconic German-engineered fountain pen with ergonomic grip. Durable ABS plastic body. Includes 5 ink cartridges and gift packaging. Extra fine, fine, medium nib options. Refillable and sustainable.',
        shortDescription: 'German fountain pen with ergonomic design',
        price: 49.99,
        stock: 90,
        images: [
          'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800',
          'https://images.unsplash.com/photo-1583485088034-697b5bc54ccc?w=800',
        ],
        tags: ['pen', 'fountain-pen', 'lamy', 'writing', 'stationery', 'luxury', 'german'],
        collections: ['Best Sellers'],
        seoTitle: 'Lamy Safari Fountain Pen - Classic German Engineering',
        seoDescription: 'Lamy Safari fountain pen with ergonomic design. Premium writing experience. Gift-ready.',
        seoKeywords: ['lamy safari', 'fountain pen', 'writing pen', 'luxury pen', 'german pen'],
      },
      {
        name: 'Staedtler Watercolor Paint Set Pro',
        slug: 'staedtler-watercolor-paint-set',
        description: 'Professional 48-color watercolor paint set with vibrant, highly pigmented colors. Includes 3 professional brushes, mixing palette, and portable case. Excellent lightfastness and brilliant color intensity. Perfect for artists.',
        shortDescription: 'Professional 48-color watercolor set with brushes',
        price: 79.99,
        salePrice: 64.99,
        stock: 65,
        images: [
          'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
          'https://images.unsplash.com/photo-1516504199850-5f8f6f4b039f?w=800',
        ],
        tags: ['art', 'painting', 'watercolor', 'creative', 'artist', 'supplies', 'professional'],
        collections: ['Best Sellers'],
        seoTitle: 'Staedtler Professional Watercolor Paint Set - 48 Colors',
        seoDescription: 'Professional watercolor set with 48 vibrant colors & brushes. Perfect for artists.',
        seoKeywords: ['watercolor paint', 'art supplies', 'painting set', 'watercolor set'],
      },
      {
        name: 'Bamboo Desktop Organizer Set',
        slug: 'bamboo-desktop-organizer',
        description: 'Eco-friendly bamboo desk organizer with multiple compartments. Holds pens, pencils, paper clips, sticky notes, and phone. Sustainable bamboo construction. Natural finish complements any workspace. Easy assembly.',
        shortDescription: 'Eco-friendly bamboo organizer for office supplies',
        price: 44.99,
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
          'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800',
        ],
        tags: ['organizer', 'desk', 'office', 'bamboo', 'eco-friendly', 'storage', 'workspace'],
        collections: ['Home Office Setup'],
        seoTitle: 'Bamboo Desktop Organizer - Eco-Friendly Office Storage',
        seoDescription: 'Sustainable bamboo desk organizer with multiple compartments. Organize your workspace.',
        seoKeywords: ['desk organizer', 'bamboo organizer', 'office supplies', 'eco-friendly'],
      },
    ],
  },
};

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Collection.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create Brands
    console.log('\n🏢 Creating brands...');
    const brandMap = {};
    for (const brandData of brandsData) {
      const brand = await Brand.create(brandData);
      brandMap[brand.name] = brand._id;
      console.log(`   ✅ Created brand: ${brand.name}`);
    }

    // Create Collections
    console.log('\n📦 Creating collections...');
    const collectionMap = {};
    for (const collectionData of collectionsData) {
      const collection = await Collection.create(collectionData);
      collectionMap[collection.name] = collection._id;
      console.log(`   ✅ Created collection: ${collection.name}`);
    }

    // Add categories and products
    console.log('\n🛍️  Adding categories and products...');
    let totalProducts = 0;
    let productIndex = 1;

    for (const [key, data] of Object.entries(productData)) {
      // Create category
      const category = await Category.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        isActive: true,
      });

      console.log(`\n✅ Created category: ${category.name}`);

      // Create products for this category
      for (const productInfo of data.products) {
        const productToCreate = {
          ...productInfo,
          sku: generateSKU(data.slug, productIndex),
          category: category._id,
          categories: [category._id],
          isActive: true,
          isFeatured: productInfo.isFeatured || false,
          isSpecialOffer: productInfo.salePrice ? true : false,
          vendor: null,
        };

        // Add brand if specified
        if (productInfo.brand && brandMap[productInfo.brand]) {
          productToCreate.brand = brandMap[productInfo.brand];
        }

        // Add collections if specified
        if (productInfo.collections && productInfo.collections.length > 0) {
          productToCreate.collection = collectionMap[productInfo.collections[0]];
          productToCreate.collections = productInfo.collections
            .map(name => collectionMap[name])
            .filter(Boolean);
        }

        await Product.create(productToCreate);
        totalProducts++;
        productIndex++;
        console.log(`   ✅ Added: ${productInfo.name}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Brands: ${Object.keys(brandMap).length}`);
    console.log(`   - Collections: ${Object.keys(collectionMap).length}`);
    console.log(`   - Categories: ${Object.keys(productData).length}`);
    console.log(`   - Products: ${totalProducts}`);
    console.log(`   - Featured Products: ${totalProducts}`);
    console.log(`   - Products with Sale: ${totalProducts}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
