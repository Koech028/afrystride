import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/formatCurrency';

const WHATSAPP_NUMBER = '254705090920'; // Replace with actual number

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img 
                src="/logo.svg" 
                 alt="AfryStride" 
                className="h-10 w-auto"
                onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
            }} 
            />
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Premium sportswear for athletes and teams across Kenya. Quality gear, competitive prices.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#9CA3AF] hover:text-[#E31E24] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#E31E24] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#E31E24] transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Shop</Link></li>
              <li><Link to="/about" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4" /> +{WHATSAPP_NUMBER}
                </a>
              </li>
              <li>
                <a href="mailto:info@afrystride.co.ke" className="flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4" /> afrystride@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-[#9CA3AF] text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Order on WhatsApp</h4>
            <p className="text-[#9CA3AF] text-sm mb-4">Chat with us directly for quick orders and inquiries.</p>
            <a
              href={generateWhatsAppLink(WHATSAPP_NUMBER, 'Hi AfryStride! I would like to place an order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E31E24] text-white px-5 py-2.5 font-semibold text-sm hover:bg-[#c41a1f] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat Now
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-[#9CA3AF] text-xs">
            &copy; {new Date().getFullYear()} AfryStride Sportswear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Add MessageCircle import if not using lucide
import { MessageCircle } from 'lucide-react';