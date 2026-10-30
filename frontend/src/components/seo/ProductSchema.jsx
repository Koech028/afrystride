import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ProductSchema({ product }) {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.slug,
    "brand": {
      "@type": "Brand",
      "name": "AfryStride"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://afrystride.com/product/${product.slug}`,
      "priceCurrency": "KES",
      "price": product.price,
      "availability": product.stock_status === 'in_stock' 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "AfryStride Sportswear"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}