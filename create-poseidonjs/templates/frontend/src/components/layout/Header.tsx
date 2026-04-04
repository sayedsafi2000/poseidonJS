'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, Menu, X, Heart, Package, LogIn, Search, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const { count: wishlistCount } = useWishlist();
  const { isLoggedIn, user, logout } = useAuthSession();

  const goToSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = headerSearch.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b bg-gradient-to-r from-primary-600 to-purple-600 text-white py-2">
        <div className="container-custom flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">🎉 Free shipping on orders over $50!</span>
            <span className="sm:hidden">🎉 Free shipping $50+</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoggedIn && (
              <>
                <Button variant="ghost" size="icon" asChild title="Log in">
                  <Link href="/login">
                    <LogIn className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild title="Sign up">
                  <Link href="/register">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
            <Link href="/track-order" className="hover:underline hidden sm:inline">
              Track Order
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                PoseidonJS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-primary-600 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/products"
              className="transition-colors hover:text-primary-600 relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-primary-600 relative group"
            >
              Categories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/products?offer=true"
              className="transition-colors hover:text-primary-600 relative group"
            >
              Special Offers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setSearchOpen(!searchOpen)}
              type="button"
              aria-expanded={searchOpen}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[10px]">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" asChild title="My account">
                  <Link href="/account">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Log out"
                  type="button"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" asChild title="Log in">
                  <Link href="/login">
                    <LogIn className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild title="Sign up">
                  <Link href="/register">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar (Desktop) */}
      {searchOpen && (
        <div className="hidden md:block border-b bg-gradient-to-b from-white to-slate-50 py-6 animate-fade-in">
          <div className="container-custom">
            <form onSubmit={goToSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="search"
                  name="q"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search products by name, brand, or category..."
                  className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  autoFocus
                  autoComplete="off"
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden border-t animate-slide-in">
          <div className="container-custom py-4 space-y-4">
            <Separator />

            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/products?offer=true"
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Special Offers
              </Link>
              <Link
                href="/track-order"
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Track order
              </Link>

              <Separator />

              {!isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="justify-start"
                    title="Log in"
                  >
                    <Link
                      href="/login"
                      className="flex items-center gap-2 py-2 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="justify-start"
                    title="Sign up"
                  >
                    <Link
                      href="/register"
                      className="flex items-center gap-2 py-2 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Separator />
                </>
              )}

              <Link
                href="/account"
                className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                {isLoggedIn && user ? `Hi, ${user.firstName}` : 'My Account'}
              </Link>
              {isLoggedIn && (
                <button
                  type="button"
                  className="flex items-center gap-2 py-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    router.push('/');
                  }}
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
              <Link
                href="/wishlist"
                className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
