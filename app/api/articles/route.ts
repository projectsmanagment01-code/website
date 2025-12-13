import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to calculate reading time from HTML content
function calculateReadingTime(htmlContent: string): number {
  // Strip HTML tags and count words
  const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(word => word.length > 0).length;
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200);
}

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper to extract first image from HTML content
function extractFirstImage(htmlContent: string): string | null {
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

// Helper to extract excerpt from HTML content
function extractExcerpt(htmlContent: string, maxLength: number = 160): string {
  const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// GET - List all articles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = searchParams.get('orderBy') || 'publishedAt';
    const order = searchParams.get('order') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category) {
      where.categoryId = category;
    }
    
    if (author) {
      where.authorId = author;
    }
    
    if (tag) {
      where.tags = { has: tag };
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count
    const total = await prisma.article.count({ where });
    
    // Get articles
    const articles = await prisma.article.findMany({
      where,
      include: {
        authorRef: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        categoryRef: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      slug: customSlug,
      content,
      excerpt,
      featuredImage,
      featuredImageAlt,
      categoryId,
      tags,
      authorId,
      metaTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      ogImage,
      ogTitle,
      ogDescription,
      status = 'draft',
      publishedAt,
      isFeatured = false,
    } = body;
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }
    
    // Generate or validate slug
    const slug = customSlug || generateSlug(title);
    
    // Check if slug exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });
    
    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: "An article with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Auto-calculate reading time
    const readingTime = calculateReadingTime(content);
    
    // Auto-extract featured image if not provided
    const finalFeaturedImage = featuredImage || extractFirstImage(content);
    
    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt || extractExcerpt(content);
    
    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: finalExcerpt,
        featuredImage: finalFeaturedImage,
        featuredImageAlt,
        categoryId: categoryId || null,
        tags: tags || [],
        authorId: authorId || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || finalExcerpt,
        focusKeyword,
        canonicalUrl,
        ogImage: ogImage || finalFeaturedImage,
        ogTitle: ogTitle || title,
        ogDescription: ogDescription || finalExcerpt,
        readingTime,
        status,
        publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        isFeatured,
      },
      include: {
        authorRef: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        categoryRef: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: article,
      message: "Article created successfully",
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create article" },
      { status: 500 }
    );
  }
}
