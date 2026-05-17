# AIM Centre 360 - LMS Development TODO

## Phase 1: Core Infrastructure
- [x] Upgrade to full-stack (Database + Auth)
- [x] Fix TypeScript errors from upgrade
- [x] Design comprehensive LMS database schema

## Phase 2: Database Schema
- [x] Users table with roles (admin, student, parent, teacher)
- [x] Courses table (name, description, duration, price, thumbnail)
- [x] Lessons table (course_id, title, order, content_type)
- [x] Lesson materials table (lesson_id, type, url, filename)
- [x] Enrollments table (user_id, course_id, start_date, expiry_date, status)
- [x] Course progress table (enrollment_id, lesson_id, completed, progress_percent)
- [x] Assignments table (course_id, title, description, start_date, due_date)
- [x] Assignment submissions table (assignment_id, student_id, file_url, submitted_at)
- [x] Quizzes table (course_id, title, duration_minutes, passing_score)
- [x] Quiz questions table (quiz_id, question, options, correct_answer)
- [x] Quiz attempts table (quiz_id, student_id, score, started_at, completed_at)
- [x] Attendance table (student_id, course_id, date, status)
- [x] Student notes table (student_id, lesson_id, content, created_at)
- [x] Achievements table (name, description, icon, criteria)
- [x] Student achievements table (student_id, achievement_id, earned_at)
- [x] Teacher remarks table (student_id, course_id, teacher_id, remark, created_at)
- [x] Announcements table (title, content, target_audience, created_at)
- [x] Events table (title, description, event_date, event_type)
- [x] Live classes table (course_id, title, scheduled_at, meeting_link)
- [x] Messages table (from_user_id, to_user_id, content, read_at)
- [x] Parent-student links table (parent_id, student_id, verified)
- [x] Game scores table (student_id, game_name, score, played_at)
- [x] AIMVerse episodes table (title, description, video_url, release_date)
- [x] AIMVerse cards table (episode_id, title, content, media_url)
- [x] AIMVerse prizes table (for competitions and winners)
- [x] Notifications table (user notifications)
- [x] Class schedules table (recurring class schedules)

## Phase 3: Authentication & Roles
- [x] Implement role-based access control (RBAC)
- [x] Admin procedure middleware
- [x] Student procedure middleware
- [x] Parent procedure middleware
- [x] Teacher/Staff procedure middleware
- [x] Student UID generation for parent verification

## Phase 4: Admin Dashboard
- [x] Dashboard layout with sidebar navigation
- [x] Overview/Analytics page (total students, courses, revenue)
- [x] Course management (CRUD operations)
- [x] User management with role changes
- [ ] Lesson management with material uploads
- [ ] Quiz builder with timer settings
- [ ] Assignment creator with date pickers
- [ ] Attendance management
- [x] Announcement system
- [ ] Event calendar management
- [ ] Live class scheduler
- [ ] Teacher remarks interface
- [ ] Achievement creator
- [ ] Manual enrollment option
- [ ] AIMVerse CMS (episodes, cards, countdown timers)

## Phase 5: Student Dashboard
- [x] Dashboard layout with course cards
- [x] Enrolled courses grid
- [ ] Course player page with video/PDF viewer
- [ ] Lesson progress tracker
- [ ] Auto note-taker with save to DOCX
- [ ] Notes section per lesson
- [ ] Quiz taking interface with timer
- [ ] Quiz results and history
- [ ] Assignment submission interface
- [ ] Assignment progress tracker
- [ ] Attendance viewer
- [ ] Marks/grades section
- [ ] Teacher remarks viewer
- [x] Achievements showcase
- [ ] Game high scores
- [ ] Upcoming events calendar
- [ ] Announcements feed
- [ ] Live class join button
- [ ] Class schedule/routine
- [ ] Private messaging
- [ ] Course expiry notifications
- [ ] Next class reminder
- [x] AIMVerse section

## Phase 6: Parent Dashboard
- [x] Dashboard layout with child overview
- [x] Child verification via secret UID
- [x] Child's course progress overview
- [ ] Attendance report
- [ ] Assignment submission status
- [ ] Quiz scores and history
- [ ] Marks/grades viewer
- [ ] Teacher remarks
- [ ] Achievements earned
- [ ] Upcoming events
- [ ] Announcements
- [ ] Private messaging with teachers

## Phase 7: Course Access Control
- [ ] Enrollment with payment integration
- [ ] Course tenure tracking (3/4 months etc)
- [ ] Auto-expire access on tenure end
- [ ] Expiry reminder notifications (1 month, weekly, 3 days)
- [ ] Re-enrollment flow

## Phase 8: AIMVerse CMS
- [ ] Episode management (CRUD)
- [ ] Countdown timer for new releases
- [ ] Trailer management
- [ ] Educational cards with media
- [ ] Quiz integration
- [ ] Prize/winner announcements

