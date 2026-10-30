import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description,
  // Localized keywords focused on Kenyan search habits (Jerseys, Gym wear, Boot prices, CBD shops)
  keywords = 'sportswear kenya, football jerseys nairobi, gym wear nairobi, football boots price in kenya, original tracksuits nairobi, customized jerseys kenya, buy sports items online kenya, wholesale sportswear nairobi, afrystride, jersey printing nairobi, sports shop cbd nairobi',
  image = 'https://afrystride.com/og-image.jpg',
  url,
  type = 'website',
}) {
  const siteTitle = title ? `${title} | AfryStride` : 'AfryStride Sportswear | Premium Sports Kits & Gym Wear Kenya';
  
  // Dynamic fallback description prioritizing local commercial search intent
  const defaultDescription = description || 'Shop premium sportswear in Nairobi at AfryStride. Buy original football jerseys, gym wear, customized tracksuits, and football boots with fast delivery across Kenya.';
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Basic HTML Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AfryStride Sportswear" />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={image} />

      {/* NOTE: viewport is intentionally NOT set here anymore.
          It's static (never changes per-route) and already declared
          once in index.html. Declaring it here too was creating a
          duplicate <meta name="viewport"> tag on every page. */}
    </Helmet>
  );
}