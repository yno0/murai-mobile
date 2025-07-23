const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token (you might need to adjust this based on your auth implementation)
const getAuthToken = () => {
  // Return the stored auth token - adjust this based on where you store tokens
  return localStorage.getItem('authToken') || '';
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Dashboard API service functions
export const dashboardService = {
  // Get overview statistics
  getOverview: (timeRange = 'today') => {
    return apiCall(`/dashboard/overview?timeRange=${encodeURIComponent(timeRange)}`);
  },

  // Get activity chart data
  getActivityChart: (timeRange = 'last 7 days') => {
    return apiCall(`/dashboard/activity-chart?timeRange=${encodeURIComponent(timeRange)}`);
  },

  // Get flagged words analytics
  getFlaggedWords: (timeRange = 'last 7 days') => {
    return apiCall(`/dashboard/flagged-words?timeRange=${encodeURIComponent(timeRange)}`);
  },

  // Get website analytics
  getWebsites: (timeRange = 'last 7 days') => {
    return apiCall(`/dashboard/websites?timeRange=${encodeURIComponent(timeRange)}`);
  },

  // Get user activity analytics
  getUserActivity: (timeRange = 'last 7 days') => {
    return apiCall(`/dashboard/user-activity?timeRange=${encodeURIComponent(timeRange)}`);
  },

  // Get AI insights
  getInsights: () => {
    return apiCall('/dashboard/insights');
  },
};

// Helper function to handle API errors gracefully
export const handleApiError = (error, fallbackData = null) => {
  console.error('Dashboard API Error:', error);
  
  // Return fallback data if provided
  if (fallbackData) {
    return fallbackData;
  }
  
  // Return default empty state
  return {
    error: true,
    message: error.message || 'Failed to fetch data',
  };
}; 