## Phase 9: Notifications
- [x] In-app notification system (API)
- [ ] Course expiry reminders
- [ ] Quiz/exam reminders
- [ ] Live class reminders
- [ ] Assignment due reminders
- [ ] New announcement alerts

## Phase 10: Final Polish
- [x] Premium UI/UX refinements (dashboard layouts)
- [x] Mobile responsiveness
- [x] Performance optimization
- [ ] Testing and bug fixes

## Performance & Mobile Optimization
- [x] Image preloading for instant hero display
- [x] Lazy loading with blur placeholders for below-fold images
- [x] Mobile hamburger menu implementation
- [x] Touch-friendly interactions and responses
- [x] Responsive layouts for all sections
- [x] Optimized animations for mobile devices
- [x] Preserve desktop layout exactly as-is

## Bug Fixes
- [x] Fix failing user tests (tests assume empty DB but real user exists)
- [x] Fix Chatbot speech synthesis errors (getVoices, cancel undefined)
- [x] Fix nested anchor tag HTML error

## Authentication System Replacement
- [x] Replace Manus OAuth with email/password auth
- [x] Add password hashing with bcrypt
- [x] Add admin registration code 'Youknowwho1@'
- [x] Add optional phone number field for signup/login
- [x] Create signup page
- [x] Create login page
- [x] Update session management with JWT

## Chatbot Draggable Feature
- [x] Make chatbot draggable with mouse (desktop)
- [x] Make chatbot draggable with touch (mobile)

## Bug Fixes
- [x] Fix signup JSON error - unexpected end of JSON input

## Profile & Course Player Features
- [x] Create student profile page with editable fields
- [x] Create admin profile page with editable fields
- [x] Add avatar/profile picture upload functionality
- [x] Build course video player page
- [x] Add lesson/chapter navigation in player
- [x] Implement note-taking feature with auto-save
- [x] Create notes section in study materials
- [x] Add demo course with sample video, PDF, doc, image
- [x] Add instructor mockup details
- [x] Add course quiz for demo course

## Bug Fixes (Ongoing)
- [x] Fix admin signup JSON error - unexpected end of JSON input
- [x] Fix dashboard auth to recognize email/password login
- [x] Fix signup redirect - admin should go to /admin not /student
- [x] Fix auth cookie not recognized - infinite login loop
- [x] Fix auth cookie still not recognized after login (added cookie-parser middleware)
- [x] Fix Admin Dashboard mobile layout - sidebar overlapping with main content

## Dashboard Integration with Landing Page
- [x] Show 'Dashboard' in header menu after login (replaces Login/Sign Up)
- [x] Route Dashboard link to correct portal based on role (student/admin/parent)
- [x] Add 'Back to Home' button on all dashboards
- [x] Add mobile back button to go to previous page in dashboards
- [x] Logout redirects to landing page (logged out state)
- [ ] Show enrolled courses as accessible on landing page for logged-in students (future enhancement)
- [x] Fix OAuth login popup appearing while navigating the site when already logged in (updated context.ts to check JWT auth_token first)
- [x] Remove back button from main dashboard pages, only show on sub-pages/sections
- [x] Fix white border on right side of mobile view in landing page (added overflow-x: hidden)

## New Features - Phase 2
- [x] Student course enrollment from landing page
- [x] Student course enrollment from student dashboard
- [x] Course browse/catalog page for students
- [x] Enrollment confirmation and success feedback
- [x] Timed quiz interface with countdown timer
- [x] Quiz auto-submit when time expires
- [x] Quiz results display with score
- [x] Browser push notifications setup
- [x] Notifications for announcements
- [x] Notifications for assignment deadlines
- [x] Notifications for live class reminders

## Course Player & Assignment Features
- [x] Course player page with video viewer
- [x] Course player PDF viewer
- [x] Lesson navigation sidebar in course player
- [x] Progress tracking (mark lessons complete)
- [x] Auto-save note-taking while watching/reading
- [x] Notes stored per lesson in notes section
- [x] Assignment submission page with file upload
- [x] Deadline enforcement for assignments
- [x] Assignment status tracking (pending/submitted/graded)


## Admin Lesson Management & Real-time Messaging
- [x] Admin lesson management page with CRUD operations
- [x] Video upload for lessons
- [x] PDF attachment upload for lessons
- [x] Lesson ordering/reordering within courses
- [x] WebSocket server setup for real-time messaging
- [x] Direct messaging between students and teachers
- [x] Group chat functionality
- [x] Course-based group chat (all enrolled students)
- [x] Section-based group chat
- [x] Class-based group chat
- [x] Admin/teacher group management (add/remove members)


