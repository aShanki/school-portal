'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const roleBasedLinks = {
    ADMIN: [
      { href: '/dashboard/admin', label: 'Dashboard' },
      { href: '/dashboard/admin/users', label: 'User Management' },
      { href: '/dashboard/admin/classes', label: 'Classes' },
      { href: '/dashboard/admin/settings', label: 'System Settings' }
    ],
    TEACHER: [
      { href: '/dashboard/teacher/classes', label: 'Classes' },
      { href: '/dashboard/teacher/attendance', label: 'Attendance' }
    ],
    STUDENT: [
      { href: '/dashboard/student', label: 'Dashboard' }
    ],
    PARENT: [
      { href: '/dashboard/parent', label: 'Dashboard' },
      { href: '/dashboard/parent/children', label: 'Grades' },
      { href: '/dashboard/parent/attendance', label: 'Attendance' }
    ],
  }

  const links = roleBasedLinks[session?.user?.role as keyof typeof roleBasedLinks] || []

  return (
    <nav className="w-64 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] h-screen p-4 border-r border-[hsl(var(--sidebar-border))] flex flex-col">
      <div className="space-y-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg ${
              pathname === link.href
                ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]'
                : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}