import React from 'react';
import { Award, Users, Globe } from 'lucide-react';
import SEO from '../components/seo/SEO';

export default function About() {
  return (
    <div>
      <SEO
        title="About Us | Trusted Sports Equipment Suppliers"
        description="Learn how AfryStride grew from a Nairobi shop into Kenya's leading sportswear supplier. We supply high-quality gear to athletes, clubs, and schools nationwide."
        url="https://afrystride.com/about"
        keywords="about afrystride, sportswear suppliers kenya, sports uniform dealers nairobi, football kits wholesale kenya, school sports gear suppliers, best sports shop in nairobi"
      />
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-[#0A0A0A] text-white py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">OUR STORY</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From a small shop in Nairobi to Kenya's trusted sportswear destination
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <img 
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800" 
              alt="AfryStride Store Nairobi" 
              className="w-full aspect-[4/3] object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold mb-4">Built for Athletes, by Athletes</h2>
              <p className="text-[#9CA3AF] leading-relaxed mb-4">
                AfryStride was founded with a simple mission: make quality sportswear accessible to every athlete in Kenya. 
                Whether you're a school team, a local club, or an individual fitness enthusiast, we believe you deserve 
                gear that performs as hard as you do.
              </p>
              <p className="text-[#9CA3AF] leading-relaxed">
                We source directly from trusted manufacturers, cutting out middlemen to bring you competitive prices 
                without compromising on quality.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#F5F5F5]">
              <Award className="w-10 h-10 text-[#E31E24] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Quality First</h3>
              <p className="text-[#9CA3AF] text-sm">Every product is inspected before it reaches you</p>
            </div>
            <div className="text-center p-6 bg-[#F5F5F5]">
              <Users className="w-10 h-10 text-[#E31E24] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Community Driven</h3>
              <p className="text-[#9CA3AF] text-sm">Supporting local teams and school sports programs</p>
            </div>
            <div className="text-center p-6 bg-[#F5F5F5]">
              <Globe className="w-10 h-10 text-[#E31E24] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Nationwide Reach</h3>
              <p className="text-[#9CA3AF] text-sm">Delivering across all 47 counties in Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
