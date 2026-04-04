# create-poseidonjs

[![npm version](https://img.shields.io/npm/v/create-poseidonjs.svg)](https://www.npmjs.com/package/create-poseidonjs)
[![npm downloads](https://img.shields.io/npm/dm/create-poseidonjs.svg)](https://www.npmjs.com/package/create-poseidonjs)
[![license](https://img.shields.io/npm/l/create-poseidonjs.svg)](https://github.com/poseidonjs/create-poseidonjs/blob/main/LICENSE)

Most modern and complete e-commerce platform generator with production-ready templates and AI-powered features.

---

## 📦 Installation

```bash
npx create-poseidonjs
```

No installation needed! Just use `npx` and start building.

---

## 🚀 Quick Start

Create a new PoseidonJS project in seconds:

```bash
# Interactive mode - Choose what to create
npx create-poseidonjs

# Create backend server (Express.js + MongoDB)
npx create-poseidonjs server my-backend

# Create admin dashboard (Next.js + TypeScript)
npx create-poseidonjs admin my-admin

# Create frontend storefront (Next.js + TypeScript)
npx create-poseidonjs frontend my-shop

# Create full-stack project (Backend + Admin + Frontend)
npx create-poseidonjs full-stack my-ecommerce
```

---

## ✨ What You Get

PoseidonJS includes three production-ready templates:

### 🚀 Backend Server
- **Express.js** REST API with 200+ endpoints
- **MongoDB** + Mongoose ODM
- **JWT** authentication & refresh tokens
- **AI Integration** - Google Gemini for smart features
- **Email Service** - Nodemailer integration
- **Image Upload** - Cloudinary storage
- **Security** - Helmet, CORS, Rate limiting
- **Real-time** notifications

### 📊 Admin Dashboard
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Dark/Light Mode** theme support
- **Analytics** dashboard with Recharts
- **AI Chat Assistant** for product management
- **Real-time** order tracking
- **Customer Insights** and analytics
- **Inventory Management**

### 🛍️ Frontend Storefront
- **Next.js 14** with SSR & SSG
- **SEO Optimized** meta tags
- **Shopping Cart** with Zustand
- **Product Catalog** with filtering
- **Checkout Flow** complete
- **User Accounts** & order history
- **Responsive Design** mobile-first
- **Fast Performance** optimized

---

## 📖 Usage

### Interactive Mode

Simply run without any arguments to get an interactive menu:

```bash
npx create-poseidonjs
```

You'll be prompted to:
1. Choose project type (Server, Admin, Frontend, or Full-Stack)
2. Enter project name
3. Choose whether to install dependencies
4. Select package manager (npm, yarn, or pnpm)

### Command Line Mode

Create projects directly with command line arguments:

#### Create Backend Server

```bash
npx create-poseidonjs server my-backend
cd my-backend
```

**What happens:**
- ✅ Creates project directory
- ✅ Copies all backend template files
- ✅ Creates `.env` from `.env.example`
- ✅ Installs dependencies (optional)
- ✅ Ready to run!

**Next steps:**
```bash
# 1. Edit .env file with your MongoDB URI and credentials
# 2. Start MongoDB
brew services start mongodb-community

# 3. Run development server
npm run dev
# Server runs on http://localhost:5000
```

#### Create Admin Dashboard

```bash
npx create-poseidonjs admin my-admin
cd my-admin
```

**What happens:**
- ✅ Creates Next.js admin project
- ✅ Copies all admin template files
- ✅ Creates `.env.local` from template
- ✅ Installs dependencies (optional)
- ✅ Ready to run!

**Next steps:**
```bash
# 1. Edit .env.local with your backend API URL
# 2. Run development server
npm run dev
# Admin runs on http://localhost:3001
```

#### Create Frontend Storefront

```bash
npx create-poseidonjs frontend my-shop
cd my-shop
```

**What happens:**
- ✅ Creates Next.js storefront project
- ✅ Copies all frontend template files
- ✅ Creates `.env.local` from template
- ✅ Installs dependencies (optional)
- ✅ Ready to run!

**Next steps:**
```bash
# 1. Edit .env.local with your backend API URL
# 2. Run development server
npm run dev
# Frontend runs on http://localhost:3000
```

#### Create Full-Stack Project

```bash
npx create-poseidonjs full-stack my-ecommerce
cd my-ecommerce
```

**What happens:**
- ✅ Creates monorepo with all three projects
- ✅ Creates backend/, admin-dashboard/, frontend/
- ✅ Sets up all `.env` files
- ✅ Creates root `package.json` for workspace
- ✅ Installs all dependencies (optional)
- ✅ Ready to run all at once!

**Next steps:**
```bash
# 1. Edit environment files in each directory
#    - backend/.env
#    - admin-dashboard/.env.local
#    - frontend/.env.local

# 2. Start MongoDB
brew services start mongodb-community

# 3. Run all services at once
npm run dev
```

This starts:
- Backend: `http://localhost:5000`
- Admin: `http://localhost:3001`
- Frontend: `http://localhost:3000`

---

## 🎯 Commands Reference

| Command | Description | Output Port |
|---------|-------------|-------------|
| `npx create-poseidonjs` | Interactive mode | - |
| `npx create-poseidonjs server [name]` | Create backend | 5000 |
| `npx create-poseidonjs admin [name]` | Create admin panel | 3001 |
| `npx create-poseidonjs frontend [name]` | Create storefront | 3000 |
| `npx create-poseidonjs full-stack [name]` | Create all three | All |

---

## ⚙️ Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/poseidonjs

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN_FRONTEND=http://localhost:3000
CORS_ORIGIN_ADMIN=http://localhost:3001

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Gemini AI (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Admin & Frontend Environment Variables

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔧 Requirements

- **Node.js** 18.0.0 or higher
- **MongoDB** (for backend)
- **npm**, **yarn**, or **pnpm** package manager

---

## 🌟 Features Included

### 200+ Features Out of the Box

#### Authentication & Security
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (Admin, Vendor, User)
- ✅ Password encryption with bcrypt
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet.js security headers

#### Product Management
- ✅ Complete CRUD operations
- ✅ Multiple images per product
- ✅ Categories & collections
- ✅ Inventory tracking
- ✅ SKU management
- ✅ Product variations
- ✅ SEO optimization
- ✅ Featured products

#### Order System
- ✅ Shopping cart
- ✅ Checkout flow
- ✅ Order tracking
- ✅ Status management
- ✅ Payment integration ready
- ✅ Invoice generation
- ✅ Email notifications

#### Admin Dashboard
- ✅ Real-time analytics
- ✅ Sales reports with charts
- ✅ Customer insights
- ✅ Inventory management
- ✅ Order management
- ✅ AI-powered chat assistant
- ✅ Dark/light theme
- ✅ Responsive design

#### AI Features
- ✅ Product description generator
- ✅ Review analysis
- ✅ Customer insights
- ✅ Pricing recommendations
- ✅ Fraud detection
- ✅ Auto-reply to reviews

#### Developer Experience
- ✅ TypeScript support (Admin & Frontend)
- ✅ ESLint configuration
- ✅ Clean code structure
- ✅ Comprehensive documentation
- ✅ Environment variables
- ✅ Hot reload
- ✅ Error boundaries

---

## 🏗️ Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers (27 files)
│   ├── models/          # MongoDB schemas (17 models)
│   ├── routes/          # API routes (27 routes)
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── .env.example         # Environment template
├── package.json
└── nodemon.json
```

### Admin Dashboard Structure
```
admin-dashboard/
├── src/
│   ├── app/             # Next.js 14 App Router
│   │   ├── dashboard/  # Dashboard pages
│   │   ├── login/      # Authentication
│   │   └── layout.tsx
│   ├── components/      # React components
│   │   ├── DashboardLayout.tsx
│   │   ├── AIChat.tsx
│   │   └── ...
│   └── lib/            # Utilities
├── .env.example
├── package.json
└── tailwind.config.ts
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/            # Next.js 14 App Router
│   │   ├── products/  # Product pages
│   │   ├── cart/      # Shopping cart
│   │   ├── checkout/  # Checkout flow
│   │   └── account/   # User account
│   ├── components/     # React components
│   │   ├── layout/    # Header, Footer
│   │   └── ui/        # UI components
│   ├── store/         # Zustand state
│   └── lib/           # Utilities
├── .env.example
├── package.json
└── tailwind.config.ts
```

### Full-Stack Structure
```
my-ecommerce/
├── backend/            # Express.js API
├── admin-dashboard/    # Next.js Admin
├── frontend/          # Next.js Storefront
├── package.json       # Monorepo config
└── README.md
```

---

## 📚 API Documentation

The backend includes 200+ RESTful API endpoints across multiple domains:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - List all orders (Admin)
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Categories, Collections, Promotions, Analytics, and more...

Full API documentation is included in each backend project.

---

## 🎨 Customization

All templates are fully customizable:

### Styling
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme customization
- **Dark Mode** built-in support

### Components
- Fully typed TypeScript components
- Reusable UI components
- Custom hooks included

### API
- Easily extend with new endpoints
- Modular controller structure
- Middleware for custom logic

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Start MongoDB
brew services start mongodb-community

# Check if running
brew services list
```

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Dependencies Installation Failed

```bash
# Install manually
cd your-project
npm install
```

### Module Not Found Error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Support

- 📧 Email: support@poseidonjs.com
- 🐛 Issues: [GitHub Issues](https://github.com/poseidonjs/create-poseidonjs/issues)
- 📖 Docs: Check README in each created project
- 💬 Community: Coming soon

---

## 📄 License

MIT License - Free for personal and commercial use

Copyright (c) 2024 PoseidonJS Team

---

## 🙏 Acknowledgments

Built with:
- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini AI](https://ai.google.dev/)

---

## 🚀 Get Started Now

```bash
npx create-poseidonjs
```

**Create your e-commerce platform in minutes, not months!** 🌊

---

## 📊 Package Stats

- **Version:** 1.0.0
- **Size:** 135 KB (gzipped)
- **Files:** 172 template files
- **Dependencies:** 6 CLI dependencies
- **Node:** >=18.0.0

---

**Made with 💙 by PoseidonJS Team**
