import React from "react";

export default function Search() {
  const categories = [
    {
      name: "Morning Favorite",
      href: "/categories/morning-favorites",
      title: "Best Breakfast and Brunch Recipes",
    },
    {
      name: "Evening Meals",
      href: "/categories/evening-meals",
      title: "Best Dinner Recipes for Any Night",
    },
    {
      name: "Sweet Treats",
      href: "/categories/sweet-treats",
      title: "Best Dessert Recipes for Every Occasion",
    },
    {
      name: "Fresh Salads",
      href: "/categories/fresh-salads",
      title: "Best Salad Recipes for Healthy Meals",
    },
    {
      name: "Hearty Mains",
      href: "/categories/hearty-mains",
      title: "Best Main Dish Recipes for Any Occasion",
    },
    {
      name: "Tasty Bites",
      href: "/categories/tasty-bites",
      title: "Best Appetizer and Snack Recipes",
    },
    {
      name: "Refreshing Drinks",
      href: "/categories/refreshing-drinks",
      title: "Best Beverage Recipes for Any Occasion",
    },
    {
      name: "Sauces & Marinades",
      href: "/categories/sauces-marinades",
      title: "Best Sauce and Marinade Recipes",
    },
    {
      name: "Perfect Sides",
      href: "/categories/perfect-sides",
      title: "Best Side Dish Recipes",
    },
    {
      name: "Freshly Baked Breads",
      href: "/categories/freshly-baked-breads",
      title: "Best Bread Recipes for Every Occasion",
    },
    {
      name: "Essential Condiments",
      href: "/categories/essential-condiments",
      title: "Best Condiment Recipes to Elevate Any Dish",
    },
  ];

  const recipes = [
    {
      name: "Easy Maple Bacon Cinnamon Rolls",
      href: "/recipes/easy-maple-bacon-cinnamon-rolls",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1752144103556-tsizifxz.webp",
      title: "Easy Maple Bacon Cinnamon Rolls with Candied Bacon",
    },
    {
      name: "Chicken Broccoli Baked Alfredo",
      href: "/recipes/easy-chicken-broccoli-baked-alfredo",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751912584874-vd6x89wi.webp",
      title: "Easy Chicken and Broccoli Baked Alfredo Recipe - Comfort Food",
    },
    {
      name: "Shrimp Crab Nacho Corn Dogs",
      href: "/recipes/shrimp-crab-nacho-corn-dogs",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751629759104-m73sg0qa.webp",
      title: "Shrimp and Crab Nacho Bomb Corn Dogs - Crispy Seafood Appetizer",
    },
    {
      name: "Cheesy Ham Potato Casserole",
      href: "/recipes/cheesy-ham-potato-casserole",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751540539273-bnafuyun.webp",
      title: "Cheesy Ham and Potato Casserole Recipe - Comfort Food Classic",
    },
    {
      name: "Cheesy Sloppy Joe Garlic Toast",
      href: "/recipes/cheesy-sloppy-joe-garlic-toast",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751477075471-lwf5tpyr.webp",
      title: "Cheesy Sloppy Joe Garlic Toast Recipe - Easy Open-Faced Sandwich",
    },
    {
      name: "Cheese Crusted Hawaiian Grilled Cheese",
      href: "/recipes/cheese-crusted-hawaiian-grilled-cheese",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751361270311-3u2fpz4a.webp",
      title:
        "Cheese Crusted Hawaiian Grilled Cheese Recipe - Crispy Outside, Gooey Inside",
    },
    {
      name: "Bacon Egg Cheese Breakfast Burrito",
      href: "/recipes/bacon-egg-cheese-breakfast-burrito",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751280275988-r6wm8nim.webp",
      title: "Easy Bacon Egg and Cheese Breakfast Burrito Recipe",
    },
    {
      name: "Beef Cheddar Sliders",
      href: "/recipes/beef-cheddar-sliders",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751217175132-4xh7evgb.webp",
      title: "Beef and Cheddar Sliders - Easy Arby's Copycat Recipe",
    },
    {
      name: "Cheesy Beef Potato Burritos",
      href: "/recipes/cheesy-beef-potato-burritos",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751136065405-a3kpl71p.webp",
      title: "Cheesy Beef and Potato Burritos - Taco Bell Copycat Recipe",
    },
    {
      name: "Pretzel Dogs",
      href: "/recipes/pretzel-dogs",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751106819060-deq7hm75.webp",
      title: "Pretzel Dogs - Homemade Hot Dogs Wrapped in Pretzel Dough",
    },
    {
      name: "Baked Turkey Cheese Rolls",
      href: "/recipes/baked-turkey-cheese-rolls",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751014597723-b6eq808p.webp",
      title: "Baked Turkey and Cheese Rolls - Easy Party Appetizer Recipe",
    },
    {
      name: "Chile Relleno Burrito",
      href: "/recipes/chile-relleno-burrito",
      image:
        "https://recipesbyclare.com/cdn-cgi/image/fit=contain,width=160,format=auto/assets/images/1751006662458-l7na1trq.webp",
      title: "Chile Relleno Burrito - Fusion Mexican Comfort Food Recipe",
    },
  ];

  return (
    <div className="flex flex-col gap-12 p-8  xl mx-auto">
      {/* Categories Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          Find Our Categories
        </h2>
        <div className="flex flex-wrap gap-4">
          {categories.map((category, index) => (
            <a
              key={index}
              href={category.href}
              title={category.title}
              className="inline-flex items-center justify-center text-center font-medium bg-gray-100 text-black border-2 border-black transition-all duration-300 ease-in-out shadow-[0px_6px_0_#000] hover:bg-gray-200 hover:shadow-lg"
              style={{
                borderRadius: "60px",
                padding: "calc(1rem / 2)",
                gap: "1rem",
                fontSize: "calc(1.2rem * 0.9)",
              }}
            >
              <span>{category.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Best Recipes Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          Find Our Best Recipes
        </h2>
        <div className="flex flex-wrap gap-4">
          {recipes.map((recipe, index) => (
            <a
              key={index}
              href={recipe.href}
              title={recipe.title}
              className="inline-flex items-center justify-center text-center font-medium bg-gray-100 text-black border-2 border-black transition-all duration-300 ease-in-out shadow-[0px_6px_0_#000] hover:bg-gray-200 hover:shadow-lg"
              style={{
                borderRadius: "60px",
                padding: "calc(1rem / 2)",
                gap: "1rem",
                fontSize: "calc(1.2rem * 0.9)",
              }}
            >
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-10 h-10 rounded-full bg-gray-100 object-cover"
              />
              <span>{recipe.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
