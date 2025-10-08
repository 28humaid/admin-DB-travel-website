// utils/apiRequest.js
export const apiRequest = async ({
  url,
  method = 'GET',
  body = null,
  token = null,
  headers = {},
}) => {
  try {
    const defaultHeaders = {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const config = {
      method,
      headers: defaultHeaders,
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.message || `Request failed (Error ${response.status})`;

      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid input data (Error 400).';
      } else if (response.status === 500) {
        errorMessage = 'Server error (Error 500). Please try again later.';
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Failed to connect to the server.');
    }
    throw error; // Re-throw other errors
  }
};