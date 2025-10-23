import { PrismaClient, Ad, AdPlacement, AdType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdData {
  name: string;
  type: AdType;
  placement: AdPlacement;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  width?: number;
  height?: number;
  priority?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}

/**
 * Get active ads for a specific placement
 * Filters by active status, date range, and sorts by priority
 */
export async function getAdsForPlacement(placement: AdPlacement): Promise<Ad[]> {
  const now = new Date();

  return await prisma.ad.findMany({
    where: {
      placement,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } }
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Get all ads (admin)
 */
export async function getAllAds(): Promise<Ad[]> {
  return await prisma.ad.findMany({
    orderBy: [
      { placement: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Get ad by ID
 */
export async function getAdById(id: string): Promise<Ad | null> {
  return await prisma.ad.findUnique({
    where: { id }
  });
}

/**
 * Create new ad
 */
export async function createAd(data: AdData, createdBy?: string): Promise<Ad> {
  return await prisma.ad.create({
    data: {
      ...data,
      createdBy,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    }
  });
}

/**
 * Update ad
 */
export async function updateAd(id: string, data: Partial<AdData>): Promise<Ad> {
  return await prisma.ad.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    }
  });
}

/**
 * Delete ad
 */
export async function deleteAd(id: string): Promise<Ad> {
  return await prisma.ad.delete({
    where: { id }
  });
}

/**
 * Record ad impression
 */
export async function recordImpression(id: string): Promise<void> {
  await prisma.ad.update({
    where: { id },
    data: {
      impressionCount: {
        increment: 1
      }
    }
  });
}

/**
 * Record ad click
 */
export async function recordClick(id: string): Promise<void> {
  await prisma.ad.update({
    where: { id },
    data: {
      clickCount: {
        increment: 1
      }
    }
  });
}

/**
 * Get ad statistics
 */
export async function getAdStatistics() {
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      placement: true,
      impressionCount: true,
      clickCount: true,
      isActive: true,
    }
  });

  return ads.map(ad => ({
    ...ad,
    ctr: ad.impressionCount > 0 
      ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) 
      : '0.00'
  }));
}

/**
 * Toggle ad active status
 */
export async function toggleAdStatus(id: string): Promise<Ad> {
  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) throw new Error('Ad not found');

  return await prisma.ad.update({
    where: { id },
    data: { isActive: !ad.isActive }
  });
}
