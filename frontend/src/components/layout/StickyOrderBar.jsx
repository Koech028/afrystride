import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/formatCurrency';

const WHATSAPP_NUMBER = '254705090920';

export default function StickyOrderBar({ product }) {
  const message = product 
    ? `Hi AfryStride! I'm interested in: ${product.name} (Size: __, Color: __). Price: KES ${product.price}`
    : 'Hi AfryStride! I would like to place an order.';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 z-40 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-white">
          <p className="text-xs text-[#9CA3AF]">Order via WhatsApp</p>
          <p className="font-bold">Quick & Easy</p>
        </div>
        <a
          href={generateWhatsAppLink(WHATSAPP_NUMBER, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#E31E24] text-white px-5 py-2.5 font-bold text-sm"
        >
          <MessageCircle className="w-5 h-5" /> Order Now
        </a>
      </div>
    </div>
  );
}