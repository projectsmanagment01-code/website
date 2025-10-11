import React from "react";
import { Recipe } from "@/outils/types";
import { FileText, Users, Tags, TrendingUp, Clock, Star } from "lucide-react";

interface DashboardProps {
  recipes: Recipe[];
  onEditRecipe: (recipe: Recipe) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recipes,
  onEditRecipe,
}) => {
  const stats = [
    {
      label: "Total Recipes",
      value: recipes.length,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Categories",
      value: new Set(recipes.map((r) => r.category)).size,
      icon: Tags,
      color: "bg-green-500",
    },
    {
      label: "Authors",
      value: new Set(recipes.map((r) => r.author?.name).filter(Boolean)).size,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Avg. Cook Time",
      value: "25 mins",
      icon: Clock,
      color: "bg-orange-500",
    },
  ];

  const recentRecipes = recipes.slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your recipe collection</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-8 md:w-12 h-8 md:h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Recipes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Recent Recipes
              </h3>
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {recentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onEditRecipe(recipe)}
                >
                  <img
                    src={recipe.img || recipe.heroImage}
                    alt={recipe.imageAlt || recipe.title}
                    className="w-10 md:w-12 h-10 md:h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {recipe.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {recipe.category} • {recipe.timing?.totalTime || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 md:w-4 h-3 md:h-4 fill-current" />
                    <span className="text-xs text-gray-600">4.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Popular Categories
            </h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {Array.from(new Set(recipes.map((r) => r.category)))
                .slice(0, 5)
                .map((category, index) => {
                  const count = recipes.filter(
                    (r) => r.category === category
                  ).length;
                  const percentage = (count / recipes.length) * 100;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500">
                          {count} recipes
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
