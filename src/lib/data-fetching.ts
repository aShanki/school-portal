type FetchError = {
  message: string;
  statusCode: number;
}

export async function fetchData(path: string, options: RequestInit = {}): Promise<any> {
  // For server-side requests, use relative paths
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? process.env.NEXTAUTH_URL || 'http://localhost:3000' : '';
  const fullUrl = new URL(path, baseUrl);

  const response = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
      statusCode: response.status
    }));
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}