## Bug Fixes - Lesson Management
- [x] Fix admin lesson management mobile layout overlap (responsive layout with dropdown menu on mobile)
- [x] Remove 4 lesson limit - confirmed no limit exists, the 4 lessons were just demo data

- [ ] Add 'Add Lesson' button to AdminLessons page for creating new lessons
- [x] Add course thumbnail upload option in admin course management
- [x] Fix course thumbnail upload - use S3 storage instead of base64 data URL
- [x] Add document upload support (PDF, DOC, DOCX, TXT, PPTX) to lesson form based on content type selection

## Category System for Course Management

- [x] Create database schema for categories (main categories, subcategories, sections)
- [x] Seed initial categories: Academic, Tiny Explorers, Special Needs, Skills and Creativities, Spoken English & Grammar
- [x] Create API endpoints for category CRUD operations
- [x] Build admin UI for category management
- [x] Add category selection flow before course creation
- [x] Update course model to link with categories
- [x] Display courses by category on main site
- [x] Allow admins to add new categories

## Bug Fixes - Category System
- [x] Fix SelectItem empty value error in course creation form

## Multiple Materials per Lesson Feature
- [x] Update lesson form to support multiple file uploads (video, PDF, PPTX, DOC, images)
- [x] Create UI for managing lesson materials (add, remove, view, delete)
- [x] Update API to handle multiple materials per lesson (added pptx type)
- [ ] Display all materials in course player

## Bug Fixes - My Courses Page
- [x] Fix course cards to be clickable and navigate to respective course lessons
- [x] Fix progress calculation to update after marking lessons as complete

## Homepage Course Carousel
- [x] Restore fake sample courses on homepage course carousel (12 sample courses)
- [x] Restore auto-scroll functionality for course carousel (4 second interval)

## Bug Fixes - Course Carousel
- [x] Fix carousel card responsive layout on mobile (cards getting cut off)
- [x] Add touch swipe left-right support for carousel on mobile


## Chatbot Gemini API Integration
- [x] Update chatbot to use Google Gemini API (primary)
- [x] Add GEMINI_API_KEY with user's key
- [ ] Test chatbot responses with Gemini


## Profile Page Improvements
- [x] Add back button to profile page
- [x] Add profile picture upload option
- [x] Add pre-made avatar selection option (12 DiceBear avatars)
- [x] Database already stores avatarUrl
- [x] Applied to admin and student profiles

## Real-time Chat System
- [x] Fix: Login/Signup buttons not working - form submission not triggering (was redirecting to old /auth page)
- [ ] Fix create group button functionality
- [ ] Create student-facing real-time chat interface
- [ ] Add unread message notification badges to navigation

## Carousel Card Improvements
- [x] Add Enroll Now button to carousel course cards (View Course button added)
- [x] Add animated heart/favorite icon with touch/hover animation

## Premium Document Viewer
- [x] Create core DocumentViewer component with PDF support
- [x] Add DOC/DOCX viewing capability (using mammoth.js)
- [ ] Add PPTX viewing capability (future enhancement)
- [ ] Add e-book (EPUB) viewing capability (future enhancement)
- [x] Implement responsive design for mobile/tablet/desktop
- [x] Support landscape and portrait orientations
- [x] Add zoom controls (pinch-to-zoom on mobile)
- [x] Add page navigation
- [x] Add fullscreen mode
- [x] Add download option
- [x] Add print option
- [x] Add dark mode support

## Bug Fixes & Improvements
- [x] Fix Chrome blocking issue with PDF viewer (using local worker file)
- [x] Fix urgent news not visible on student dashboard (added announcements query)
- [x] Redesign AIMVerse section - premium, elegant, modern without gradients

## Wishlist Feature
- [x] Create wishlist database schema (course_wishlist table with user_id, course_id, created_at)
- [x] Create wishlist API endpoints (add, remove, toggle, check, getMyWishlist, getMyWishlistIds)
- [x] Update course cards with functional heart icon that persists state per user
- [x] Add Wishlist section to student dashboard with course cards and enroll buttons
- [x] Enable enrollment via payment from wishlist (links to catalog for enrollment)

## Complete Quiz Management System
- [x] Update database schema for enhanced quiz system (question types, scheduling, attachments)
- [x] Create quiz API endpoints for admin CRUD operations
- [x] Build Admin Quiz Management dashboard with list/create/edit/delete
- [x] Create quiz question builder with MCQ and written question types
- [x] Add quiz scheduling with announcement date/time
- [x] Add category, class, section filtering for quizzes
- [x] Add option for scanned handwritten document attachment
- [x] Build student quiz taking interface with countdown timer
- [x] Implement auto-submit when timer expires
- [x] Implement auto-grading for MCQ questions
- [x] Create manual grading interface for written answers
- [x] Display quiz results with score breakdown
