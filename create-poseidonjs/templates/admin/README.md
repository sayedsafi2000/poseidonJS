# PoseidonJS Admin Dashboard

Modern admin dashboard built with Next.js 14 for managing the PoseidonJS e-commerce platform.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 🌓 Light & Dark mode support
- 📊 Real-time analytics dashboard
- 📦 Product management (CRUD)
- 🛒 Order management
- 👥 Customer management
- 🏷️ Promotion management
- 🖼️ Banner management
- 📄 Invoice generation
- 📈 Sales analytics with charts
- 🔐 Role-based access control
- ⚡ Fast and optimized

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query (data fetching)
- React Hook Form (forms)
- Recharts (analytics)
- Zustand (state management)
- Lucide React (icons)

## Pages

### Authentication
- `/login` - Admin login page

### Dashboard
- `/dashboard` - Main dashboard with analytics
- `/dashboard/products` - Product management
- `/dashboard/orders` - Order management
- `/dashboard/customers` - Customer management
- `/dashboard/promotions` - Promotion codes
- `/dashboard/analytics` - Detailed analytics
- `/dashboard/banners` - Banner management
- `/dashboard/invoices` - Invoice generation

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features Breakdown

### Dashboard
- Total revenue, orders, products, customers
- Pending orders and low stock alerts
- Recent orders table
- Monthly revenue tracking

### Product Management
- List all products with pagination
- Search and filter products
- Create/Edit/Delete products
- Image upload support
- Stock management
- Category assignment

### Order Management
- View all orders
- Filter by status
- Update order status
- View order details
- Track shipments

### Customer Management
- View customer list
- Search customers
- View customer details
- Order history per customer
- Customer statistics

### Analytics
- Sales overview charts
- Top selling products
- Products by category
- Revenue analytics
- Low stock products

### Promotion Management
- Create discount codes
- Set usage limits
- Schedule promotions
- Track usage

### Banner Management
- Upload banner images
- Set banner position
- Schedule banners
- Activate/Deactivate

## Authentication

Login with admin credentials to access the dashboard. Token is stored in localStorage.

## Theme

Toggle between light and dark mode using the theme switcher in the sidebar.

## API Integration

All API calls go through `/src/lib/api.ts` which handles:
- Base URL configuration
- Authorization headers
- Error handling
- Token refresh

