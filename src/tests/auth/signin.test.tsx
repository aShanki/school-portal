// src/tests/auth/signin.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignIn from '@/app/auth/signin/page'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

// Mock the imports
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))

describe('SignIn Component', () => {
  const mockRouter = {
    replace: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders sign in form', () => {
    render(<SignIn />)
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  describe('Admin Login', () => {
    it('successfully logs in as admin', async () => {
      ;(signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null })
      ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { role: 'ADMIN' } })

      render(<SignIn />)
      await testLogin('admin@admin.com', 'password123', 'ADMIN')
    })
  })

  describe('Parent Logins', () => {
    const parentEmails = [
      'parent.james.johnson@parents.com',
      'parent.linda.martin@parents.com',
      'parent.mary.jackson@parents.com'
    ]

    parentEmails.forEach(email => {
      it(`successfully logs in as parent: ${email}`, async () => {
        ;(signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null })
        ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { role: 'PARENT' } })

        render(<SignIn />)
        await testLogin(email, 'password123', 'PARENT')
      })
    })
  })

  describe('Teacher Logins', () => {
    const teacherEmails = [
      'teacher.elizabeth.anderson@teachers.com',
      'teacher.mary.jones@teachers.com',
      'teacher.margaret.johnson@teachers.com'
    ]

    teacherEmails.forEach(email => {
      it(`successfully logs in as teacher: ${email}`, async () => {
        ;(signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null })
        ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { role: 'TEACHER' } })

        render(<SignIn />)
        await testLogin(email, 'password123', 'TEACHER')
      })
    })
  })

  describe('Student Logins', () => {
    const studentEmails = [
      'student.jennifer.jones@students.com',
      'student.dorothy.anderson@students.com',
      'student.robert.brown@students.com'
    ]

    studentEmails.forEach(email => {
      it(`successfully logs in as student: ${email}`, async () => {
        ;(signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null })
        ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { role: 'STUDENT' } })

        render(<SignIn />)
        await testLogin(email, 'password123', 'STUDENT')
      })
    })
  })

  // Helper function to test login
  async function testLogin(email: string, password: string) {
    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: email } })
    fireEvent.change(passwordInput, { target: { value: password } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
    })
  }

  it('handles failed sign in', async () => {
    // Mock console methods
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock failed sign in with actual API response structure
    ;(signIn as jest.Mock).mockResolvedValueOnce({
      error: 'Invalid credentials',
      status: 401,
      ok: false,
      url: null
    })

    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Attempt sign in with invalid credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    // Wait for and verify error handling
    await waitFor(() => {
      // Verify console output matches actual error response
      expect(consoleSpy).toHaveBeenCalledWith('Sign-in result:', {
        error: 'Invalid credentials',
        status: 401,
        ok: false,
        url: null
      });

      // Verify toast was called with correct error message
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: 'Invalid credentials'
      })

      // Verify no redirect occurred
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    // Clean up
    consoleSpy.mockRestore();
  })

  it('shows loading state during sign in', async () => {
    ;(signIn as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<SignIn />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })
})