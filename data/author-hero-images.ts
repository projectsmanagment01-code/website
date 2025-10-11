export interface AuthorHeroImage {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  assignedAuthors: string[];
}

export const AUTHOR_HERO_IMAGES: AuthorHeroImage[] = [
  {
    id: "hero-1",
    name: "Culinary Master",
    imageUrl: "/uploads/authors/chef-master.png",
    description: "Professional chef with expertise in various cuisines",
    assignedAuthors: [],
  },
  {
    id: "hero-2",
    name: "Home Cook Expert",
    imageUrl: "/uploads/authors/home-cook.png",
    description: "Passionate home cook sharing family recipes",
    assignedAuthors: [],
  },
  {
    id: "hero-3",
    name: "Baking Specialist",
    imageUrl: "/uploads/authors/baker.png",
    description: "Specialist in desserts and baked goods",
    assignedAuthors: [],
  },
  {
    id: "hero-4",
    name: "Healthy Eating Advocate",
    imageUrl: "/uploads/authors/health-advocate.png",
    description: "Focus on nutritious and healthy recipes",
    assignedAuthors: [],
  },
  {
    id: "hero-5",
    name: "International Flavors",
    imageUrl: "/uploads/authors/international.png",
    description: "Explorer of global cuisines and flavors",
    assignedAuthors: [],
  },
];

export function getHeroImageForAuthor(authorName: string): string {
  // Simple assignment based on author name hash for consistency
  const hash = authorName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const imageIndex = Math.abs(hash) % AUTHOR_HERO_IMAGES.length;
  return AUTHOR_HERO_IMAGES[imageIndex].imageUrl;
}

export function assignAuthorToHeroImage(
  authorName: string,
  heroImageId: string
): void {
  // Remove author from any existing assignments
  AUTHOR_HERO_IMAGES.forEach((image) => {
    image.assignedAuthors = image.assignedAuthors.filter(
      (name) => name !== authorName
    );
  });

  // Add author to the specified hero image
  const targetImage = AUTHOR_HERO_IMAGES.find((img) => img.id === heroImageId);
  if (targetImage && !targetImage.assignedAuthors.includes(authorName)) {
    targetImage.assignedAuthors.push(authorName);
  }
}

export function getAssignedHeroImage(
  authorName: string
): AuthorHeroImage | null {
  return (
    AUTHOR_HERO_IMAGES.find((image) =>
      image.assignedAuthors.includes(authorName)
    ) || null
  );
}
