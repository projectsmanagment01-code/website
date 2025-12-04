import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all hero slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const slides = await prisma.heroSlide.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// POST create new hero slide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, buttonText, buttonLink, backgroundImage, isActive } = body;

    // Validate required fields
    if (!title || !description || !buttonText || !buttonLink || !backgroundImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the highest order number
    const highestOrder = await prisma.heroSlide.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newSlide = await prisma.heroSlide.create({
      data: {
        title,
        description,
        buttonText,
        buttonLink,
        backgroundImage,
        isActive: isActive ?? true,
        order: (highestOrder?.order ?? 0) + 1,
      },
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a Prisma error for table not found
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: "Database table 'hero_slides' not found. Please run: npx prisma migrate dev" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create hero slide", details: error.message },
      { status: 500 }
    );
  }
}
