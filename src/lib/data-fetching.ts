export interface FetchError extends Error {
  statusCode?: number;
  statusText?: string;
  responseText?: string;
  requestUrl?: string;
}

function getBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL_INTERNAL || 'http://localhost:3000'
  }
  return ''
}

export async function fetchWithAuth<T = unknown>(path: string, session: { user?: { id?: string; role?: string } } | null, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = baseUrl ? new URL(path, baseUrl).toString() : path;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.id || ''}`,
        'x-user-role': session?.user?.role || '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error('[fetchWithAuth] Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      let responseText: string | undefined;
      try {
        responseText = await response.text();
      } catch (e) {
        console.error('[fetchWithAuth] Failed to get response text:', e);
      }

      const error = new Error(`API request failed: ${response.status} ${response.statusText}`) as FetchError;
      error.statusCode = response.status;
      error.statusText = response.statusText;
      error.responseText = responseText;
      error.requestUrl = url;
      throw error;
    }

    const data = await response.json();
    console.log('[fetchWithAuth] Success Response:', {
      path,
      status: response.status,
      dataKeys: Object.keys(data)
    })
    return data;
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error; // Re-throw FetchError
    }
    // Handle network or other errors
    const fetchError = new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`) as FetchError;
    fetchError.statusCode = 500;
    fetchError.requestUrl = url;
    console.error('[fetchWithAuth] Error:', fetchError);
    throw fetchError;
  }
}

// Alias for backward compatibility
export const fetchServerData = fetchWithAuth;
export const fetchData = fetchWithAuth;