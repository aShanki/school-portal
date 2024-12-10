import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminLayout from '@/app/dashboard/admin/layout'
import AdminDashboard from '@/app/dashboard/admin/page'
import UsersPage from '@/app/dashboard/admin/users/page'
import ClassesPage from '@/app/dashboard/admin/classes/page'

// Mock next-auth
jest.mock('next-auth/react')
// Mock next/navigation
jest.mock('next/navigation')
// Mock fetch
global.fetch = jest.fn()

// Setup QueryClient wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('Admin Layout', () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() }
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('redirects non-admin users to dashboard', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'TEACHER' } },
      status: 'authenticated'
    })

    render(<AdminLayout>Test Content</AdminLayout>)
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
  })

  it('shows content for admin users', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<AdminLayout>Test Content</AdminLayout>)
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})

describe('Admin Dashboard', () => {
  const mockStats = {
    totalUsers: 150,
    roleBreakdown: {
      teachers: 15,
      students: 120,
      parents: 15
    }
  }

  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    })
  })

  it('displays stats cards with correct data', async () => {
    render(<AdminDashboard />, { wrapper })

    await waitFor(() => {
      // Check pairs of titles and values using data-testid
      const titles = screen.getAllByTestId('stats-title')
      const values = screen.getAllByTestId('stats-value')
      
      expect(titles[0]).toHaveTextContent('Total Users')
      expect(values[0]).toHaveTextContent('150')
      
      expect(titles[1]).toHaveTextContent('Teachers')
      expect(values[1]).toHaveTextContent('15')
      
      expect(titles[2]).toHaveTextContent('Students')
      expect(values[2]).toHaveTextContent('120')
      
      expect(titles[3]).toHaveTextContent('Parents')
      expect(values[3]).toHaveTextContent('15')
    })
  })
})

describe('Users Management', () => {
  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'TEACHER' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'STUDENT' }
  ]

  beforeEach(() => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    })
  })

  it('renders user list correctly', async () => {
    render(<UsersPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('handles user deletion', async () => {
    window.confirm = jest.fn(() => true)
    
    render(<UsersPage />, { wrapper })

    // Wait for data to load
    await screen.findByText('John Doe')

    // Use data-testid for menu button
    const menuButton = screen.getByTestId('user-menu-1')
    fireEvent.click(menuButton)

    // Use data-testid for delete button
    const deleteButton = screen.getByTestId('delete-user-1')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
  })
})

describe('Classes Management', () => {
  const mockClasses = [
    {
      _id: '1',
      name: 'Math 101',
      subject: 'Mathematics',
      teacherId: { name: 'John Doe' },
      studentIds: ['1', '2', '3']
    }
  ]

  const mockTeachers = [
    { _id: '1', name: 'John Doe' }
  ]

  beforeEach(() => {
    ;(fetch as jest.Mock)
      .mockImplementation((url) => {
        if (url.includes('/classes')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockClasses
          })
        }
        if (url.includes('/teachers')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTeachers
          })
        }
        return Promise.reject(new Error('Not found'))
      })
  })

  it('renders class list correctly', async () => {
    render(<ClassesPage />, { wrapper })

    await waitFor(() => {
      // Use getByRole with specific names
      expect(screen.getByRole('cell', { name: /math 101/i })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /john doe/i })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /mathematics/i })).toBeInTheDocument()
    })
  })

  it('handles class creation modal', async () => {
    // Mock the teachers endpoint specifically
    ;(fetch as jest.Mock)
      .mockImplementation((url) => {
        if (url.includes('/teachers')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTeachers
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockClasses
        })
      })

    render(<ClassesPage />, { wrapper })

    const createButton = screen.getByRole('button', { name: /create class/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/create new class/i)).toBeInTheDocument()
    })
  })

  it('handles class deletion', async () => {
    window.confirm = jest.fn(() => true)

    render(<ClassesPage />, { wrapper })

    // Wait for data to load
    await screen.findByText('Math 101')

    // Use data-testid for menu button
    const menuButton = screen.getByTestId('class-menu-1')
    fireEvent.click(menuButton)

    // Use data-testid for delete button
    const deleteButton = screen.getByTestId('delete-class-1')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
  })
})
