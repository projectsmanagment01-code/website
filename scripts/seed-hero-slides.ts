import { prisma } from "../lib/prisma";

async function seedHeroSlides() {
  console.log("🌱 Seeding hero slides...");

  // Check if slides already exist
  const existingSlides = await prisma.heroSlide.findMany();
  
  if (existingSlides.length > 0) {
    console.log(`ℹ️  Found ${existingSlides.length} existing slides. Skipping seed.`);
    console.log("   Delete existing slides first if you want to reseed.");
    return;
  }

  // Create sample slides - Note: Update backgroundImage paths after seeding
  const slides = [
    {
      title: "Discover Delicious Recipes",
      description: "Easy, healthy, and flavorful meals for every occasion",
      buttonText: "Explore Recipes",
      buttonLink: "/recipes", // Default button link
      backgroundImage: "/hero-bg.jpg", // TODO: Update via admin after seeding
      order: 0,
      isActive: true,
    },
    {
      title: "Plant-Based Perfection",
      description: "Simple recipes that fit your busy lifestyle",
      buttonText: "View Collection",
      buttonLink: "/recipes", // Default button link
      backgroundImage: "/hero-bg.jpg", // TODO: Update via admin after seeding
      order: 1,
      isActive: true,
    },
    {
      title: "Cook with Confidence",
      description: "Step-by-step guides for delicious homemade meals",
      buttonText: "Start Cooking",
      buttonLink: "/recipes", // Default button link
      backgroundImage: "/hero-bg.jpg", // TODO: Update via admin after seeding
      order: 2,
      isActive: true,
    },
  ];

  for (const slide of slides) {
    await prisma.heroSlide.create({
      data: slide,
    });
    console.log(`✅ Created slide: "${slide.title}"`);
  }

  console.log("\n🎉 Hero slides seeded successfully!");
  console.log("📝 Next steps:");
  console.log("   1. Go to /admin/hero-slides");
  console.log("   2. Update the background image URLs");
  console.log("   3. Customize the text and links");
}

async function main() {
  try {
    await seedHeroSlides();
  } catch (error) {
    console.error("❌ Error seeding hero slides:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
