/**
 * Authenticated API utility for admin requests
 */

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    // Prepare headers
    let headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Remove Content-Type for FormData requests
    if (fetchOptions.body instanceof FormData) {
      const { "Content-Type": _, ...headersWithoutContentType } = headers;
      headers = headersWithoutContentType;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && requireAuth) {
        // Token expired or invalid, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
        }
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(url, { ...options, method: "POST", body });
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body,
    });
  }

  async delete<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
      body,
    });
  }

  // File upload helper
  async uploadFile(
    url: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.post(url, formData);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper functions for common operations
export const uploadRecipeImage = (
  file: File,
  recipeId?: string,
  category: string = "recipes"
) => {
  return apiClient.uploadFile("/api/recipe/upload", file, {
    recipeId: recipeId || "",
    category,
  });
};

export const verifyAuth = () => {
  return apiClient.get("/api/auth/verify");
};

// Admin recipe operations
export const adminCreateRecipe = (data: any) => {
  return apiClient.post("/api/recipe", data);
};

export const adminUpdateRecipe = (id: string, data: any) => {
  return apiClient.put("/api/recipe", { id, ...data });
};

export const adminDeleteRecipe = (id: string) => {
  return apiClient.delete("/api/recipe", { id });
};

export const adminGetRecipes = (params?: any) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiClient.get(`/api/recipe${queryString}`);
};

// Admin author operations
export const adminCreateAuthor = (data: any) => {
  return apiClient.post("/api/admin/authors", data);
};

export const adminUpdateAuthor = (id: string, data: any) => {
  return apiClient.put(`/api/admin/authors/${id}`, data);
};

export const adminDeleteAuthor = (id: string) => {
  return apiClient.delete(`/api/admin/authors/${id}`);
};

export const adminGetAuthors = (params?: any) => {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiClient.get(`/api/admin/authors${queryString}`);
};
