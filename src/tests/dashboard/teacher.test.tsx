import {
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react/pure";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherDashboard from "@/app/dashboard/teacher/page";
import TeacherClassesPage from "@/app/dashboard/teacher/classes/page";
import TeacherAttendancePage from "@/app/dashboard/teacher/attendance/page";
import { renderWithProviders } from "@/tests/utils";
import { QueryClient } from "react-query";
import { render } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

// Mock next-auth
// Mock next/navigation
jest.mock("next/navigation");

jest.mock("next-auth/react");
beforeAll(() => {
  jest.setTimeout(10000);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe("Teacher Dashboard", () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  const mockStats = {
    totalClasses: 3,
    totalStudents: 75,
  };

  beforeEach(() => {
    queryClient.clear() // Clear cache between tests
    jest.clearAllMocks();
    // Mock fetch to return empty session for unauthenticated state
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("/api/auth/session")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("handles unauthenticated access", async () => {
    // Mock session as empty object (unauthenticated state)
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: undefined,
    });

    render(<TeacherDashboard />, { wrapper })
    expect(window.location.href).toContain("/api/auth/signin");
  });

  it("redirects unauthenticated users to login", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    let rendered;
    await act(async () => {
      rendered = await renderWithProviders(<TeacherDashboard />);
    });

    expect(
      rendered.container.querySelector('[data-testid="loading-spinner"]')
    ).toBeInTheDocument();
  });

  it("displays loading state initially", async () => {
    const queryClient = new QueryClient();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "TEACHER" } },
      status: "authenticated",
    });

    await act(async () => {
      const { container } = await renderWithProviders(<TeacherDashboard />, {
        queryClient,
      });
      expect(
        container.querySelector('[data-testid="loading-spinner"]')
      ).toBeInTheDocument();
    });
  });

  it("displays teacher stats correctly", async () => {
    // Mock fetch for stats
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    });

    render(<TeacherDashboard />, { wrapper })

    // Wait for stats to load
    await waitFor(async () => {
      // Make sure these elements have proper data-testid attributes
      expect(await screen.findByTestId("dashboard-title")).toHaveTextContent(
        "Teacher Dashboard"
      );
      expect(await screen.findByText("Active Classes")).toBeInTheDocument();
      expect(await screen.findByText("3")).toBeInTheDocument();
      expect(await screen.findByText("Total Students")).toBeInTheDocument();
      expect(await screen.findByText("75")).toBeInTheDocument();
    });
  });
});

describe("Teacher Classes Page", () => {
  const mockClasses = [
    {
      _id: "1",
      name: "Math 101",
      subject: "Mathematics",
      studentIds: ["1", "2", "3"],
    },
    {
      _id: "2",
      name: "Physics 101",
      subject: "Physics",
      studentIds: ["1", "2"],
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockClasses,
    });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "TEACHER" } },
      status: "authenticated",
    });
  });

  it("displays class list correctly", async () => {
    await renderWithProviders(<TeacherClassesPage />);

    await waitFor(() => {
      expect(screen.getByText("Math 101")).toBeInTheDocument();
    });

    await renderWithProviders(<TeacherClassesPage />);

    const viewButtons = await screen.findAllByRole("button", { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/dashboard/teacher/classes/1"
      );
    });
  });
});

describe("Teacher Attendance Page", () => {
  const mockClasses = [
    {
      _id: "1",
      name: "Math 101",
      subject: "Mathematics",
      studentIds: ["1", "2", "3"],
    },
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockClasses,
    });
  });

  it("displays attendance overview correctly", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "TEACHER" } },
      status: "authenticated",
    });

    await renderWithProviders(<TeacherAttendancePage />);

    await waitFor(async () => {
      expect(
        await screen.findByRole("heading", { name: /attendance overview/i })
      ).toBeInTheDocument();
      expect(await screen.findByText("Math 101")).toBeInTheDocument();
      expect(await screen.findByText("Mathematics")).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: /take attendance/i })
      ).toBeInTheDocument();
    });
  });

  it("handles API error states", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error("Failed to fetch"));
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "TEACHER" } },
      status: "authenticated",
    });

    await renderWithProviders(<TeacherAttendancePage />);

    expect(
      await screen.findByText(/error loading classes/i)
    ).toBeInTheDocument();
  });
});
