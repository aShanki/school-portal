import { ReactNode } from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

export function createMockSession(overrides = {}) {
  return {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      role: 'TEACHER',
      ...overrides
    },
    expires: '9999-12-31T23:59:59.999Z'
  }
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

export async function renderWithProviders(
  ui: React.ReactElement,
  {
    session = createMockSession(),
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = {}
) {
  // Allow null session to test unauthenticated state
  const sessionData = session === null ? {} : session

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={sessionData}>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    )
  }

  let rendered;
  await act(async () => {
    rendered = render(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    })
    // Wait for initial queries and effects
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  return rendered!;
}

export function createWrapper(sessionData?: any) {
  const queryClient = createTestQueryClient()
  
  return ({ children }: { children: ReactNode }) => (
    <SessionProvider session={sessionData}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

export const selectOption = async (screen: any, labelText: string, optionText: string) => {
  const combobox = screen.getByLabelText(labelText)
  fireEvent.click(combobox)
  
  // Wait for the select content to be in the document
  await waitFor(() => {
    const option = screen.getByTestId(`option-${optionText}`)
    fireEvent.click(option)
  }, { timeout: 3000 })
}