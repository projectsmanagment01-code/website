import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

// PUT - Update Pinterest board mapping
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Update board mapping
    const board = await prisma.pinterestBoard.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
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
    console.error('[Pinterest Board API] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Pinterest board mapping' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Pinterest board mapping
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Delete board mapping
    await prisma.pinterestBoard.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Pinterest board mapping deleted successfully'
    });
  } catch (error) {
    console.error('[Pinterest Board API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete Pinterest board mapping' },
      { status: 500 }
    );
  }
}
