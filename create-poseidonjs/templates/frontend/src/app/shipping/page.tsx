'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Package, MapPin, DollarSign, Globe } from 'lucide-react';

export default function ShippingInfoPage() {
  const shippingMethods = [
    {
      name: 'Standard Shipping',
      icon: Package,
      duration: '5-7 Business Days',
      cost: 'Free on orders over $50',
      description: 'Our most popular option for everyday deliveries',
    },
    {
      name: 'Express Shipping',
      icon: Truck,
      duration: '2-3 Business Days',
      cost: '$15.00',
      description: 'Faster delivery for urgent orders',
    },
    {
      name: 'Next Day Delivery',
      icon: Clock,
      duration: '1 Business Day',
      cost: '$25.00',
      description: 'Get your order tomorrow (order before 2 PM)',
    },
    {
      name: 'International Shipping',
      icon: Globe,
      duration: '10-15 Business Days',
      cost: 'Calculated at checkout',
      description: 'We ship to over 100 countries worldwide',
    },
  ];

  const shippingZones = [
    { region: 'United States (Domestic)', time: '3-7 days', cost: 'Free over $50' },
    { region: 'Canada', time: '5-10 days', cost: '$10 - $30' },
    { region: 'Europe', time: '7-14 days', cost: '$15 - $40' },
    { region: 'Asia Pacific', time: '10-15 days', cost: '$20 - $50' },
    { region: 'Rest of World', time: '10-20 days', cost: '$25 - $60' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Truck className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shipping Information
            </h1>
            <p className="text-xl text-white/90">
              Fast, reliable delivery to your doorstep
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="py-12">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Delivery Options</Badge>
            <h2 className="text-3xl font-bold mb-4">Choose Your Shipping Method</h2>
            <p className="text-gray-600">
              Select the delivery speed that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingMethods.map((method, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <method.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{method.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{method.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-primary-600">{method.cost}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Zones */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <MapPin className="w-3 h-3 mr-1" />
              Worldwide Coverage
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Shipping Zones & Rates</h2>
            <p className="text-gray-600">
              We deliver to customers around the world
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Region</th>
                      <th className="px-6 py-4 text-left font-semibold">Delivery Time</th>
                      <th className="px-6 py-4 text-left font-semibold">Shipping Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {shippingZones.map((zone, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium">{zone.region}</td>
                        <td className="px-6 py-4 text-gray-600">{zone.time}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{zone.cost}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Important Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Order Processing:</strong> Orders are processed within 1-2 business days. Orders placed on weekends will be processed on Monday.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Tracking Information:</strong> You'll receive a tracking number via email once your order ships. Track your package in real-time.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Free Shipping:</strong> Enjoy free standard shipping on all orders over $50 within the United States.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>International Orders:</strong> International shipments may be subject to import duties and taxes, which are the responsibility of the recipient.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Delivery Issues:</strong> If your package is delayed or lost, please contact our support team within 30 days of the order date.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Address Accuracy:</strong> Please ensure your shipping address is correct. We cannot be held responsible for packages shipped to incorrect addresses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Shipping FAQs</h2>
            <p className="text-white/80">Common questions about shipping</p>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I change my shipping address after placing an order?</h3>
                <p className="text-white/80">
                  Yes, but only if your order hasn't been shipped yet. Contact our support team immediately with your order number.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do you ship to P.O. Boxes?</h3>
                <p className="text-white/80">
                  Yes, we ship to P.O. Boxes via USPS. However, express shipping options may not be available for P.O. Box addresses.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What if my package is damaged during shipping?</h3>
                <p className="text-white/80">
                  We take great care in packaging your items. If your package arrives damaged, please contact us within 48 hours with photos for a replacement or refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
