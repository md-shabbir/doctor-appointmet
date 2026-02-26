import { PrismaClient, Priority, TestType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (order matters due to FKs)
  await prisma.test.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.phase.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ════════════════════════════════════════════════════════════
  // PHASE 1: Project Setup & Authentication
  // ════════════════════════════════════════════════════════════
  const phase1 = await prisma.phase.create({
    data: {
      title: "Project Setup & Authentication",
      description:
        "Initialize project infrastructure, configure database, and implement authentication with role-based access control.",
      priority: "CRITICAL",
      order: 1,
      tags: ["setup", "auth", "infrastructure"],
    },
  });

  // Task 1.1
  const task1_1 = await prisma.task.create({
    data: {
      title: "Project Configuration",
      description:
        "Set up Next.js with TypeScript, Tailwind CSS, shadcn/ui, Prisma 5.x, and Neon PostgreSQL.",
      phaseId: phase1.id,
      priority: "CRITICAL",
      order: 1,
      tags: ["setup", "config"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Initialize Next.js with TypeScript and Tailwind CSS",
        description:
          "Use create-next-app with App Router, src directory, TypeScript enabled.",
        taskId: task1_1.id,
        priority: "CRITICAL",
        order: 1,
      },
      {
        title: "Install and configure shadcn/ui",
        description:
          "Run shadcn-ui init, configure components.json. Install components: Button, Input, Card, Dialog, Form, Table, Select, Tabs, Toast, Avatar, Badge, Calendar, DropdownMenu, Sheet, Separator, Label, Textarea.",
        taskId: task1_1.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Configure Prisma 5.x with Neon PostgreSQL",
        description:
          "Install prisma@5 and @prisma/client@5. Set DATABASE_URL to Neon connection string. Create initial schema and run first migration.",
        taskId: task1_1.id,
        priority: "CRITICAL",
        order: 3,
      },
      {
        title: "Set up environment variables",
        description:
          "Create .env.example with: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, STRIPE_SECRET_KEY (optional), STRIPE_PUBLISHABLE_KEY (optional).",
        taskId: task1_1.id,
        priority: "HIGH",
        order: 4,
      },
      {
        title: "Create Prisma client singleton",
        description:
          "Create src/lib/prisma.ts with global PrismaClient instance to avoid multiple connections in dev mode.",
        taskId: task1_1.id,
        priority: "HIGH",
        order: 5,
      },
      {
        title: "Set up project folder structure",
        description:
          "Create directories: src/app/(auth), src/app/(patient), src/app/(doctor), src/app/(admin), src/app/api, src/components/ui, src/components/shared, src/lib, src/types, src/hooks.",
        taskId: task1_1.id,
        priority: "HIGH",
        order: 6,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Database connection works",
        description:
          "Verify Prisma can connect to Neon PostgreSQL and execute a simple query.",
        taskId: task1_1.id,
        testType: "INTEGRATION",
        testCommand: "npx prisma db pull",
        expectedResult: "Schema pulled successfully without connection errors.",
        priority: "HIGH",
        order: 7,
      },
      {
        title: "Test: Next.js dev server starts",
        description: "Verify npm run dev starts without errors.",
        taskId: task1_1.id,
        testType: "INTEGRATION",
        testCommand: "npm run dev",
        expectedResult: "Server starts on localhost:3000 without errors.",
        priority: "HIGH",
        order: 8,
      },
    ],
  });

  // Task 1.2
  const task1_2 = await prisma.task.create({
    data: {
      title: "Application Database Schema",
      description:
        "Design and create all Prisma models for the app: User, Doctor, Patient, Appointment, Review, Notification, MedicalRecord, Prescription, FamilyMember, Schedule, BlockedSlot, Waitlist.",
      phaseId: phase1.id,
      priority: "CRITICAL",
      order: 2,
      tags: ["database", "schema", "models"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create User model with NextAuth tables",
        description:
          "User: id, email, password (hashed), name, phone, role (PATIENT/DOCTOR/ADMIN), emailVerified, image, createdAt, updatedAt. Also create Account, Session, VerificationToken models for NextAuth PrismaAdapter.",
        taskId: task1_2.id,
        priority: "CRITICAL",
        order: 1,
      },
      {
        title: "Create Doctor model",
        description:
          "Fields: id, userId (FK unique), specialty, qualifications, experience (years), bio, consultationFee (Decimal), address, city, state, zipCode, latitude (Float?), longitude (Float?), isVerified (default false), isActive (default true). Relations: User (1:1), Schedule[], Appointment[], Review[], BlockedSlot[].",
        taskId: task1_2.id,
        priority: "CRITICAL",
        order: 2,
      },
      {
        title: "Create Patient model",
        description:
          "Fields: id, userId (FK unique), dateOfBirth, gender, bloodGroup, allergies (text), emergencyContact, address. Relations: User (1:1), Appointment[], MedicalRecord[], FamilyMember[].",
        taskId: task1_2.id,
        priority: "CRITICAL",
        order: 3,
      },
      {
        title: "Create Appointment model",
        description:
          "Fields: id, patientId (FK), doctorId (FK), date (DateTime), startTime (String), endTime (String), status (PENDING/CONFIRMED/CANCELLED/COMPLETED/NO_SHOW), bookingType (SELF/FAMILY_MEMBER), familyMemberId (FK nullable), reason, notes, createdAt, updatedAt.",
        taskId: task1_2.id,
        priority: "CRITICAL",
        order: 4,
      },
      {
        title: "Create Schedule model",
        description:
          "Fields: id, doctorId (FK), dayOfWeek (Int 0-6), startTime (String HH:mm), endTime (String HH:mm), slotDuration (Int minutes, default 30), isActive (Boolean default true). Defines recurring weekly availability.",
        taskId: task1_2.id,
        priority: "HIGH",
        order: 5,
      },
      {
        title: "Create BlockedSlot model",
        description:
          "Fields: id, doctorId (FK), date (DateTime), startTime (String), endTime (String), reason. For holidays, personal time off, etc.",
        taskId: task1_2.id,
        priority: "MEDIUM",
        order: 6,
      },
      {
        title: "Create Review model",
        description:
          "Fields: id, patientId (FK), doctorId (FK), appointmentId (FK unique), rating (Int 1-5), comment, isApproved (default false), createdAt. One review per appointment.",
        taskId: task1_2.id,
        priority: "MEDIUM",
        order: 7,
      },
      {
        title: "Create Notification model",
        description:
          "Fields: id, userId (FK), title, message, type (APPOINTMENT/REMINDER/SYSTEM/REVIEW), isRead (default false), metadata (Json?), createdAt.",
        taskId: task1_2.id,
        priority: "MEDIUM",
        order: 8,
      },
      {
        title: "Create MedicalRecord model",
        description:
          "Fields: id, patientId (FK), doctorId (FK), appointmentId (FK unique), diagnosis, symptoms, notes, createdAt.",
        taskId: task1_2.id,
        priority: "HIGH",
        order: 9,
      },
      {
        title: "Create Prescription model",
        description:
          "Fields: id, medicalRecordId (FK), medications (Json array: [{name, dosage, frequency, duration}]), instructions, createdAt.",
        taskId: task1_2.id,
        priority: "HIGH",
        order: 10,
      },
      {
        title: "Create FamilyMember model",
        description:
          "Fields: id, patientId (FK), name, relation, dateOfBirth, gender, bloodGroup, allergies. For booking on behalf of dependents.",
        taskId: task1_2.id,
        priority: "MEDIUM",
        order: 11,
      },
      {
        title: "Create Waitlist model",
        description:
          "Fields: id, patientId (FK), doctorId (FK), preferredDate (DateTime), preferredTimeStart (String), preferredTimeEnd (String), status (WAITING/NOTIFIED/EXPIRED/BOOKED), createdAt.",
        taskId: task1_2.id,
        priority: "LOW",
        order: 12,
      },
      {
        title: "Run migration for all application models",
        description:
          "Run: npx prisma migrate dev --name add_app_models. Verify all tables created in Neon.",
        taskId: task1_2.id,
        priority: "CRITICAL",
        order: 13,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Prisma schema validates",
        description: "Run prisma validate to ensure no schema errors.",
        taskId: task1_2.id,
        testType: "UNIT",
        testCommand: "npx prisma validate",
        expectedResult: "Schema is valid.",
        priority: "HIGH",
        order: 14,
      },
      {
        title: "Test: All models CRUD operations",
        description:
          "Create a test script that creates, reads, updates, and deletes a record in each model. Verify relations work correctly.",
        taskId: task1_2.id,
        testType: "INTEGRATION",
        testCommand: "npx ts-node --compiler-options '{\"module\":\"commonjs\"}' prisma/test-crud.ts",
        expectedResult: "All CRUD operations pass without constraint violations.",
        priority: "HIGH",
        order: 15,
      },
    ],
  });

  // Task 1.3
  const task1_3 = await prisma.task.create({
    data: {
      title: "Authentication System (NextAuth.js)",
      description:
        "Implement NextAuth.js with Credentials and Google OAuth providers, role-based middleware, and protected routes.",
      phaseId: phase1.id,
      priority: "CRITICAL",
      order: 3,
      tags: ["auth", "nextauth", "middleware"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Install and configure NextAuth.js with PrismaAdapter",
        description:
          "Install next-auth @next-auth/prisma-adapter. Create src/app/api/auth/[...nextauth]/route.ts. Configure PrismaAdapter, set NEXTAUTH_SECRET, NEXTAUTH_URL.",
        taskId: task1_3.id,
        priority: "CRITICAL",
        order: 1,
      },
      {
        title: "Implement Credentials provider",
        description:
          "Email/password login. Install bcryptjs. Validate credentials against User table. Hash passwords on registration. Return user with role in JWT.",
        taskId: task1_3.id,
        priority: "CRITICAL",
        order: 2,
      },
      {
        title: "Implement Google OAuth provider",
        description:
          "Configure Google provider with GOOGLE_CLIENT_ID/SECRET. On first sign-in, auto-create Patient profile. Handle account linking.",
        taskId: task1_3.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Create registration API route",
        description:
          "POST /api/auth/register — validate with zod (name, email, password, role). Hash password with bcrypt. Create User + Patient or Doctor record. Return 201. Handle 409 duplicate email.",
        taskId: task1_3.id,
        priority: "CRITICAL",
        order: 4,
      },
      {
        title: "Extend JWT and session with role and profile IDs",
        description:
          "In NextAuth callbacks: jwt callback — add role, userId. session callback — expose role, userId, patientId/doctorId. Create src/types/next-auth.d.ts for type augmentation.",
        taskId: task1_3.id,
        priority: "CRITICAL",
        order: 5,
      },
      {
        title: "Create auth middleware for route protection",
        description:
          "src/middleware.ts — protect /patient/*, /doctor/*, /admin/* routes. Redirect unauthenticated to /login. Redirect wrong role to their dashboard. Allow /api/auth/* and public pages.",
        taskId: task1_3.id,
        priority: "HIGH",
        order: 6,
      },
      {
        title: "Build login page",
        description:
          "src/app/(auth)/login/page.tsx — Email/password form, Google sign-in button, 'Forgot password?' link, 'Register' link. shadcn/ui Card, Input, Button, Label. Show toast on error. Redirect to dashboard on success.",
        taskId: task1_3.id,
        priority: "HIGH",
        order: 7,
      },
      {
        title: "Build registration page",
        description:
          "src/app/(auth)/register/page.tsx — Name, email, password, confirm password, role selector (Patient/Doctor). If Doctor: show specialty, qualifications, experience fields. Validate with zod. Call /api/auth/register then redirect to login.",
        taskId: task1_3.id,
        priority: "HIGH",
        order: 8,
      },
      {
        title: "Create useSession hook wrapper",
        description:
          "src/hooks/useCurrentUser.ts — Wrapper around useSession that returns typed user with role, userId, profileId. Convenience for components.",
        taskId: task1_3.id,
        priority: "MEDIUM",
        order: 9,
      },
      {
        title: "Implement password reset flow",
        description:
          "Create PasswordResetToken model (or use VerificationToken). Forgot password page sends email with token link. Reset page validates token and updates password. Token expires in 1 hour.",
        taskId: task1_3.id,
        priority: "MEDIUM",
        order: 10,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Register with valid patient data",
        description:
          "POST /api/auth/register with {name, email, password, role: PATIENT}. Expect 201, user + patient record in DB.",
        taskId: task1_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'register valid patient'",
        expectedResult: "201 response, user and patient rows created.",
        priority: "HIGH",
        order: 11,
      },
      {
        title: "Test: Register with duplicate email",
        description: "POST /api/auth/register with existing email. Expect 409.",
        taskId: task1_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'register duplicate'",
        expectedResult: "409 conflict response.",
        priority: "HIGH",
        order: 12,
      },
      {
        title: "Test: Login with valid credentials",
        description:
          "Sign in via NextAuth credentials with correct email/password. Expect session with role.",
        taskId: task1_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'login valid'",
        expectedResult: "Session contains user with correct role.",
        priority: "HIGH",
        order: 13,
      },
      {
        title: "Test: Login with wrong password",
        description: "Sign in with wrong password. Expect auth error.",
        taskId: task1_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'login wrong password'",
        expectedResult: "Authentication fails with error message.",
        priority: "HIGH",
        order: 14,
      },
      {
        title: "Test: Protected route redirects unauthenticated user",
        description: "Access /patient/dashboard without session. Expect redirect to /login.",
        taskId: task1_3.id,
        testType: "E2E",
        testCommand: "npm test -- --grep 'protected route redirect'",
        expectedResult: "302 redirect to /login.",
        priority: "HIGH",
        order: 15,
      },
      {
        title: "Test: Role-based route restriction",
        description:
          "Patient accessing /admin/dashboard. Expect redirect to /patient/dashboard.",
        taskId: task1_3.id,
        testType: "E2E",
        testCommand: "npm test -- --grep 'role restriction'",
        expectedResult: "Redirect to correct dashboard for user role.",
        priority: "MEDIUM",
        order: 16,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 2: Doctor Discovery & Profiles
  // ════════════════════════════════════════════════════════════
  const phase2 = await prisma.phase.create({
    data: {
      title: "Doctor Discovery & Profiles",
      description:
        "Build doctor search, filtering, and profile pages for patients to discover and evaluate doctors.",
      priority: "HIGH",
      order: 2,
      tags: ["search", "doctors", "profiles"],
    },
  });

  // Task 2.1
  const task2_1 = await prisma.task.create({
    data: {
      title: "Doctor Search & Filtering API",
      description:
        "Server-side search with filters for specialty, location, availability, rating, price. Pagination and sorting.",
      phaseId: phase2.id,
      priority: "HIGH",
      order: 1,
      tags: ["search", "api", "filtering"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/doctors/search endpoint",
        description:
          "Accept query params: q (name/specialty text search), specialty, city, minRating, maxFee, sortBy (rating/fee/experience), sortOrder (asc/desc), page, limit. Build dynamic Prisma where clause. Return paginated results with totalCount, hasMore.",
        taskId: task2_1.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create GET /api/specialties endpoint",
        description:
          "Return distinct specialty list from Doctor table. Use Prisma groupBy or findMany with distinct. Consider caching with Next.js revalidate.",
        taskId: task2_1.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Add computed average rating to doctor queries",
        description:
          "Calculate avg rating from Review table where isApproved=true. Include reviewCount. Use Prisma aggregate or raw SQL for performance.",
        taskId: task2_1.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Search returns doctors by specialty",
        description:
          "GET /api/doctors/search?specialty=Cardiologist. Expect only cardiologists.",
        taskId: task2_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'search by specialty'",
        expectedResult: "All returned doctors have specialty=Cardiologist.",
        priority: "HIGH",
        order: 4,
      },
      {
        title: "Test: Search with multiple filters",
        description:
          "GET /api/doctors/search?specialty=Dentist&city=Mumbai&maxFee=500. Expect matching results.",
        taskId: task2_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'search multiple filters'",
        expectedResult: "Results match all filter criteria.",
        priority: "HIGH",
        order: 5,
      },
      {
        title: "Test: Search pagination",
        description:
          "Seed 25 doctors. GET page=1&limit=10, then page=2&limit=10. Verify correct subsets and totalCount.",
        taskId: task2_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'search pagination'",
        expectedResult: "Correct page sizes and total count.",
        priority: "MEDIUM",
        order: 6,
      },
      {
        title: "Test: Search with no results",
        description:
          "GET /api/doctors/search?specialty=NonExistent. Expect empty array and totalCount=0.",
        taskId: task2_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'search no results'",
        expectedResult: "Empty results array, totalCount 0.",
        priority: "MEDIUM",
        order: 7,
      },
    ],
  });

  // Task 2.2
  const task2_2 = await prisma.task.create({
    data: {
      title: "Doctor Search Page UI",
      description:
        "Build the search page with search bar, filter sidebar, doctor cards grid, and pagination.",
      phaseId: phase2.id,
      priority: "HIGH",
      order: 2,
      tags: ["ui", "search", "components"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Build search page layout",
        description:
          "src/app/(patient)/search/page.tsx — Two-column layout: filter sidebar (left) + results grid (right). Mobile: filters in Sheet component. Server component fetching initial results.",
        taskId: task2_2.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create SearchFilters component",
        description:
          "Client component with: specialty Select dropdown, city Input, rating slider/select (1-5), max fee Input, sort Select (rating/fee/experience). onChange updates URL search params.",
        taskId: task2_2.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Create DoctorCard component",
        description:
          "Card showing: doctor avatar/initials, name, specialty badge, experience years, star rating + review count, consultation fee, city. Link to /doctors/[id].",
        taskId: task2_2.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Implement URL-based filter state",
        description:
          "Use useSearchParams and router.push to sync filters with URL. Makes search shareable and bookmarkable. Debounce text inputs.",
        taskId: task2_2.id,
        priority: "MEDIUM",
        order: 4,
      },
      {
        title: "Add pagination component",
        description:
          "Previous/Next buttons with page numbers. Use URL params for page state. Show 'Showing X-Y of Z results'.",
        taskId: task2_2.id,
        priority: "MEDIUM",
        order: 5,
      },
      {
        title: "Add loading skeleton for search results",
        description:
          "Create loading.tsx with skeleton cards while search results load. Use shadcn Skeleton component.",
        taskId: task2_2.id,
        priority: "LOW",
        order: 6,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Search page renders with results",
        description: "Navigate to /search. Verify doctor cards render.",
        taskId: task2_2.id,
        testType: "E2E",
        testCommand: "npm test -- --grep 'search page renders'",
        expectedResult: "Doctor cards visible on page.",
        priority: "HIGH",
        order: 7,
      },
      {
        title: "Test: Filters update URL params",
        description:
          "Select specialty filter. Verify URL updates with ?specialty=X.",
        taskId: task2_2.id,
        testType: "E2E",
        testCommand: "npm test -- --grep 'filters update url'",
        expectedResult: "URL search params reflect selected filters.",
        priority: "MEDIUM",
        order: 8,
      },
    ],
  });

  // Task 2.3
  const task2_3 = await prisma.task.create({
    data: {
      title: "Doctor Profile Page",
      description:
        "Detailed doctor profile with qualifications, reviews, availability preview, and booking CTA.",
      phaseId: phase2.id,
      priority: "HIGH",
      order: 3,
      tags: ["profile", "ui", "api"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/doctors/[id] endpoint",
        description:
          "Return full doctor details with: user info, avg rating, review count, schedule, next 7 days availability summary. Use Prisma include for relations.",
        taskId: task2_3.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Build doctor profile page",
        description:
          "src/app/(patient)/doctors/[id]/page.tsx — Header (name, specialty, rating), About section, Qualifications list, Experience, Fee, Address, Availability preview (next 7 days), Reviews section, 'Book Appointment' button.",
        taskId: task2_3.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Create AvailabilityPreview component",
        description:
          "Show next 7 days as cards. Each shows day name, date, and available slot count. Clicking navigates to booking with date pre-selected.",
        taskId: task2_3.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Create ReviewsList component",
        description:
          "Display avg rating with star breakdown bar chart. List reviews: masked patient name, star rating, comment, date. Paginated load-more.",
        taskId: task2_3.id,
        priority: "MEDIUM",
        order: 4,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Doctor profile returns correct data",
        description: "GET /api/doctors/[validId]. Expect full doctor details.",
        taskId: task2_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'doctor profile data'",
        expectedResult: "Response includes doctor info, rating, schedule.",
        priority: "HIGH",
        order: 5,
      },
      {
        title: "Test: Doctor profile 404 for invalid ID",
        description: "GET /api/doctors/nonexistent. Expect 404.",
        taskId: task2_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'doctor 404'",
        expectedResult: "404 response.",
        priority: "MEDIUM",
        order: 6,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 3: Appointment Booking System
  // ════════════════════════════════════════════════════════════
  const phase3 = await prisma.phase.create({
    data: {
      title: "Appointment Booking System",
      description:
        "Core booking flow: slot availability, booking, rescheduling, cancellation, family member booking, and waitlist.",
      priority: "CRITICAL",
      order: 3,
      tags: ["booking", "appointments", "core"],
    },
  });

  // Task 3.1
  const task3_1 = await prisma.task.create({
    data: {
      title: "Slot Availability Engine",
      description:
        "Calculate available time slots from doctor schedule minus existing appointments and blocked slots.",
      phaseId: phase3.id,
      priority: "CRITICAL",
      order: 1,
      tags: ["availability", "slots", "engine"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create availability calculation utility",
        description:
          "src/lib/availability.ts — Function: getAvailableSlots(doctorId, date). 1) Get doctor schedule for that dayOfWeek. 2) Generate all slots based on slotDuration. 3) Remove slots with existing PENDING/CONFIRMED appointments. 4) Remove blocked slots. Return array of {startTime, endTime, isAvailable}.",
        taskId: task3_1.id,
        priority: "CRITICAL",
        order: 1,
      },
      {
        title: "Create GET /api/doctors/[id]/availability endpoint",
        description:
          "Accept query: date (required). Return available slots for that doctor on that date. Use the availability utility.",
        taskId: task3_1.id,
        priority: "CRITICAL",
        order: 2,
      },
      {
        title: "Create GET /api/doctors/[id]/availability/week endpoint",
        description:
          "Return 7-day availability summary: [{date, dayName, totalSlots, availableSlots}]. Used by AvailabilityPreview component.",
        taskId: task3_1.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Handle edge cases in availability",
        description:
          "Past times today (don't show slots before current time), doctor inactive, no schedule for that day, holidays. Return empty array with reason message.",
        taskId: task3_1.id,
        priority: "HIGH",
        order: 4,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Available slots calculation",
        description:
          "Doctor with 9am-5pm schedule, 30min slots, 2 existing appointments. Verify correct available slots returned.",
        taskId: task3_1.id,
        testType: "UNIT",
        testCommand: "npm test -- --grep 'available slots calculation'",
        expectedResult: "Returns 14 total slots minus 2 booked = 12 available.",
        priority: "CRITICAL",
        order: 5,
      },
      {
        title: "Test: No slots on blocked day",
        description:
          "Doctor has full-day blocked slot. Expect 0 available slots.",
        taskId: task3_1.id,
        testType: "UNIT",
        testCommand: "npm test -- --grep 'blocked day'",
        expectedResult: "Empty array returned.",
        priority: "HIGH",
        order: 6,
      },
      {
        title: "Test: No schedule for day of week",
        description:
          "Query availability for Sunday when doctor has no Sunday schedule. Expect empty.",
        taskId: task3_1.id,
        testType: "UNIT",
        testCommand: "npm test -- --grep 'no schedule day'",
        expectedResult: "Empty array, doctor not available.",
        priority: "HIGH",
        order: 7,
      },
    ],
  });

  // Task 3.2
  const task3_2 = await prisma.task.create({
    data: {
      title: "Appointment Booking Flow",
      description:
        "Complete booking flow: select date, pick slot, confirm booking, handle conflicts.",
      phaseId: phase3.id,
      priority: "CRITICAL",
      order: 2,
      tags: ["booking", "flow", "api"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create POST /api/appointments endpoint",
        description:
          "Body: {doctorId, date, startTime, endTime, reason, bookingType, familyMemberId?}. Validate: slot is available (re-check to prevent race conditions), patient exists, doctor exists and is active. Create appointment with status PENDING. Return 201.",
        taskId: task3_2.id,
        priority: "CRITICAL",
        order: 1,
      },
      {
        title: "Build booking page UI",
        description:
          "src/app/(patient)/doctors/[id]/book/page.tsx — Step 1: Calendar date picker. Step 2: Available time slots grid (clickable). Step 3: Booking form (reason, self/family member selector). Step 4: Confirmation summary + confirm button.",
        taskId: task3_2.id,
        priority: "CRITICAL",
        order: 2,
      },
      {
        title: "Create TimeSlotPicker component",
        description:
          "Grid of time slot buttons. Available slots are clickable (primary style), booked slots are disabled (gray). Selected slot highlighted. Fetches slots when date changes.",
        taskId: task3_2.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Create BookingConfirmation component",
        description:
          "Summary card: doctor name, date, time, reason, patient/family member name. Confirm and Cancel buttons. On confirm, POST to API, show success toast, redirect to appointments list.",
        taskId: task3_2.id,
        priority: "HIGH",
        order: 4,
      },
      {
        title: "Handle double-booking prevention",
        description:
          "In POST /api/appointments: use Prisma transaction to check availability and create appointment atomically. Return 409 if slot was just taken.",
        taskId: task3_2.id,
        priority: "CRITICAL",
        order: 5,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Book appointment successfully",
        description:
          "POST /api/appointments with valid data. Expect 201 and appointment in DB with PENDING status.",
        taskId: task3_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'book appointment success'",
        expectedResult: "201 response, appointment created.",
        priority: "CRITICAL",
        order: 6,
      },
      {
        title: "Test: Double booking prevention",
        description:
          "Two concurrent POST requests for same slot. Expect one 201 and one 409.",
        taskId: task3_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'double booking'",
        expectedResult: "Only one appointment created.",
        priority: "CRITICAL",
        order: 7,
      },
      {
        title: "Test: Book for family member",
        description:
          "POST with bookingType=FAMILY_MEMBER and familyMemberId. Expect appointment linked to family member.",
        taskId: task3_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'book family member'",
        expectedResult: "Appointment created with familyMemberId set.",
        priority: "MEDIUM",
        order: 8,
      },
    ],
  });

  // Task 3.3
  const task3_3 = await prisma.task.create({
    data: {
      title: "Reschedule & Cancel Appointments",
      description:
        "Allow patients and doctors to reschedule or cancel appointments with proper status management.",
      phaseId: phase3.id,
      priority: "HIGH",
      order: 3,
      tags: ["reschedule", "cancel", "api"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create PATCH /api/appointments/[id]/reschedule endpoint",
        description:
          "Body: {date, startTime, endTime}. Validate: appointment exists, belongs to patient, is PENDING/CONFIRMED, new slot is available. Update date/time. Only allow reschedule 24h before original appointment.",
        taskId: task3_3.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create PATCH /api/appointments/[id]/cancel endpoint",
        description:
          "Set status to CANCELLED. Validate: appointment belongs to user (patient or doctor), is PENDING/CONFIRMED. Only allow cancel 2h before appointment. Create notification for other party.",
        taskId: task3_3.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Create PATCH /api/appointments/[id]/status endpoint (doctor)",
        description:
          "Doctor can change status to CONFIRMED, COMPLETED, NO_SHOW. Validate doctor owns the appointment.",
        taskId: task3_3.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Build reschedule dialog UI",
        description:
          "Dialog with new date picker and time slot picker. Pre-populated with current appointment details. Confirm reschedule button.",
        taskId: task3_3.id,
        priority: "MEDIUM",
        order: 4,
      },
      {
        title: "Build cancel confirmation dialog",
        description:
          "Confirmation dialog with reason textarea (optional). Show cancellation policy. Confirm cancel button.",
        taskId: task3_3.id,
        priority: "MEDIUM",
        order: 5,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Reschedule to available slot",
        description:
          "PATCH /api/appointments/[id]/reschedule with new date/time. Expect 200 and updated appointment.",
        taskId: task3_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'reschedule success'",
        expectedResult: "Appointment date/time updated.",
        priority: "HIGH",
        order: 6,
      },
      {
        title: "Test: Cancel appointment",
        description:
          "PATCH /api/appointments/[id]/cancel. Expect status=CANCELLED.",
        taskId: task3_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'cancel appointment'",
        expectedResult: "Appointment status set to CANCELLED.",
        priority: "HIGH",
        order: 7,
      },
      {
        title: "Test: Cannot cancel within 2 hours",
        description:
          "Try cancelling appointment starting in 1 hour. Expect 400 error.",
        taskId: task3_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'cancel too late'",
        expectedResult: "400 response with policy violation message.",
        priority: "MEDIUM",
        order: 8,
      },
    ],
  });

  // Task 3.4
  const task3_4 = await prisma.task.create({
    data: {
      title: "Waitlist System",
      description:
        "Allow patients to join waitlist for fully booked doctors/dates and get notified when slots open.",
      phaseId: phase3.id,
      priority: "LOW",
      order: 4,
      tags: ["waitlist", "notifications"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create POST /api/waitlist endpoint",
        description:
          "Body: {doctorId, preferredDate, preferredTimeStart, preferredTimeEnd}. Create waitlist entry with WAITING status.",
        taskId: task3_4.id,
        priority: "LOW",
        order: 1,
      },
      {
        title: "Create waitlist notification trigger",
        description:
          "When an appointment is cancelled, check waitlist for matching doctor+date. Notify top waitlisted patient. Update waitlist status to NOTIFIED.",
        taskId: task3_4.id,
        priority: "LOW",
        order: 2,
      },
      {
        title: "Build waitlist UI on booking page",
        description:
          "When no slots available, show 'Join Waitlist' button with preferred time range picker.",
        taskId: task3_4.id,
        priority: "LOW",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Join waitlist",
        description: "POST /api/waitlist with valid data. Expect 201.",
        taskId: task3_4.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'join waitlist'",
        expectedResult: "Waitlist entry created with WAITING status.",
        priority: "LOW",
        order: 4,
      },
      {
        title: "Test: Waitlist notification on cancellation",
        description:
          "Cancel appointment, verify waitlisted patient gets notification.",
        taskId: task3_4.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'waitlist notification'",
        expectedResult: "Notification created for waitlisted patient.",
        priority: "LOW",
        order: 5,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 4: Doctor Panel
  // ════════════════════════════════════════════════════════════
  const phase4 = await prisma.phase.create({
    data: {
      title: "Doctor Panel",
      description:
        "Doctor dashboard with schedule management, patient queue, prescription builder, and appointment management.",
      priority: "HIGH",
      order: 4,
      tags: ["doctor", "dashboard", "management"],
    },
  });

  // Task 4.1
  const task4_1 = await prisma.task.create({
    data: {
      title: "Doctor Dashboard",
      description:
        "Overview dashboard with today's appointments, stats, and quick actions.",
      phaseId: phase4.id,
      priority: "HIGH",
      order: 1,
      tags: ["dashboard", "overview"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Build doctor dashboard page",
        description:
          "src/app/(doctor)/dashboard/page.tsx — Stats cards (today's appointments, total patients, avg rating, pending reviews). Today's appointment list. Quick action buttons (manage schedule, view patients).",
        taskId: task4_1.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create GET /api/doctor/dashboard/stats endpoint",
        description:
          "Return: todayAppointmentCount, totalPatients, avgRating, pendingAppointments, completedThisMonth. Filter by logged-in doctor.",
        taskId: task4_1.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Create today's appointments component",
        description:
          "List of today's appointments with patient name, time, status, reason. Action buttons: confirm, mark complete, mark no-show.",
        taskId: task4_1.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Doctor dashboard stats",
        description:
          "GET /api/doctor/dashboard/stats. Expect correct counts.",
        taskId: task4_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'doctor dashboard stats'",
        expectedResult: "Stats match seeded data.",
        priority: "HIGH",
        order: 4,
      },
    ],
  });

  // Task 4.2
  const task4_2 = await prisma.task.create({
    data: {
      title: "Schedule Management",
      description:
        "Doctors set their weekly availability, slot duration, and block off specific dates/times.",
      phaseId: phase4.id,
      priority: "HIGH",
      order: 2,
      tags: ["schedule", "availability"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create schedule CRUD API",
        description:
          "POST /api/doctor/schedule — Create schedule entry (dayOfWeek, startTime, endTime, slotDuration). PUT /api/doctor/schedule/[id] — Update. DELETE /api/doctor/schedule/[id] — Remove. GET /api/doctor/schedule — List all.",
        taskId: task4_2.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create blocked slots CRUD API",
        description:
          "POST /api/doctor/blocked-slots — Block date/time range. DELETE /api/doctor/blocked-slots/[id] — Unblock. GET /api/doctor/blocked-slots — List all.",
        taskId: task4_2.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Build schedule management page",
        description:
          "src/app/(doctor)/schedule/page.tsx — Weekly view table (Mon-Sun rows). Each row: toggle active, set start/end time, slot duration dropdown. Save all button. Separate tab for blocked dates with calendar picker.",
        taskId: task4_2.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Create schedule entry",
        description:
          "POST /api/doctor/schedule with valid data. Expect 201.",
        taskId: task4_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'create schedule'",
        expectedResult: "Schedule entry created.",
        priority: "HIGH",
        order: 4,
      },
      {
        title: "Test: Block a date",
        description:
          "POST /api/doctor/blocked-slots. Verify that date shows no availability.",
        taskId: task4_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'block date'",
        expectedResult: "Blocked slot created, availability returns empty.",
        priority: "MEDIUM",
        order: 5,
      },
    ],
  });

  // Task 4.3
  const task4_3 = await prisma.task.create({
    data: {
      title: "Patient Queue & Appointment Management",
      description:
        "View and manage all appointments — upcoming, past, filter by status.",
      phaseId: phase4.id,
      priority: "HIGH",
      order: 3,
      tags: ["appointments", "queue", "management"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/doctor/appointments endpoint",
        description:
          "Query params: status, date, page, limit. Return appointments with patient details. Sorted by date/time.",
        taskId: task4_3.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Build appointments list page",
        description:
          "src/app/(doctor)/appointments/page.tsx — Tabs: Upcoming, Past, Cancelled. Table with patient name, date, time, status, reason, actions (confirm/complete/no-show/view).",
        taskId: task4_3.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Build appointment detail view",
        description:
          "Dialog or page showing full appointment details, patient info, medical history, previous visits. Actions: update status, add medical record, write prescription.",
        taskId: task4_3.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Doctor views their appointments",
        description:
          "GET /api/doctor/appointments. Expect only the logged-in doctor's appointments.",
        taskId: task4_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'doctor appointments list'",
        expectedResult: "Only own appointments returned.",
        priority: "HIGH",
        order: 4,
      },
    ],
  });

  // Task 4.4
  const task4_4 = await prisma.task.create({
    data: {
      title: "Prescription & Medical Records",
      description:
        "Doctor creates medical records and prescriptions after appointments. Generate PDF on-the-fly.",
      phaseId: phase4.id,
      priority: "HIGH",
      order: 4,
      tags: ["prescription", "medical-records", "pdf"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create POST /api/doctor/medical-records endpoint",
        description:
          "Body: {appointmentId, diagnosis, symptoms, notes}. Validate doctor owns the appointment, appointment is COMPLETED. Create MedicalRecord.",
        taskId: task4_4.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create POST /api/doctor/prescriptions endpoint",
        description:
          "Body: {medicalRecordId, medications: [{name, dosage, frequency, duration}], instructions}. Create Prescription linked to MedicalRecord.",
        taskId: task4_4.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Build prescription builder UI",
        description:
          "Form with dynamic medication rows (add/remove). Each row: medicine name, dosage, frequency dropdown, duration. Instructions textarea. Preview before save.",
        taskId: task4_4.id,
        priority: "HIGH",
        order: 3,
      },
      {
        title: "Create GET /api/prescriptions/[id]/pdf endpoint",
        description:
          "Generate PDF on-the-fly using a library like @react-pdf/renderer or jspdf. Include doctor info, patient info, date, medications table, instructions. Return as PDF stream.",
        taskId: task4_4.id,
        priority: "MEDIUM",
        order: 4,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Create medical record",
        description:
          "POST /api/doctor/medical-records for completed appointment. Expect 201.",
        taskId: task4_4.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'create medical record'",
        expectedResult: "Medical record created and linked to appointment.",
        priority: "HIGH",
        order: 5,
      },
      {
        title: "Test: Create prescription",
        description:
          "POST /api/doctor/prescriptions with medications array. Expect 201.",
        taskId: task4_4.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'create prescription'",
        expectedResult: "Prescription created with medications JSON.",
        priority: "HIGH",
        order: 6,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 5: Patient Dashboard
  // ════════════════════════════════════════════════════════════
  const phase5 = await prisma.phase.create({
    data: {
      title: "Patient Dashboard",
      description:
        "Patient dashboard with appointments, medical records, family members, and profile settings.",
      priority: "HIGH",
      order: 5,
      tags: ["patient", "dashboard"],
    },
  });

  // Task 5.1
  const task5_1 = await prisma.task.create({
    data: {
      title: "Patient Dashboard Overview",
      description:
        "Dashboard with upcoming appointments, quick stats, and navigation to key features.",
      phaseId: phase5.id,
      priority: "HIGH",
      order: 1,
      tags: ["dashboard", "overview"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Build patient dashboard page",
        description:
          "src/app/(patient)/dashboard/page.tsx — Upcoming appointments (next 3), quick stats (total visits, active appointments), recent prescriptions, quick actions (find doctor, view records).",
        taskId: task5_1.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create GET /api/patient/dashboard endpoint",
        description:
          "Return: upcomingAppointments (next 3), totalVisits, activePrescriptions, recentNotifications.",
        taskId: task5_1.id,
        priority: "HIGH",
        order: 2,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Patient dashboard loads",
        description:
          "GET /api/patient/dashboard as authenticated patient. Expect correct data.",
        taskId: task5_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'patient dashboard'",
        expectedResult: "Dashboard data returned for logged-in patient.",
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  // Task 5.2
  const task5_2 = await prisma.task.create({
    data: {
      title: "Appointment History & Management",
      description: "Patient views and manages their appointments.",
      phaseId: phase5.id,
      priority: "HIGH",
      order: 2,
      tags: ["appointments", "history"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/patient/appointments endpoint",
        description:
          "Query params: status, page, limit. Return patient's appointments with doctor details. Sorted by date desc.",
        taskId: task5_2.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Build appointments page",
        description:
          "src/app/(patient)/appointments/page.tsx — Tabs: Upcoming, Past, Cancelled. Each appointment card: doctor name, specialty, date, time, status, actions (reschedule, cancel, leave review).",
        taskId: task5_2.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Build appointment detail page",
        description:
          "src/app/(patient)/appointments/[id]/page.tsx — Full details, doctor info, medical record (if completed), prescription (with PDF download), review form (if completed and not reviewed).",
        taskId: task5_2.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Patient views own appointments",
        description:
          "GET /api/patient/appointments. Expect only own appointments.",
        taskId: task5_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'patient appointments'",
        expectedResult: "Only patient's own appointments returned.",
        priority: "HIGH",
        order: 4,
      },
    ],
  });

  // Task 5.3
  const task5_3 = await prisma.task.create({
    data: {
      title: "Medical Records & Prescriptions View",
      description: "Patient views their medical history and prescriptions.",
      phaseId: phase5.id,
      priority: "HIGH",
      order: 3,
      tags: ["records", "prescriptions"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/patient/medical-records endpoint",
        description:
          "Return all medical records for patient with doctor info, diagnosis, prescriptions. Paginated, sorted by date desc.",
        taskId: task5_3.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Build medical records page",
        description:
          "src/app/(patient)/records/page.tsx — List of medical records as cards. Each: date, doctor, diagnosis summary. Click to expand: full details, symptoms, notes, prescription with PDF download.",
        taskId: task5_3.id,
        priority: "HIGH",
        order: 2,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Patient views medical records",
        description:
          "GET /api/patient/medical-records. Expect own records with prescriptions.",
        taskId: task5_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'patient medical records'",
        expectedResult: "Records returned with related prescriptions.",
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  // Task 5.4
  const task5_4 = await prisma.task.create({
    data: {
      title: "Family Members Management",
      description:
        "Patient manages family members and books appointments for them.",
      phaseId: phase5.id,
      priority: "MEDIUM",
      order: 4,
      tags: ["family", "dependents"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create family members CRUD API",
        description:
          "POST /api/patient/family-members — Add. GET — List all. PUT /api/patient/family-members/[id] — Update. DELETE — Remove.",
        taskId: task5_4.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Build family members page",
        description:
          "src/app/(patient)/family/page.tsx — List family members as cards. Add member dialog with form (name, relation, DOB, gender, blood group, allergies). Edit/delete actions.",
        taskId: task5_4.id,
        priority: "MEDIUM",
        order: 2,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Add family member",
        description: "POST /api/patient/family-members. Expect 201.",
        taskId: task5_4.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'add family member'",
        expectedResult: "Family member created linked to patient.",
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  // Task 5.5
  const task5_5 = await prisma.task.create({
    data: {
      title: "Profile Settings",
      description:
        "Patient and Doctor can update their profile information.",
      phaseId: phase5.id,
      priority: "MEDIUM",
      order: 5,
      tags: ["profile", "settings"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create PUT /api/profile endpoint",
        description:
          "Update user profile (name, phone, address) and role-specific fields (patient: DOB, bloodGroup, allergies; doctor: specialty, bio, qualifications, fee).",
        taskId: task5_5.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Build settings page",
        description:
          "src/app/(patient)/settings/page.tsx and src/app/(doctor)/settings/page.tsx — Tabs: Personal Info, Medical Info (patient) or Professional Info (doctor), Change Password. Form with pre-filled data. Save button.",
        taskId: task5_5.id,
        priority: "MEDIUM",
        order: 2,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Update profile",
        description: "PUT /api/profile with updated name. Expect 200 and DB updated.",
        taskId: task5_5.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'update profile'",
        expectedResult: "Profile updated in database.",
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 6: Admin Panel
  // ════════════════════════════════════════════════════════════
  const phase6 = await prisma.phase.create({
    data: {
      title: "Admin Panel",
      description:
        "Admin dashboard for doctor onboarding, verification, analytics, review moderation, and content management.",
      priority: "HIGH",
      order: 6,
      tags: ["admin", "dashboard", "management"],
    },
  });

  // Task 6.1
  const task6_1 = await prisma.task.create({
    data: {
      title: "Admin Dashboard & Analytics",
      description:
        "Overview with key metrics: total users, appointments, revenue, growth charts.",
      phaseId: phase6.id,
      priority: "HIGH",
      order: 1,
      tags: ["analytics", "dashboard"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Build admin dashboard page",
        description:
          "src/app/(admin)/dashboard/page.tsx — Stats cards: total patients, total doctors, total appointments (this month), pending verifications. Line chart: appointments over time. Bar chart: top specialties.",
        taskId: task6_1.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create GET /api/admin/stats endpoint",
        description:
          "Return: totalPatients, totalDoctors, totalAppointments, appointmentsByMonth (last 12), topSpecialties (top 5), pendingDoctorVerifications, pendingReviews.",
        taskId: task6_1.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Add charts library",
        description:
          "Install recharts. Create reusable chart components for line and bar charts.",
        taskId: task6_1.id,
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Admin stats endpoint",
        description:
          "GET /api/admin/stats as admin. Expect correct aggregate counts.",
        taskId: task6_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'admin stats'",
        expectedResult: "Stats match database counts.",
        priority: "HIGH",
        order: 4,
      },
      {
        title: "Test: Non-admin cannot access admin stats",
        description:
          "GET /api/admin/stats as patient. Expect 403.",
        taskId: task6_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'admin stats forbidden'",
        expectedResult: "403 Forbidden.",
        priority: "HIGH",
        order: 5,
      },
    ],
  });

  // Task 6.2
  const task6_2 = await prisma.task.create({
    data: {
      title: "Doctor Onboarding & Verification",
      description:
        "Admin reviews and approves/rejects doctor registrations.",
      phaseId: phase6.id,
      priority: "HIGH",
      order: 2,
      tags: ["verification", "onboarding"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/admin/doctors endpoint",
        description:
          "Query params: verified (true/false/all), page, limit, search. Return doctors with user info and verification status.",
        taskId: task6_2.id,
        priority: "HIGH",
        order: 1,
      },
      {
        title: "Create PATCH /api/admin/doctors/[id]/verify endpoint",
        description:
          "Body: {isVerified: true/false}. Set doctor isVerified. Send notification/email to doctor.",
        taskId: task6_2.id,
        priority: "HIGH",
        order: 2,
      },
      {
        title: "Build doctor management page",
        description:
          "src/app/(admin)/doctors/page.tsx — Table: name, email, specialty, registered date, verified status, actions. Filter tabs: All, Pending, Verified, Rejected. Click row → detail view with verify/reject buttons.",
        taskId: task6_2.id,
        priority: "HIGH",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Admin verifies doctor",
        description:
          "PATCH /api/admin/doctors/[id]/verify. Expect doctor isVerified=true.",
        taskId: task6_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'verify doctor'",
        expectedResult: "Doctor verified in database.",
        priority: "HIGH",
        order: 4,
      },
    ],
  });

  // Task 6.3
  const task6_3 = await prisma.task.create({
    data: {
      title: "Review Moderation",
      description: "Admin approves or rejects patient reviews.",
      phaseId: phase6.id,
      priority: "MEDIUM",
      order: 3,
      tags: ["reviews", "moderation"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create GET /api/admin/reviews endpoint",
        description:
          "Query params: approved (true/false/all), page, limit. Return reviews with patient and doctor info.",
        taskId: task6_3.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Create PATCH /api/admin/reviews/[id] endpoint",
        description:
          "Body: {isApproved: true/false}. Approve or reject review.",
        taskId: task6_3.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Build review moderation page",
        description:
          "src/app/(admin)/reviews/page.tsx — Table: patient, doctor, rating, comment preview, status. Approve/reject buttons. Click → full review dialog.",
        taskId: task6_3.id,
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Admin approves review",
        description:
          "PATCH /api/admin/reviews/[id] with isApproved=true. Verify review visible in doctor profile.",
        taskId: task6_3.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'approve review'",
        expectedResult: "Review isApproved set to true.",
        priority: "MEDIUM",
        order: 4,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 7: Notifications & Reminders
  // ════════════════════════════════════════════════════════════
  const phase7 = await prisma.phase.create({
    data: {
      title: "Notifications & Reminders",
      description:
        "In-app notifications stored in DB, email reminders for appointments, and notification preferences.",
      priority: "MEDIUM",
      order: 7,
      tags: ["notifications", "email", "reminders"],
    },
  });

  // Task 7.1
  const task7_1 = await prisma.task.create({
    data: {
      title: "In-App Notification System",
      description:
        "Create, store, and display notifications in the app. Polling or SSE for real-time updates.",
      phaseId: phase7.id,
      priority: "MEDIUM",
      order: 1,
      tags: ["notifications", "realtime"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create notification utility",
        description:
          "src/lib/notifications.ts — createNotification(userId, title, message, type, metadata?). Used by other modules to create notifications.",
        taskId: task7_1.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Create notification API routes",
        description:
          "GET /api/notifications — List user's notifications (paginated, unread first). PATCH /api/notifications/[id]/read — Mark as read. PATCH /api/notifications/read-all — Mark all as read. GET /api/notifications/unread-count — Return count.",
        taskId: task7_1.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Build NotificationBell component",
        description:
          "Header component: bell icon with unread count badge. Dropdown showing recent notifications. Click notification → navigate to relevant page. Mark as read on click. Poll every 30s for unread count.",
        taskId: task7_1.id,
        priority: "MEDIUM",
        order: 3,
      },
      {
        title: "Build notifications page",
        description:
          "src/app/(patient|doctor)/notifications/page.tsx — Full list of notifications. Filter: All, Unread. Mark all read button. Each notification: icon by type, title, message, timestamp, read/unread indicator.",
        taskId: task7_1.id,
        priority: "MEDIUM",
        order: 4,
      },
      {
        title: "Add notification triggers to existing flows",
        description:
          "Trigger notifications on: appointment booked (doctor), appointment confirmed (patient), appointment cancelled (both), appointment reminder (24h before), review received (doctor), doctor verified (doctor).",
        taskId: task7_1.id,
        priority: "MEDIUM",
        order: 5,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Notification created on booking",
        description:
          "Book appointment. Verify notification created for doctor.",
        taskId: task7_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'notification on booking'",
        expectedResult: "Notification exists for doctor with correct type.",
        priority: "MEDIUM",
        order: 6,
      },
      {
        title: "Test: Mark notification as read",
        description:
          "PATCH /api/notifications/[id]/read. Expect isRead=true.",
        taskId: task7_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'mark notification read'",
        expectedResult: "Notification isRead updated.",
        priority: "MEDIUM",
        order: 7,
      },
    ],
  });

  // Task 7.2
  const task7_2 = await prisma.task.create({
    data: {
      title: "Email Reminders",
      description:
        "Send email reminders for upcoming appointments using Resend or Nodemailer.",
      phaseId: phase7.id,
      priority: "MEDIUM",
      order: 2,
      tags: ["email", "reminders", "cron"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create email utility",
        description:
          "src/lib/email.ts — sendEmail(to, subject, html). Configure with SMTP env vars. Support Resend or Nodemailer based on config.",
        taskId: task7_2.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Create email templates",
        description:
          "Templates: appointment-confirmation, appointment-reminder (24h), appointment-cancelled, welcome, password-reset. HTML templates with dynamic data injection.",
        taskId: task7_2.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Create reminder cron/API route",
        description:
          "GET /api/cron/reminders (protected by secret key). Query appointments in next 24h that haven't been reminded. Send email to patient. Mark as reminded (add remindedAt field or use notifications). Deploy as Vercel Cron.",
        taskId: task7_2.id,
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Email utility sends email",
        description:
          "Call sendEmail with test data. Verify email sent (mock SMTP in test).",
        taskId: task7_2.id,
        testType: "UNIT",
        testCommand: "npm test -- --grep 'send email'",
        expectedResult: "Email sent successfully (mocked).",
        priority: "MEDIUM",
        order: 4,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 8: Ratings & Reviews
  // ════════════════════════════════════════════════════════════
  const phase8 = await prisma.phase.create({
    data: {
      title: "Ratings & Reviews",
      description:
        "Post-visit rating and review system with admin moderation.",
      priority: "MEDIUM",
      order: 8,
      tags: ["ratings", "reviews"],
    },
  });

  // Task 8.1
  const task8_1 = await prisma.task.create({
    data: {
      title: "Review Submission Flow",
      description:
        "Patients submit ratings and reviews after completed appointments.",
      phaseId: phase8.id,
      priority: "MEDIUM",
      order: 1,
      tags: ["reviews", "submission"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create POST /api/reviews endpoint",
        description:
          "Body: {appointmentId, rating (1-5), comment}. Validate: appointment belongs to patient, status is COMPLETED, no existing review for this appointment. Create review with isApproved=false.",
        taskId: task8_1.id,
        priority: "MEDIUM",
        order: 1,
      },
      {
        title: "Build review form component",
        description:
          "Star rating selector (clickable stars), comment textarea, submit button. Show on appointment detail page when appointment is completed and no review exists.",
        taskId: task8_1.id,
        priority: "MEDIUM",
        order: 2,
      },
      {
        title: "Create GET /api/doctors/[id]/reviews endpoint",
        description:
          "Return approved reviews for a doctor. Paginated. Include patient first name (masked last name). Average rating and rating distribution (5-star count, 4-star count, etc.).",
        taskId: task8_1.id,
        priority: "MEDIUM",
        order: 3,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Submit review for completed appointment",
        description:
          "POST /api/reviews with valid data. Expect 201, review with isApproved=false.",
        taskId: task8_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'submit review'",
        expectedResult: "Review created pending moderation.",
        priority: "MEDIUM",
        order: 4,
      },
      {
        title: "Test: Cannot review non-completed appointment",
        description:
          "POST /api/reviews for PENDING appointment. Expect 400.",
        taskId: task8_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'review non-completed'",
        expectedResult: "400 error.",
        priority: "MEDIUM",
        order: 5,
      },
      {
        title: "Test: Cannot submit duplicate review",
        description:
          "POST /api/reviews twice for same appointment. Expect 409 on second.",
        taskId: task8_1.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'duplicate review'",
        expectedResult: "409 conflict on duplicate.",
        priority: "MEDIUM",
        order: 6,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // PHASE 9: Payment (Optional)
  // ════════════════════════════════════════════════════════════
  const phase9 = await prisma.phase.create({
    data: {
      title: "Payment (Optional)",
      description:
        "Optional Stripe payment integration toggled via ENABLE_PAYMENTS env flag. Fee display, checkout, invoices, refunds.",
      priority: "LOW",
      order: 9,
      tags: ["payment", "stripe", "optional"],
    },
  });

  // Task 9.1
  const task9_1 = await prisma.task.create({
    data: {
      title: "Payment Infrastructure",
      description:
        "Set up Stripe integration, payment model, and feature flag toggle.",
      phaseId: phase9.id,
      priority: "LOW",
      order: 1,
      tags: ["stripe", "setup"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Add Payment model to schema",
        description:
          "Fields: id, appointmentId (FK unique), amount (Decimal), currency (default INR), status (PENDING/COMPLETED/REFUNDED/FAILED), stripePaymentIntentId, stripeRefundId, createdAt, updatedAt.",
        taskId: task9_1.id,
        priority: "LOW",
        order: 1,
      },
      {
        title: "Install and configure Stripe",
        description:
          "Install stripe package. Create src/lib/stripe.ts with Stripe client. Use STRIPE_SECRET_KEY env var. Feature flag: ENABLE_PAYMENTS=true/false.",
        taskId: task9_1.id,
        priority: "LOW",
        order: 2,
      },
      {
        title: "Create payment feature flag utility",
        description:
          "src/lib/features.ts — isPaymentsEnabled(). Check ENABLE_PAYMENTS env var. Used to conditionally show/hide payment UI and enforce payment in booking flow.",
        taskId: task9_1.id,
        priority: "LOW",
        order: 3,
      },
    ],
  });

  // Task 9.2
  const task9_2 = await prisma.task.create({
    data: {
      title: "Payment Flow",
      description:
        "Checkout flow during booking, payment confirmation, invoice generation.",
      phaseId: phase9.id,
      priority: "LOW",
      order: 2,
      tags: ["checkout", "invoice"],
    },
  });

  await prisma.subtask.createMany({
    data: [
      {
        title: "Create POST /api/payments/create-intent endpoint",
        description:
          "Body: {appointmentId}. Create Stripe PaymentIntent for doctor's consultation fee. Return clientSecret. Create Payment record with PENDING status.",
        taskId: task9_2.id,
        priority: "LOW",
        order: 1,
      },
      {
        title: "Create POST /api/payments/webhook endpoint",
        description:
          "Handle Stripe webhooks: payment_intent.succeeded → update Payment status to COMPLETED, confirm appointment. payment_intent.payment_failed → update to FAILED.",
        taskId: task9_2.id,
        priority: "LOW",
        order: 2,
      },
      {
        title: "Build payment step in booking flow",
        description:
          "If payments enabled, add payment step after booking confirmation. Use Stripe Elements for card input. Show fee amount. On success → appointment confirmed.",
        taskId: task9_2.id,
        priority: "LOW",
        order: 3,
      },
      {
        title: "Create GET /api/payments/[id]/invoice endpoint",
        description:
          "Generate PDF invoice on-the-fly: patient info, doctor info, appointment date, amount, payment status, transaction ID.",
        taskId: task9_2.id,
        priority: "LOW",
        order: 4,
      },
      {
        title: "Create POST /api/payments/[id]/refund endpoint",
        description:
          "Trigger Stripe refund for cancelled appointments. Update Payment status to REFUNDED.",
        taskId: task9_2.id,
        priority: "LOW",
        order: 5,
      },
    ],
  });

  await prisma.test.createMany({
    data: [
      {
        title: "Test: Create payment intent",
        description:
          "POST /api/payments/create-intent. Expect Stripe PaymentIntent created (use Stripe test mode).",
        taskId: task9_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'create payment intent'",
        expectedResult: "Payment intent ID and client secret returned.",
        priority: "LOW",
        order: 6,
      },
      {
        title: "Test: Booking works without payment when disabled",
        description:
          "Set ENABLE_PAYMENTS=false. Book appointment. Expect booking succeeds without payment step.",
        taskId: task9_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'booking without payment'",
        expectedResult: "Appointment created, no payment record.",
        priority: "LOW",
        order: 7,
      },
      {
        title: "Test: Refund on cancellation",
        description:
          "Cancel paid appointment. Expect Stripe refund triggered and Payment status=REFUNDED.",
        taskId: task9_2.id,
        testType: "INTEGRATION",
        testCommand: "npm test -- --grep 'refund cancellation'",
        expectedResult: "Refund processed.",
        priority: "LOW",
        order: 8,
      },
    ],
  });

  // ════════════════════════════════════════════════════════════
  // Summary
  // ════════════════════════════════════════════════════════════
  const phaseCount = await prisma.phase.count();
  const taskCount = await prisma.task.count();
  const subtaskCount = await prisma.subtask.count();
  const testCount = await prisma.test.count();

  console.log("\n✅ Seed completed!");
  console.log(`   📦 Phases:   ${phaseCount}`);
  console.log(`   📋 Tasks:    ${taskCount}`);
  console.log(`   📝 Subtasks: ${subtaskCount}`);
  console.log(`   🧪 Tests:    ${testCount}`);
  console.log(`   📊 Total:    ${phaseCount + taskCount + subtaskCount + testCount}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
