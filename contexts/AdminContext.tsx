import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Recipe } from "@/outils/types";
import { AdminRecipeService } from "@/lib/admin-recipe-service";

// Admin State Interface
interface AdminState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  selectedRecipe: Recipe | null;
  isModalOpen: boolean;
  modalMode: "create" | "edit" | "view";
}

// Admin Actions
type AdminAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_RECIPES"; payload: Recipe[] }
  | { type: "ADD_RECIPE"; payload: Recipe }
  | { type: "UPDATE_RECIPE"; payload: Recipe }
  | { type: "DELETE_RECIPE"; payload: string }
  | { type: "SET_SELECTED_RECIPE"; payload: Recipe | null }
  | {
      type: "OPEN_MODAL";
      payload: { mode: "create" | "edit" | "view"; recipe?: Recipe };
    }
  | { type: "CLOSE_MODAL" };

// Initial State
const initialState: AdminState = {
  recipes: [],
  loading: false,
  error: null,
  selectedRecipe: null,
  isModalOpen: false,
  modalMode: "create",
};

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_RECIPES":
      return { ...state, recipes: action.payload, loading: false, error: null };

    case "ADD_RECIPE":
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
        loading: false,
        error: null,
      };

    case "UPDATE_RECIPE":
      return {
        ...state,
        recipes: state.recipes.map((recipe) =>
          recipe.id === action.payload.id ? action.payload : recipe
        ),
        loading: false,
        error: null,
      };

    case "DELETE_RECIPE":
      return {
        ...state,
        recipes: state.recipes.filter((recipe) => recipe.id !== action.payload),
        loading: false,
        error: null,
      };

    case "SET_SELECTED_RECIPE":
      return { ...state, selectedRecipe: action.payload };

    case "OPEN_MODAL":
      return {
        ...state,
        isModalOpen: true,
        modalMode: action.payload.mode,
        selectedRecipe: action.payload.recipe || null,
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        isModalOpen: false,
        selectedRecipe: null,
      };

    default:
      return state;
  }
}

// Context Interface
interface AdminContextType {
  state: AdminState;
  // Recipe Operations
  loadRecipes: () => Promise<void>;
  createRecipe: (recipe: any) => Promise<void>;
  updateRecipe: (id: string, recipe: any) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  // Modal Operations
  openCreateModal: () => void;
  openEditModal: (recipe: Recipe) => void;
  openViewModal: (recipe: Recipe) => void;
  closeModal: () => void;
  // Convenience getters
  loading: boolean;
  error: string | null;
  recipes: Recipe[];
}

// Create Context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider Component
interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, []);

  // Recipe Operations
  const loadRecipes = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const recipes = await AdminRecipeService.getAllRecipes();
      dispatch({ type: "SET_RECIPES", payload: recipes });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createRecipe = async (recipeData: any) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const newRecipe = await AdminRecipeService.createRecipe(recipeData);
      dispatch({ type: "ADD_RECIPE", payload: newRecipe });
      dispatch({ type: "CLOSE_MODAL" });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateRecipe = async (id: string, recipeData: any) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      console.log("AdminContext.updateRecipe called with:");
      console.log("- ID:", id);
      console.log("- Recipe data keys:", Object.keys(recipeData));

      const updatedRecipe = await AdminRecipeService.updateRecipe(
        id,
        recipeData
      );
      dispatch({ type: "UPDATE_RECIPE", payload: updatedRecipe });
      dispatch({ type: "CLOSE_MODAL" });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deleteRecipe = async (id: string) => {
    console.log("🗑️ deleteRecipe called with id:", id, "type:", typeof id);

    if (!id || id.trim() === "") {
      console.error("❌ Invalid recipe ID provided:", id);
      dispatch({ type: "SET_ERROR", payload: "Invalid recipe ID" });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await AdminRecipeService.deleteRecipe(id);
      dispatch({ type: "DELETE_RECIPE", payload: id });
    } catch (error) {
      console.error("❌ Delete recipe error:", error);
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Modal Operations
  const openCreateModal = () => {
    dispatch({ type: "OPEN_MODAL", payload: { mode: "create" } });
  };

  const openEditModal = (recipe: Recipe) => {
    dispatch({ type: "OPEN_MODAL", payload: { mode: "edit", recipe } });
  };

  const openViewModal = (recipe: Recipe) => {
    dispatch({ type: "OPEN_MODAL", payload: { mode: "view", recipe } });
  };

  const closeModal = () => {
    dispatch({ type: "CLOSE_MODAL" });
  };

  const contextValue: AdminContextType = {
    state,
    loadRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    // Convenience getters
    loading: state.loading,
    error: state.error,
    recipes: state.recipes,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom Hook
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
