import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading = false, emptyMessage = 'No products found' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#F5F5F5] animate-pulse">
            <div className="aspect-[4/5] bg-gray-300" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-1/3" />
              <div className="h-5 bg-gray-300 rounded w-3/4" />
              <div className="h-6 bg-gray-300 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9CA3AF] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
}