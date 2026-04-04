# PoseidonJS - Complete E-commerce Platform

A professional-grade, full-stack e-commerce platform built with Node.js, Express.js, Next.js, and MongoDB. Features a powerful admin dashboard, beautiful storefront, and comprehensive REST API.

## 🚀 Features

### Backend API
- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Vendor, User)
- **Product Management**: Complete CRUD operations for products, categories, and collections
- **Order Management**: Full order lifecycle management with status tracking
- **Customer Management**: User profiles, order history, and analytics
- **Promotions**: Discount codes, percentage/fixed discounts, usage limits
- **Analytics**: Sales reports, revenue tracking, product analytics
- **Image Upload**: Cloudinary integration for image storage
- **Invoice Generation**: Automated invoice generation for orders

### Admin Dashboard
- **Modern UI**: Responsive design with light/dark mode support
- **Dashboard Analytics**: Real-time business metrics and charts
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: Track and update order status
- **Customer Management**: View customer details and purchase history
- **Promotion Management**: Create and manage discount codes
- **Banner Management**: Control website banners and promotional content
- **Invoice Generator**: Generate and download invoices

### Frontend Storefront
- **SEO-Optimized**: Built with Next.js for excellent SEO performance
- **Responsive Design**: Mobile-first design, works on all devices
- **Product Catalog**: Browse products with filtering and sorting
- **Shopping Cart**: Add to cart with quantity management
- **Checkout**: Complete checkout flow with order placement
- **User Account**: Order history, profile management
- **Modern UI**: Beautiful gradient design with smooth animations

## 📦 Project Structure

```
PoseidonJS/
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── config/       # Configuration files
│   │   └── server.ts     # Entry point
│   └── package.json
├── admin-dashboard/      # Next.js Admin Panel
│   ├── src/
│   │   ├── app/         # Next.js 14 App Router
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities
│   └── package.json
├── frontend/            # Next.js Storefront
│   ├── src/
│   │   ├── app/        # Next.js 14 App Router
│   │   ├── components/ # React components
│   │   ├── store/      # Zustand state management
│   │   └── lib/        # Utilities
│   └── package.json
└── package.json         # Monorepo root
```

## 🛠️ Technology Stack

### Backend
- **Node.js & Express.js**: Server framework
- **TypeScript**: Type safety
- **MongoDB & Mongoose**: Database
- **JWT**: Authentication
- **Cloudinary**: Image storage
- **Bcrypt**: Password hashing

### Frontend & Admin
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Query**: Data fetching
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Recharts**: Data visualization (Admin)
- **Lucide React**: Icons

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PoseidonJS
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
```

4. **Setup Admin Dashboard**
```bash
cd admin-dashboard
cp .env.example .env
# Edit .env with your configuration
npm install
```

5. **Setup Frontend**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/poseidonjs
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN_FRONTEND=http://localhost:3000
CORS_ORIGIN_ADMIN=http://localhost:3001
```

#### Admin Dashboard & Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

**Development Mode** (All services):
```bash
npm run dev
```

Or run individually:

**Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Admin Dashboard**:
```bash
cd admin-dashboard
npm run dev
# Runs on http://localhost:3001
```

**Frontend**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## 📝 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh token | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/update-profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Product Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| GET | `/api/products/slug/:slug` | Get product by slug | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| GET | `/api/products/special-offers` | Get special offers | Public |
| POST | `/api/products` | Create product | Admin/Vendor |
| PUT | `/api/products/:id` | Update product | Admin/Vendor |
| DELETE | `/api/products/:id` | Delete product | Admin/Vendor |

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/my-orders` | Get user orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| POST | `/api/orders` | Create order | Private |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

[See full API documentation in `/backend/README.md`]

## 🎨 Design Features

### Admin Dashboard
- Modern, clean interface with gradient accents
- Light and dark mode support
- Responsive sidebar navigation
- Real-time analytics with charts
- Data tables with pagination
- Form validation
- Toast notifications

### Storefront
- Pixel-perfect responsive design
- Smooth animations and transitions
- Gradient hero sections
- Product cards with hover effects
- Shopping cart with persistent state
- SEO-optimized pages
- Fast page loads with Next.js

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Input validation
- XSS protection

## 🎯 Key Highlights

✅ **Production-Ready**: Clean, well-documented code following best practices
✅ **Envato Standards**: Proper structure, error handling, and comments
✅ **Scalable**: Modular architecture, easy to extend
✅ **Type-Safe**: Full TypeScript support
✅ **SEO-Friendly**: Server-side rendering with Next.js
✅ **Responsive**: Mobile-first design approach
✅ **Modern UI**: Beautiful gradients and smooth animations
✅ **Professional**: Enterprise-grade code quality

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

This is a commercial product. For support, please contact the author.

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**PoseidonJS Team**

## 🆘 Support

For support, email support@poseidonjs.com or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express.js, Next.js, and MongoDB**

