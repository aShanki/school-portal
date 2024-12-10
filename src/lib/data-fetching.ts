import { cookies } from 'next/headers'

type FetchError = {
  message: string;
  statusCode: number;
}

function getBaseUrl(isInternal = false) {
  // For server-side requests, prefer internal URL
  if (typeof window === 'undefined' && isInternal) {
    return process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL
  }
  // For all other requests, use public URL
  return process.env.NEXTAUTH_URL
}

export async function fetchData(path: string, options: RequestInit = {}): Promise<any> {
  const isServer = typeof window === 'undefined'
  const baseUrl = getBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`

  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch data');
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchServerData(path: string, options: RequestInit = {}): Promise<any> {
  const { cookies } = await import('next/headers')
  const baseUrl = getBaseUrl(true)
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')?.value
  
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  
  if (sessionToken) {
    headers.set('Cookie', `next-auth.session-token=${sessionToken}`)
  }

  return fetchData(url, { ...options, headers })
}