export const api = async (endpoint: string, options: any = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://aurumvault-w632.onrender.com/api';
  
  let token = null;
  try {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      token = storedToken;
    }
  } catch (e) {
    console.warn('LocalStorage access blocked:', e);
  }

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  // Only set Content-Type to JSON if body is present and NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
    headers['Content-Type'] = 'application/json';
  }

  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    console.log(`[API] ${options.method || 'GET'} ${endpoint} → Status: ${response.status}`);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => '');
        errorData = { message: text || `Error ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.message || errorData.error || 'API error');
    }

    return response.json();
  } catch (error: any) {
    console.error(`[API ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};
