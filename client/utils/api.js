const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Network response was not ok');
  }
  return response.json();
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
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      return handleResponse(response);
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