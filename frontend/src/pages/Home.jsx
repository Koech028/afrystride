import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { productApi } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await productApi.getFeatured(8);
        setFeatured(productsData);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // WebSite schema to explicitly structure your brand and name for search engine visibility
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AfryStride Sportswear",
    "url": "https://afrystride.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://afrystride.com{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div>
      <SEO
        title="AfryStride Sportswear | Best Sports Shop in Nairobi Kenya"
        description="Buy high-quality, affordable sportswear online at AfryStride Kenya. Shop original football jerseys, training kits, gym wear, and football boots with fast delivery in Nairobi and countrywide."
        keywords="sportswear kenya, sports shop in nairobi, football boots price in kenya, original jerseys nairobi, gym wear kenya, school sportswear supplier nairobi, online sports shopping kenya, tracksuits nairobi, afrystride"
        image="https://afrystride.com/hero-banner.jpg"
        url="https://afrystride.com/"
      />

      {/* Inject WebSite Structured Data into Document Head */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      <div>
        {/* Hero */}
        <section className="relative bg-[#0A0A0A] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img 
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920" 
              alt="AfryStride Premium Sportswear Collection Nairobi" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                GEAR UP FOR <span className="text-[#E31E24]">GREATNESS</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Premium sportswear for athletes, teams, and schools across Kenya. High-quality gear at affordable, competitive prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button href="/shop" size="lg">
                  Shop Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" href="/about" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">Featured Sports Gear</h2>
              <Link to="/shop" className="text-[#E31E24] font-semibold hover:underline flex items-center gap-1">
                View All Items <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductGrid products={featured} loading={loading} />
          </div>
        </section>

        {/* Why Buy From Us */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] mb-12 text-center">Why Shop At AfryStride Kenya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E31E24]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#E31E24]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Guaranteed</h3>
                <p className="text-[#9CA3AF]">Every piece of clothing and gear is inspected thoroughly before it reaches you.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E31E24]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-[#E31E24]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-[#9CA3AF]">Reliable nationwide delivery across Kenya with fast same-day dispatch within Nairobi.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E31E24]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[#E31E24]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Easy Ordering</h3>
                <p className="text-[#9CA3AF]">Order effortlessly via WhatsApp in seconds. Secure, instant buying process.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
