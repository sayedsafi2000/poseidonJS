# PoseidonJS Frontend Storefront

Modern e-commerce storefront built with Next.js 14 featuring a beautiful, responsive design.

## Features

- 🎨 Pixel-perfect, modern design
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast page loads with Next.js
- 🔍 SEO-optimized
- 🛒 Shopping cart with persistent state
- 💳 Complete checkout flow
- 👤 User account management
- 🎯 Product filtering and sorting
- 🖼️ Image optimization
- 🎭 Smooth animations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query (data fetching)
- Zustand (cart state)
- React Hook Form (forms)
- Lucide React (icons)

## Pages

### Public Pages
- `/` - Home page with featured products
- `/products` - Product listing with filters
- `/products/[slug]` - Product detail page
- `/categories` - Category listing
- `/cart` - Shopping cart
- `/checkout` - Checkout process

### User Pages (Protected)
- `/account` - User profile
- `/account/orders` - Order history
- `/account/orders/[id]` - Order details
- `/account/wishlist` - Wishlist
- `/account/settings` - Account settings

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

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features Breakdown

### Home Page
- Hero section with gradient background
- Featured products grid
- Special offers section
- Feature highlights
- Responsive navigation

### Product Listing
- Grid layout with product cards
- Sorting (price, name, date)
- Pagination
- Quick add to cart
- Sale badges

### Product Detail
- Image gallery
- Product information
- Specifications
- Add to cart with quantity selector
- Stock availability
- Related products

### Shopping Cart
- Product list with images
- Quantity adjustment
- Remove items
- Order summary
- Proceed to checkout
- Persistent cart state

### Checkout
- Multi-step form
- Shipping address
- Payment method selection
- Order summary
- Order confirmation

### User Account
- Profile information
- Order history
- Order tracking
- Account settings
- Logout functionality

## Design Features

### Colors
- Primary: Blue gradient (#667eea → #764ba2)
- Secondary gradients
- Consistent color scheme

### Typography
- Inter font family
- Proper heading hierarchy
- Readable font sizes

### Components
- Reusable button styles
- Card components
- Form inputs
- Responsive grid layouts

### Animations
- Smooth transitions
- Hover effects
- Fade-in animations
- Transform effects

## State Management

### Cart Store (Zustand)
- Add items to cart
- Remove items
- Update quantities
- Calculate totals
- Persistent storage

## API Integration

All API calls use React Query for:
- Data fetching
- Caching
- Loading states
- Error handling
- Automatic refetching

## SEO Optimization

- Server-side rendering
- Meta tags
- Semantic HTML
- Image optimization
- Fast loading times

## Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interfaces
- Responsive images
- Adaptive layouts

