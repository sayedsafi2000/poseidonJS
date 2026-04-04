'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Package, Clock, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Log into your account and select the order you want to return',
      icon: Package,
    },
    {
      step: 2,
      title: 'Print Label',
      description: 'Download and print your prepaid return shipping label',
      icon: RefreshCw,
    },
    {
      step: 3,
      title: 'Ship Package',
      description: 'Pack your items securely and drop off at any carrier location',
      icon: Package,
    },
    {
      step: 4,
      title: 'Get Refund',
      description: 'Receive your refund within 5-7 business days after we receive your return',
      icon: CheckCircle,
    },
  ];

  const returnableItems = [
    { text: 'Unopened products in original packaging', accepted: true },
    { text: 'Items with all tags and labels attached', accepted: true },
    { text: 'Products returned within 30 days of delivery', accepted: true },
    { text: 'Unused and unworn items', accepted: true },
    { text: 'Items with receipt or proof of purchase', accepted: true },
  ];

  const nonReturnableItems = [
    { text: 'Opened hygiene products or personal care items', accepted: false },
    { text: 'Customized or personalized products', accepted: false },
    { text: 'Final sale or clearance items', accepted: false },
    { text: 'Gift cards or downloadable software', accepted: false },
    { text: 'Items damaged due to misuse', accepted: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <RefreshCw className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-xl text-white/90">
              Easy returns within 30 days - No questions asked
            </p>
          </div>
        </div>
      </section>

      {/* Return Policy Highlights */}
      <section className="py-12">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">30-Day Returns</h3>
                <p className="text-gray-600">Return any item within 30 days of purchase</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Free Returns</h3>
                <p className="text-gray-600">We provide prepaid return shipping labels</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Refunds</h3>
                <p className="text-gray-600">Refunds processed within 5-7 business days</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl font-bold mb-4">How to Return Your Order</h2>
            <p className="text-gray-600">
              Follow these easy steps to return your purchase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnSteps.map((step) => (
              <Card key={step.step} className="border-0 shadow-lg relative">
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <div className="mt-6 mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                      <step.icon className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <Link href="/account/orders">
                View My Orders
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What Can Be Returned */}
      <section className="py-12">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Returnable Items */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  We Accept Returns For
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {returnableItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Non-Returnable Items */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Items We Cannot Accept
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {nonReturnableItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container-custom max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Refund Method:</strong> Refunds will be issued to your original payment method within 5-7 business days after we receive and inspect your return.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Partial Refunds:</strong> Items that show signs of use or are not in original condition may receive a partial refund.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Exchange Policy:</strong> We offer exchanges for the same item in a different size or color. Contact support to arrange an exchange.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Damaged Items:</strong> If you receive a damaged or defective item, contact us within 48 hours with photos for immediate replacement or full refund.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Wrong Item:</strong> If you received the wrong item, we'll arrange for a free return pickup and ship the correct item at no extra cost.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with a Return?</h2>
          <p className="text-xl text-white/80 mb-8">
            Our customer support team is here to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-white/90">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link href="/faq">View FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
