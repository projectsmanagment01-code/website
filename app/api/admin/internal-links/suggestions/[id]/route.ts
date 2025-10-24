import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/admin/internal-links/suggestions/[id]
 * Delete a link suggestion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id;
    
    if (!suggestionId) {
      return NextResponse.json(
        { error: 'Suggestion ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the suggestion
    await prisma.internalLinkSuggestion.delete({
      where: { id: suggestionId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Error deleting suggestion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete suggestion' },
      { status: 500 }
    );
  }
}
