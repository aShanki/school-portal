**Project Overview: School Report Card Website**

Develop a comprehensive web application using Next.js, MongoDB, Node.js, and shadcn UI to facilitate seamless interaction between teachers, students, and parents.

---

### User Roles:

1. **Teachers (Admin)**
2. **Parents**
3. **Students**

---

### Common Features:

- **Authentication System**
  - Secure login for all user roles.
  - Role-based access control.
- **Responsive Design**
  - Mobile-friendly interface using shadcn UI components.
- **Dashboard**
  - Personalized dashboard for each user role.
- **Notifications**
  - Real-time updates for grades, attendance, and messages.

---

### Teacher (Admin) Pages and Features:

1. **Dashboard**
   - Overview of classes, assignments, and recent activity.
2. **Student Management**
   - Add, edit, and remove student profiles.
   - Assign students to classes.
3. **Grade Input**
   - Input individual student grades.
   - Bulk grade uploads.
4. **Assignment Management**
   - Create and manage assignments.
   - Configure grading percentages and weightings.
5. **Attendance Tracking**
   - Record daily attendance.
   - View and edit attendance records.
6. **Reports**
   - Generate student report cards.
   - Export reports in various formats.
7. **Messaging System**
   - Communicate with students and parents.
   - Send announcements.
8. **Settings**
   - Update profile information.
   - Adjust system settings.

---

### Parent Pages and Features:

1. **Dashboard**
   - Overview of child's performance and updates.
2. **Child Profiles**
   - View information for each enrolled child.
3. **Grades and Reports**
   - Access current and past grades.
   - Download report cards.
4. **Attendance Records**
   - Monitor attendance history.
   - Receive absence notifications.
5. **ID Load and Purchases**
   - View cafeteria purchases.
   - Add funds to child's ID card.
6. **Communication**
   - Message teachers.
   - Receive school announcements.
7. **Profile Settings**
   - Update contact information.
   - Manage notification preferences.

---

### Student Pages and Features:

1. **Dashboard**
   - Summary of grades, assignments, and schedule.
2. **Grade Overview**
   - Detailed breakdown of grades.
   - View feedback on assignments.
3. **Assignments**
   - Upcoming and past assignments.
   - Submission status.
4. **Attendance**
   - Personal attendance record.
5. **ID Load**
   - Check ID card balance.
   - Transaction history.
6. **Profile**
   - Update personal information.
7. **Messaging**
   - Communicate with teachers.
   - Receive important messages.

---

### Additional Features:

- **Multi-Language Support**
  - Option to switch between languages.
- **Accessibility**
  - Compliance with accessibility standards.
- **Theme Customization**
  - Light and dark mode options.
- **Search Functionality**
  - Global search for quick access.
- **Help and Support**
  - FAQs and contact support.

---

### Site Map:

- **Home Page**
  - Introduction and login access.
- **Authentication**
  - Login and password recovery.
- **Teacher Section**
  - Dashboard
  - Students
  - Assignments
  - Grades
  - Attendance
  - Reports
  - Messaging
  - Settings
- **Parent Section**
  - Dashboard
  - Child Profiles
  - Grades
  - Attendance
  - ID Load
  - Messages
  - Profile
- **Student Section**
  - Dashboard
  - Grades
  - Assignments
  - Attendance
  - ID Load
  - Messages
  - Profile

---

### Database Design (MongoDB):

- **Users Collection**
  - Stores user credentials and roles.
- **Students Collection**
  - Student details linked to parents and classes.
- **Grades Collection**
  - Assignment grades and overall performance.
- **Assignments Collection**
  - Details of assignments and due dates.
- **Attendance Collection**
  - Daily attendance records.
- **Messages Collection**
  - Communication logs between users.
- **Transactions Collection**
  - ID load balances and purchase history.

---

### Technology Stack:

- **Front-end**
  - Next.js with TypeScript.
  - shadcn UI for components.
- **Back-end**
  - Node.js with Express.
  - Next.js API Routes.
- **Database**
  - MongoDB with Mongoose ORM.
- **Authentication**
  - NextAuth.js for authentication and session management.
- **Deployment**
  - Hosted on platforms like Vercel or Netlify.

---