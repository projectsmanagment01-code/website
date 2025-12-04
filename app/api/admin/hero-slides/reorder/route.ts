import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST reorder hero slides
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slides } = body; // Expected: [{ id: string, order: number }]

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Update each slide's order
    await Promise.all(
      slides.map((slide) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: { order: slide.order },
        })
      )
    );

    return NextResponse.json({ message: "Slides reordered successfully" });
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    return NextResponse.json(
      { error: "Failed to reorder hero slides" },
      { status: 500 }
    );
  }
}
