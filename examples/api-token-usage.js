/**
 * API Token Usage Examples
 * 
 * This file demonstrates how to use API tokens to access protected endpoints
 */

// Example 1: Basic API token usage
async function testApiTokenAccess(apiToken) {
  try {
    const response = await fetch('/api/protected/example', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Token access successful:', data);
      return data;
    } else {
      const error = await response.json();
      console.error('❌ API Token access failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Example 2: POST request with API token
async function createDataWithApiToken(apiToken, payload) {
  try {
    const response = await fetch('/api/protected/example', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Data created successfully:', result);
      return result;
    } else {
      const error = await response.json();
      console.error('❌ Failed to create data:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Example 3: Recipe API access with error handling
async function getRecipesWithApiToken(apiToken) {
  try {
    const response = await fetch('/api/recipe', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      console.error('❌ Unauthorized: Check if your API token is valid and not expired');
      return null;
    }

    if (response.status === 403) {
      console.error('❌ Forbidden: Your API token may not have sufficient permissions');
      return null;
    }

    if (response.ok) {
      const recipes = await response.json();
      console.log('✅ Recipes retrieved successfully:', recipes.length, 'recipes found');
      return recipes;
    } else {
      const error = await response.json();
      console.error('❌ Failed to retrieve recipes:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Example 4: Axios usage (if you prefer axios over fetch)
async function axiosApiTokenExample(apiToken) {
  try {
    const axios = require('axios'); // or import axios from 'axios'
    
    const response = await axios.get('/api/protected/example', {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    console.log('✅ Axios request successful:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Axios request failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ Axios network error:', error.message);
    }
    return null;
  }
}

// Example 5: React Hook for API token management
function useApiToken() {
  const [apiToken, setApiToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!apiToken) {
      throw new Error('No API token available');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    apiToken,
    setApiToken,
    makeAuthenticatedRequest,
    loading,
    error
  };
}

// Example 6: Token validation before making requests
async function validateApiToken(apiToken) {
  try {
    const response = await fetch('/api/protected/example', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    return {
      valid: response.ok,
      status: response.status,
      expired: response.status === 401
    };
  } catch (error) {
    return {
      valid: false,
      status: 0,
      expired: false,
      error: error.message
    };
  }
}

// Example usage in a real application:
/*
// 1. Store your API token securely
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN; // For client-side
const API_TOKEN = process.env.API_TOKEN; // For server-side

// 2. Use it in your API calls
testApiTokenAccess(API_TOKEN);

// 3. For React components
function MyComponent() {
  const { apiToken, setApiToken, makeAuthenticatedRequest, loading, error } = useApiToken();
  
  useEffect(() => {
    // Set your API token from secure storage
    setApiToken(localStorage.getItem('apiToken')); // Consider more secure storage
  }, []);

  const fetchData = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/protected/example');
      console.log('Data:', data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Protected Data'}
      </button>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
    </div>
  );
}
*/

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testApiTokenAccess,
    createDataWithApiToken,
    getRecipesWithApiToken,
    axiosApiTokenExample,
    validateApiToken
  };
}