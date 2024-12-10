import { cookies } from 'next/headers'
import { headers } from 'next/headers'

export interface FetchError extends Error {
  statusCode?: number;
}

function getBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL_INTERNAL || 'http://localhost:3000'
  }
  return ''
}

export async function fetchWithAuth(path: string, session: any, options: RequestInit = {}): Promise<any> {
  try {
    const baseUrl = getBaseUrl()
    const url = baseUrl ? new URL(path, baseUrl).toString() : path
    
    console.log('[fetchWithAuth] Request:', {
      url,
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role
    })
    
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
        statusText: response.statusText
      })
      const error = new Error('API request failed') as FetchError;
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json()
    console.log('[fetchWithAuth] Success Response:', {
      path,
      status: response.status,
      dataKeys: Object.keys(data)
    })
    return data;
  } catch (error) {
    console.error('[fetchWithAuth] Error:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const fetchServerData = fetchWithAuth;
export const fetchData = fetchWithAuth;