import Image from "next/image";
import Link from "next/link";

interface RelatedRecipe {
  title: string;
  image: string;
  link: string;
}

interface RelatedRecipesProps {
  recipes: RelatedRecipe[];
}

export function RelatedRecipes({ recipes }: RelatedRecipesProps) {
  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 border-2 border-gray-300 rounded-lg py-3 px-6 inline-block">
          You Might Also Like
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <Link
            key={index}
            href={recipe.link}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 p-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                  {recipe.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
