import { RecipeHero } from "@/components/RecipeHero";

export default async function Layout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="bg-stone-100 grid grid-cols-1 lg:grid-cols-6 w-full  py-8 ">
          {/* Main Content */}
          <div className="lg:col-span-1 "></div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <RecipeHero />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8"></div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
