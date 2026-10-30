import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatCurrency, generateWhatsAppLink } from '../../utils/formatCurrency';
import Badge from '../ui/Badge';

const WHATSAPP_NUMBER = '254705090920';

export default function ProductCard({ product }) {
  const badgeMap = {
    'New': 'new',
    'Best Seller': 'bestseller',
    'School Uniform': 'school',
  };

  const imageUrl = product.images?.[0] || '/placeholder-product.jpg';
  
  // Use actual current domain instead of hardcoded URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://afrystride.co.ke';
  const productUrl = `${baseUrl}/product/${product.slug || product._id}`;

  const whatsappMessage = `Hi AfryStride! I'm interested in:\n\n*${product.name}*\nPrice: ${formatCurrency(product.price)}\nCategory: ${product.category}\nLink: ${productUrl}`;

  return (
    <div className="group bg-[#F5F5F5] overflow-hidden">
      {/* Image */}
      <Link to={`/product/${product.slug || product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-[#F5F5F5]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={badgeMap[product.badge] || 'default'}>
              {product.badge}
            </Badge>
          </div>
        )}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[#9CA3AF] text-xs uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-bold text-[#0A0A0A] text-lg leading-tight mb-2 line-clamp-2">
          <Link to={`/product/${product.slug || product._id}`}>{product.name}</Link>
        </h3>
        <p className="text-[#E31E24] font-bold text-xl">{formatCurrency(product.price)}</p>

        {/* Quick sizes */}
        {product.sizes?.length > 0 && product.stock_status === 'in_stock' && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.sizes.slice(0, 4).map(size => (
              <span key={size} className="text-xs px-2 py-1 bg-white border border-[#9CA3AF] text-[#0A0A0A]">
                {size}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-xs px-2 py-1 text-[#9CA3AF]">+{product.sizes.length - 4}</span>
            )}
          </div>
        )}

        {/* Order Now Button */}
        {product.stock_status === 'in_stock' && (
          <a
            href={generateWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full bg-[#E31E24] text-white font-semibold text-sm py-3 px-4 hover:bg-[#c41a1f] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="w-4 h-4" />
            Order Now
          </a>
        )}
      </div>
    </div>
  );
}