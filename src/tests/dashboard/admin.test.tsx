import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminLayout from '@/app/dashboard/admin/layout'
import AdminDashboard from '@/app/dashboard/admin/page'
import UsersPage from '@/app/dashboard/admin/users/page'
import ClassesPage from '@/app/dashboard/admin/classes/page'
import { renderWithProviders, createMockSession, selectOption } from '../utils'
import { within } from '@testing-library/react'

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
    jest.clearAllMocks()
    // Setup user-related mocks
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUsers
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
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

  it.each([
    {
      role: 'TEACHER',
      name: 'Test Teacher',
      email: 'testteacher@teachers.com',
      parentIds: []
    },
    {
      role: 'ADMIN',
      name: 'Test Admin',
      email: 'testadmin@admins.com',
      parentIds: []
    },
    {
      role: 'PARENT',
      name: 'Test Parent',
      email: 'testparent@parents.com',
      parentIds: []
    },
    {
      role: 'STUDENT',
      name: 'Test Student',
      email: 'teststudent@students.com',
      parentIds: ['6755b126a30771498e5e9a17', '6755b126a30771498e5e9a16']
    }
  ])('handles user creation for $role role', async ({ role, name, email, parentIds }) => {
    const payload = {
      name,
      email,
      password: 'password123',
      role,
      parentIds
    }

    const mockParents = [
      { _id: '6755b126a30771498e5e9a17', name: 'Parent 1' },
      { _id: '6755b126a30771498e5e9a16', name: 'Parent 2' }
    ]

    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/admin/users?role=PARENT')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockParents
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          ...payload,
          _id: '123',
          createdAt: new Date().toISOString()
        })
      })
    })

    render(<UsersPage />, { wrapper })

    // Open and fill form
    const createButton = await screen.findByText(/create user/i)
    fireEvent.click(createButton)

    // Wait for dialog and fill form
    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      fireEvent.change(nameInput, { target: { value: name } })
      fireEvent.change(emailInput, { target: { value: email } })
      fireEvent.change(passwordInput, { target: { value: payload.password } })
    })

    // Select role
    const roleSelect = screen.getByLabelText(/role/i)
    fireEvent.mouseDown(roleSelect)
    await waitFor(() => screen.getByTestId(`option-${role}`), { timeout: 3000 })
    const roleOption = screen.getByTestId(`option-${role}`)
    fireEvent.click(roleOption)

    // Handle student-specific fields
    if (role === 'STUDENT') {
      await waitFor(() => {
        expect(screen.getByTestId('parents-container')).toBeInTheDocument()
      })
      
      mockParents.forEach(parent => {
        if (parentIds.includes(parent._id)) {
          const checkbox = screen.getByTestId(`parent-${parent._id}`)
          fireEvent.click(checkbox)
        }
      })
    }

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i })
    fireEvent.click(submitButton)

    // Verify API call
    await waitFor(() => {
      const postCall = (fetch as jest.Mock).mock.calls.find(
        ([url, opts]) => url.includes('/api/dashboard/admin/users') && opts?.method === 'POST'
      )
      expect(postCall).toBeTruthy()
      expect(JSON.parse(postCall[1].body)).toEqual(payload)
    })
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
    jest.clearAllMocks()
    
    // Setup all fetch mocks before any test runs
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/admin/classes')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClasses
        })
      }
      if (url.includes('/api/dashboard/admin/teachers')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTeachers
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })
  })

  it('renders class list correctly', async () => {
    await renderWithProviders(<ClassesPage />, {
      session: createMockSession({ role: 'ADMIN' })
    })

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('handles class creation modal', async () => {
    await renderWithProviders(<ClassesPage />, {
      session: createMockSession({ role: 'ADMIN' })
    })

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
    })

    const createButton = await screen.findByRole('button', { name: /create class/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
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
