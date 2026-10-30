from fastapi import APIRouter, Response
from datetime import datetime, timezone

router = APIRouter(tags=["SEO"])

BASE_URL = "https://afrystride.com"


@router.get("/robots.txt", response_class=Response)
async def robots_txt():
    # Targets all mainstream search crawlers while keeping API and admin routers secure
    content = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: {BASE_URL}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml", response_class=Response)
async def sitemap_xml():
    from app.core.database import get_db
    
    db = get_db()
    
    # Static primary pages
    urls = [
        {"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/shop", "priority": "0.9", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/about", "priority": "0.7", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/contact", "priority": "0.7", "changefreq": "monthly"},
    ]
    
    # Dynamic Category Listing Pages - Greatly boosts index coverage for specific sports items
    try:
        categories = await db["categories"].find({}, {"slug": 1}).to_list(length=None)
        for cat in categories:
            urls.append({
                "loc": f"{BASE_URL}/shop?category={cat['slug']}",
                "priority": "0.85",
                "changefreq": "daily"
            })
    except Exception as e:
        print(f"Sitemap categories index log failure: {e}")
    
    # Dynamic individual product pages
    try:
        products = await db["products"].find({}, {"slug": 1, "updated_at": 1, "created_at": 1}).to_list(length=None)
        for p in products:
            # Fallback date structure to guarantee string formatting stability
            mod_date = p.get("updated_at") or p.get("created_at") or datetime.now(timezone.utc)
            
            # Format datetime safely if MongoDB returns a native datetime object
            if isinstance(mod_date, datetime):
                lastmod_str = mod_date.strftime("%Y-%m-%d")
            else:
                lastmod_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

            urls.append({
                "loc": f"{BASE_URL}/product/{p['slug']}",
                "priority": "0.8",
                "changefreq": "weekly",
                "lastmod": lastmod_str
            })
    except Exception as e:
        print(f"Sitemap products index log failure: {e}")
    
    # Build standards-compliant XML structure
    xml = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        xml.append("  <url>")
        xml.append(f"    <loc>{url['loc']}</loc>")
        if "lastmod" in url:
            xml.append(f"    <lastmod>{url['lastmod']}</lastmod>")
        xml.append(f"    <changefreq>{url['changefreq']}</changefreq>")
        xml.append(f"    <priority>{url['priority']}</priority>")
        xml.append("  </url>")
    xml.append("</urlset>")
    
    return Response(content="\n".join(xml), media_type="application/xml")
