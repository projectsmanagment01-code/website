import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to calculate reading time from HTML content
function calculateReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(word => word.length > 0).length;
  return Math.ceil(wordCount / 200);
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

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        authorRef: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            bio: true,
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
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Increment view count (don't await to not block response)
    prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);
    
    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT - Update article by slug
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Find existing article
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }
    
    const {
      title,
      slug: newSlug,
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
      status,
      publishedAt,
      isFeatured,
    } = body;
    
    // Check if new slug already exists (if changing slug)
    if (newSlug && newSlug !== slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug: newSlug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "An article with this slug already exists" },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readingTime = calculateReadingTime(content);
      // Auto-update featured image if not set
      if (!featuredImage && !existingArticle.featuredImage) {
        updateData.featuredImage = extractFirstImage(content);
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (tags !== undefined) updateData.tags = tags;
    if (authorId !== undefined) updateData.authorId = authorId || null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (focusKeyword !== undefined) updateData.focusKeyword = focusKeyword;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle;
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    
    // Handle status and publishedAt
    if (status !== undefined) {
      updateData.status = status;
      
      // Set publishedAt when publishing for the first time
      if (status === 'published' && !existingArticle.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }
    
    if (publishedAt !== undefined) {
      updateData.publishedAt = new Date(publishedAt);
    }
    
    // Update article
    const article = await prisma.article.update({
      where: { slug },
      data: updateData,
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
      message: "Article updated successfully",
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE - Delete article by slug
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    
    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Delete article
    await prisma.article.delete({
      where: { slug },
    });
    
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
