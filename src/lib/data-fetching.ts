
type FetchError = {
  message: string;
  statusCode: number;
}

export async function fetchData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const isAbsoluteUrl = endpoint.startsWith('http') || endpoint.startsWith('/api')
  const url = isAbsoluteUrl ? endpoint : `${baseUrl}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error: FetchError = {
      message: 'An error occurred while fetching the data.',
      statusCode: response.status,
    }
    
    try {
      const data = await response.json()
      if (data.message) {
        error.message = data.message
      }
    } catch {
      // Use default error message if JSON parsing fails
    }
    
    throw error
  }

  return response.json()
}