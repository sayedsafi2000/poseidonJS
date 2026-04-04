'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Search, 
  ShoppingCart, 
  Truck, 
  RefreshCw,
  Package,
  Shield,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders & Payment',
      icon: ShoppingCart,
      color: 'blue',
      faqs: [
        {
          id: 'order-1',
          question: 'How do I place an order?',
          answer: 'Browse our products, add items to your cart, proceed to checkout, enter your shipping information, and complete payment. You\'ll receive an order confirmation email immediately.',
        },
        {
          id: 'order-2',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are processed securely through Stripe.',
        },
        {
          id: 'order-3',
          question: 'Can I cancel or modify my order?',
          answer: 'Yes, you can cancel or modify your order within 2 hours of placing it. Go to "My Orders" in your account or contact our support team immediately.',
        },
        {
          id: 'order-4',
          question: 'Do you offer discounts or promo codes?',
          answer: 'Yes! Subscribe to our newsletter to receive exclusive discount codes. We also run seasonal sales and special promotions throughout the year.',
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: Truck,
      color: 'green',
      faqs: [
        {
          id: 'ship-1',
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 5-7 business days, Express shipping takes 2-3 days, and Next Day delivery is available for orders placed before 2 PM.',
        },
        {
          id: 'ship-2',
          question: 'Do you ship internationally?',
          answer: 'Yes! We ship to over 100 countries worldwide. International shipping typically takes 10-15 business days. Customs fees may apply.',
        },
        {
          id: 'ship-3',
          question: 'How can I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in real-time by logging into your account and visiting "Order History".',
        },
        {
          id: 'ship-4',
          question: 'Is free shipping available?',
          answer: 'Yes! We offer free standard shipping on all orders over $50 within the United States. International orders have varying shipping costs.',
        },
      ],
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      icon: RefreshCw,
      color: 'purple',
      faqs: [
        {
          id: 'return-1',
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy. Items must be unused, in original packaging, with all tags attached. We provide prepaid return labels for your convenience.',
        },
        {
          id: 'return-2',
          question: 'How do I return an item?',
          answer: 'Log into your account, go to "Order History", select the order, click "Return Item", print the prepaid label, and ship it back. Refunds are processed within 5-7 business days.',
        },
        {
          id: 'return-3',
          question: 'What items cannot be returned?',
          answer: 'Opened hygiene products, customized items, final sale items, gift cards, and downloadable products cannot be returned. See our Returns page for full details.',
        },
        {
          id: 'return-4',
          question: 'Do you offer exchanges?',
          answer: 'Yes! We offer exchanges for different sizes or colors of the same item. Contact our support team to arrange an exchange.',
        },
      ],
    },
    {
      id: 'products',
      title: 'Products & Stock',
      icon: Package,
      color: 'orange',
      faqs: [
        {
          id: 'prod-1',
          question: 'How do I know if an item is in stock?',
          answer: 'Product availability is shown on each product page. If an item is out of stock, you can sign up for email notifications when it\'s back in stock.',
        },
        {
          id: 'prod-2',
          question: 'Are your product photos accurate?',
          answer: 'We strive to display accurate colors and details. However, actual colors may vary slightly due to screen settings. Check product descriptions for detailed specifications.',
        },
        {
          id: 'prod-3',
          question: 'Do you offer product warranties?',
          answer: 'Yes! Most products come with a manufacturer\'s warranty. Warranty details are listed on individual product pages. Contact support for warranty claims.',
        },
        {
          id: 'prod-4',
          question: 'Can I save items for later?',
          answer: 'Yes! Click the heart icon on any product to add it to your Wishlist. You can access your Wishlist anytime from your account menu.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: User,
      color: 'indigo',
      faqs: [
        {
          id: 'acc-1',
          question: 'Do I need an account to make a purchase?',
          answer: 'While you can checkout as a guest, creating an account allows you to track orders, save addresses, create wishlists, and access exclusive member benefits.',
        },
        {
          id: 'acc-2',
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
        },
        {
          id: 'acc-3',
          question: 'Is my personal information secure?',
          answer: 'Absolutely! We use industry-standard SSL encryption to protect your data. We never share your information with third parties without your consent.',
        },
        {
          id: 'acc-4',
          question: 'How do I update my account information?',
          answer: 'Log into your account, go to "My Account", and click on "Edit Profile". You can update your name, email, phone number, and shipping addresses.',
        },
      ],
    },
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Find answers to common questions about our products and services
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 rounded-xl text-gray-900 text-lg shadow-2xl"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12">
        <div className="container-custom max-w-6xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No results found
              </h2>
              <p className="text-gray-600 mb-6">
                Try different keywords or browse all categories
              </p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-lg ${colorMap[category.color]}`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <Badge variant="secondary">{category.faqs.length}</Badge>
                  </div>

                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border-0 mb-4">
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                            <CardContent className="p-0">
                              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-3 text-left">
                                  <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                  <span className="font-semibold text-lg">{faq.question}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4">
                                <p className="text-gray-600 pl-8">{faq.answer}</p>
                              </AccordionContent>
                            </CardContent>
                          </Card>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Helpful Resources</h2>
            <p className="text-gray-600">Quick links to important information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full cursor-pointer" onClick={() => window.location.href = '/shipping'}>
              <CardContent className="p-6 text-center">
                <Truck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-bold text-lg mb-2">Shipping Info</h3>
                <p className="text-sm text-gray-600">Learn about delivery options</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full cursor-pointer" onClick={() => window.location.href = '/returns'}>
              <CardContent className="p-6 text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold text-lg mb-2">Return Policy</h3>
                <p className="text-sm text-gray-600">Easy returns within 30 days</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full cursor-pointer" onClick={() => window.location.href = '/contact'}>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-bold text-lg mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600">We're here to help you</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl text-white/80 mb-8">
            Our customer support team is ready to help
          </p>
          <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-white/90">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
