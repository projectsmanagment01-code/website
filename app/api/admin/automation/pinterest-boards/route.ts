import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

// GET - Fetch all Pinterest board mappings
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const isValid = await verifyAdminToken(token);
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Fetch all Pinterest boards with category info
    const boards = await prisma.pinterestBoard.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      boards
    });
  } catch (error) {
    console.error('[Pinterest Boards API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Pinterest boards' },
      { status: 500 }
    );
  }
}

// POST - Create new Pinterest board mapping
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const isValid = await verifyAdminToken(token);
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { boardName, boardId, categoryId, isActive = true } = body;

    // Validate required fields
    if (!boardName || !boardId || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Board name, board ID, and category are required' },
        { status: 400 }
      );
    }

    // Check if category already has a board mapped
    const existing = await prisma.pinterestBoard.findFirst({
      where: { categoryId }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This category already has a Pinterest board mapped' },
        { status: 400 }
      );
    }

    // Create new board mapping
    const board = await prisma.pinterestBoard.create({
      data: {
        boardName,
        boardId,
        categoryId,
        isActive
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      board
    });
  } catch (error) {
    console.error('[Pinterest Boards API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Pinterest board mapping' },
      { status: 500 }
    );
  }
}
