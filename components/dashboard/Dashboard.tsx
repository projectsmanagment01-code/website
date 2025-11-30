import React from "react";
import { Recipe } from "@/outils/types";
import ModernAnalyticsDashboard from "./ModernAnalyticsDashboard";

interface DashboardProps {
  recipes: Recipe[];
  onEditRecipe: (recipe: Recipe) => void;
  onNavigate?: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recipes,
  onEditRecipe,
  onNavigate,
}) => {
  return <ModernAnalyticsDashboard onNavigate={onNavigate} />;
};
