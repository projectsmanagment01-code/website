import React from "react";
import { Recipe } from "@/outils/types";
import { FileText, Users, Tags, TrendingUp, Clock, Star } from "lucide-react";
import { AdminCard, AdminBadge } from "@/components/admin/AdminUI";

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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Overview of your recipe collection</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="w-8 md:w-12 h-8 md:h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 md:w-6 h-4 md:h-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Recipes */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Recipes
              </h3>
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {recentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 cursor-pointer"
                  onClick={() => onEditRecipe(recipe)}
                >
                  <img
                    src={recipe.img || recipe.heroImage}
                    alt={recipe.imageAlt || recipe.title}
                    className="w-10 md:w-12 h-10 md:h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        {recipe.category}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {recipe.timing?.totalTime || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 md:w-4 h-3 md:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">4.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                          {count} recipes
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-slate-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500 ease-out"
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
