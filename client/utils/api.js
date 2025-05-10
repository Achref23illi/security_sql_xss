const API_URL = 'http://localhost:5000/api';

// Improved error handling function
const handleResponse = async (response) => {
  // Get content type to determine how to parse the response
  const contentType = response.headers.get('content-type') || '';
  
  if (!response.ok) {
    try {
      // Try to parse as JSON
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        throw new Error(errorData.message || 'API request failed');
      } else {
        // Handle text responses
        const textError = await response.text();
        console.error('API Error (text):', textError);
        throw new Error('Network response was not ok');
      }
    } catch (e) {
      // Handle parsing errors or throw the original error
      if (e.name !== 'SyntaxError') {
        throw e;
      }
      console.error('Error parsing error response');
      throw new Error(`Request failed with status: ${response.status}`);
    }
  }
  
  // Handle successful responses
  try {
    // For empty responses or non-JSON types
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (response.status === 204) {
      return null; // No content
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error parsing successful response:', error);
    throw new Error('Error parsing response data');
  }
};

// API client object
const api = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(response);
    },
    
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
  },
  
  // User endpoints
  users: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/users`);
      return handleResponse(response);
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_URL}/users/${id}`);
      return handleResponse(response);
    },
  },
  
  // Comments and posts endpoints
  forum: {
    getPosts: async () => {
      const response = await fetch(`${API_URL}/comments/posts`);
      return handleResponse(response);
    },
    
    getPost: async (id) => {
      const response = await fetch(`${API_URL}/comments/posts/${id}`);
      return handleResponse(response);
    },
    
    getComments: async (postId) => {
      const response = await fetch(`${API_URL}/comments/post/${postId}`);
      return handleResponse(response);
    },
    
    addComment: async (commentData) => {
      console.log('Sending comment data:', commentData);
      try {
        const response = await fetch(`${API_URL}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in addComment:', error);
        throw error;
      }
    },
  },
  
  // Security settings
  security: {
    getStatus: async () => {
      const response = await fetch(`${API_URL}/security-status`);
      return handleResponse(response);
    },
    
    toggleSecurity: async (isSecured) => {
      const response = await fetch(`${API_URL}/security-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSecured }),
      });
      return handleResponse(response);
    },
  },
};

export default api;