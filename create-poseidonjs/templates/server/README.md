# PoseidonJS Backend API

Express.js REST API with MongoDB for the PoseidonJS e-commerce platform.

## Features

- RESTful API architecture
- JWT authentication
- Role-based authorization (Admin, Vendor, User)
- MongoDB with Mongoose ODM
- Cloudinary image upload
- Request validation
- Error handling
- Rate limiting
- Security headers

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user (Protected)
- `PUT /update-profile` - Update user profile (Protected)
- `PUT /change-password` - Change password (Protected)

### Products (`/api/products`)

- `GET /` - Get all products (pagination, filtering, sorting)
- `GET /:id` - Get product by ID
- `GET /slug/:slug` - Get product by slug
- `GET /featured` - Get featured products
- `GET /special-offers` - Get special offer products
- `GET /search?q=query` - Search products
- `POST /` - Create product (Admin/Vendor)
- `PUT /:id` - Update product (Admin/Vendor)
- `DELETE /:id` - Delete product (Admin/Vendor)

### Categories (`/api/categories`)

- `GET /` - Get all categories
- `GET /:id` - Get category by ID
- `GET /slug/:slug` - Get category by slug
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)

### Collections (`/api/collections`)

- `GET /` - Get all collections
- `GET /featured` - Get featured collections
- `GET /:id` - Get collection by ID
- `GET /slug/:slug` - Get collection by slug
- `POST /` - Create collection (Admin)
- `PUT /:id` - Update collection (Admin)
- `DELETE /:id` - Delete collection (Admin)

### Orders (`/api/orders`)

- `GET /` - Get all orders (Admin)
- `GET /my-orders` - Get user's orders (Protected)
- `GET /:id` - Get order by ID (Protected)
- `POST /` - Create order (Protected)
- `PUT /:id/status` - Update order status (Admin)
- `PUT /:id` - Update order (Admin)
- `DELETE /:id` - Delete order (Admin)

### Customers (`/api/customers`)

- `GET /` - Get all customers (Admin)
- `GET /stats` - Get customer statistics (Admin)
- `GET /:id` - Get customer details (Admin)

### Promotions (`/api/promotions`)

- `POST /validate` - Validate promotion code (Public)
- `GET /` - Get all promotions (Admin)
- `GET /:id` - Get promotion by ID (Admin)
- `POST /` - Create promotion (Admin)
- `PUT /:id` - Update promotion (Admin)
- `DELETE /:id` - Delete promotion (Admin)

### Analytics (`/api/analytics`)

- `GET /dashboard` - Dashboard statistics (Admin)
- `GET /sales` - Sales analytics (Admin)
- `GET /products` - Product analytics (Admin)
- `GET /revenue` - Revenue analytics (Admin)

### Upload (`/api/upload`)

- `POST /image` - Upload single image (Admin/Vendor)
- `POST /images` - Upload multiple images (Admin/Vendor)
- `DELETE /image` - Delete image (Admin/Vendor)

### Banners (`/api/banners`)

- `GET /` - Get all banners
- `GET /position/:position` - Get banners by position
- `POST /` - Create banner (Admin)
- `PUT /:id` - Update banner (Admin)
- `DELETE /:id` - Delete banner (Admin)

### Invoices (`/api/invoices`)

- `GET /:orderId` - Generate invoice (Protected)
- `GET /:orderId/pdf` - Download invoice PDF (Admin)

### Users (`/api/users`)

- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID (Admin)
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)
- `PUT /:id/activate` - Toggle user status (Admin)

## Data Models

### User
- firstName, lastName, email, password
- role: admin | vendor | user
- phone, avatar
- isActive, isVerified
- vendorInfo (for vendors)

### Product
- name, slug, description, shortDescription
- price, salePrice, sku, stock
- images (array)
- category, collections
- specifications, tags
- isActive, isFeatured, isSpecialOffer
- weight, dimensions
- SEO fields
- rating, reviewCount, soldCount

### Category
- name, slug, description, image
- parent (for nested categories)
- isActive, sortOrder
- SEO fields

### Collection
- name, slug, description, image
- isActive, isFeatured, sortOrder
- SEO fields

### Order
- orderNumber (auto-generated)
- customer, items (array)
- shippingAddress
- paymentMethod, paymentStatus
- orderStatus: pending | processing | shipped | delivered | cancelled
- subtotal, shippingCost, tax, discount, total
- trackingNumber
- paidAt, deliveredAt

### Promotion
- code, type: percentage | fixed | free_shipping
- value, description
- startDate, endDate
- minPurchase, maxDiscount
- usageLimit, usageCount
- applicableProducts, applicableCategories

### Banner
- title, subtitle, description
- image, mobileImage
- link, linkText
- position: hero | promotional | category | sidebar
- isActive, sortOrder
- startDate, endDate

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/poseidonjs
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN_FRONTEND=http://localhost:3000
CORS_ORIGIN_ADMIN=http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Success Response

```json
{
  "success": true,
  "message": "Success message (optional)",
  "data": {
    // Response data
  }
}
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Security

- Password hashing with bcrypt
- JWT token authentication
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation with express-validator
- MongoDB injection prevention

