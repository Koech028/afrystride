import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, MessageCircle } from 'lucide-react';
import { productApi } from '../services/api';
import { formatCurrency, generateWhatsAppLink } from '../utils/formatCurrency';
import ProductGallery from '../components/product/ProductGallery';
import StickyOrderBar from '../components/layout/StickyOrderBar';
import Button from '../components/ui/Button';
import ProductSchema from '../components/seo/ProductSchema';
import SEO from '../components/seo/SEO'; // Imported to manage specific product metadata

const WHATSAPP_NUMBER = '254705090920';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productApi.getBySlug(slug);
        setProduct(data);
        setSelectedSize('');

        // Load related products from same category
        if (data.category) {
          const relatedData = await productApi.list({ category: data.category, limit: 8 });
          setRelated(relatedData.items.filter(p => p._id !== data._id));
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 w-1/4" />
              <div className="h-8 bg-gray-200 w-3/4" />
              <div className="h-6 bg-gray-200 w-1/4" />
              <div className="h-20 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button href="/shop">Browse Products</Button>
        </div>
      </div>
    );
  }

  const whatsappMessage = `Hi AfryStride! I'm interested in:\n\n*${product.name}*\nPrice: ${formatCurrency(product.price)}\nSize: ${selectedSize || '__'}\nLink: ${window.location.href}`;

  // Localized Dynamic Target Strings 
  const seoTitle = `Buy ${product.name} at Best Price in Kenya`;
  const seoDescription = `Get the original ${product.name} at AfryStride. Available in multiple sizes for only ${formatCurrency(product.price)}. Fast delivery in Nairobi & countrywide. Order via WhatsApp!`;
  const seoKeywords = `${product.name.toLowerCase()} price in kenya, buy ${product.name.toLowerCase()} nairobi, original ${product.name.toLowerCase()}, ${product.category?.toLowerCase()} shop nairobi, afrystride`;
  const seoImage = product.images?.[0] || 'https://afrystride.com';

  return (
    <div>
      {/* Structural Data Layer Injection */}
      <ProductSchema product={product} />
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        url={window.location.href}
      />
      
      <div className="min-h-screen bg-white pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Breadcrumb */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-[#9CA3AF] hover:text-[#E31E24] text-sm mb-4 md:mb-6 py-1 -ml-1 px-1"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Images */}
            <div className="w-full max-w-md mx-auto md:max-w-none">
              {/* Dynamic Image SEO Alt String targeting search bots */}
              <ProductGallery images={product.images} alt={`${product.name} for sale in Nairobi Kenya`} />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="text-[#9CA3AF] text-xs sm:text-sm uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-3 md:mb-4 break-words">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-[#E31E24] mb-5 md:mb-6">
                {formatCurrency(product.price)}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-5 md:mb-6">
                {product.stock_status === 'in_stock' ? (
                  <>
                    <Check className="w-5 h-5 text-[#1E8E3E] shrink-0" />
                    <span className="text-[#1E8E3E] font-medium text-sm sm:text-base">In Stock</span>
                  </>
                ) : (
                  <span className="text-[#E31E24] font-medium text-sm sm:text-base">Out of Stock</span>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes?.length > 0 && product.stock_status === 'in_stock' && (
                <div className="mb-5 md:mb-6">
                  <h3 className="font-semibold text-sm mb-3">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] h-12 px-3 text-sm font-medium border-2 transition-colors ${
                          selectedSize === size
                            ? 'bg-[#E31E24] text-white border-[#E31E24]'
                            : 'border-[#9CA3AF] text-[#0A0A0A] hover:border-[#E31E24]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-sm text-[#9CA3AF] mt-2">Selected: {selectedSize}</p>
                  )}
                </div>
              )}

              {/* Colors */}
              {product.colours?.length > 0 && (
                <div className="mb-5 md:mb-6">
                  <h3 className="font-semibold text-sm mb-3">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colours.map(color => (
                      <span
                        key={color}
                        className="px-3 py-1.5 bg-[#F5F5F5] text-sm text-[#0A0A0A]"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Button - Desktop only (mobile uses StickyOrderBar) */}
              <div className="hidden md:block">
                <Button
                  href={generateWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)}
                  size="lg"
                  fullWidth
                  className="mb-4"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Order via WhatsApp
                </Button>
                <p className="text-sm text-[#9CA3AF] text-center">
                  You'll be redirected to WhatsApp to complete your order
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-10 md:mt-12 border-t border-[#E5E5E5] pt-6 md:pt-8">
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Product Details</h2>
              <p className="text-[#0A0A0A] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {product.description}
              </p>
            </div>
          )}

          {/* Related Products - Horizontal Swipeable Carousel */}
          {related.length > 0 && (
            <div className="mt-10 md:mt-12 border-t border-[#E5E5E5] pt-6 md:pt-8">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">You May Also Like</h2>
              
              {/* Horizontal swipeable carousel */}
              <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="overflow-x-auto scrollbar-hide pb-4">
                  <div className="flex gap-4 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
                    {related.map(item => (
                      <div 
                        key={item._id} 
                        className="snap-start shrink-0 w-[45%] sm:w-[35%] md:w-[23%] lg:w-[22%]"
                      >
                        <Link to={`/product/${item.slug}`}>
                          <div className="bg-[#F5F5F5] aspect-square overflow-hidden mb-2">
                            <img 
                              src={item.images?.[0] || 'https://afrystride.com'} 
                              alt={item.name} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-[#0A0A0A] truncate">{item.name}</h3>
                          <p className="text-[#E31E24] font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Order Bar */}
        <StickyOrderBar product={product} />
      </div>
    </div>
  );
}