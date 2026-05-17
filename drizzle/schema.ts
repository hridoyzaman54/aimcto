import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with student/parent specific fields for LMS.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Optional now, for legacy
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "student", "parent", "teacher"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  // Student-specific fields
  studentUid: varchar("studentUid", { length: 32 }).unique(), // Secret UID for parent verification
  dateOfBirth: timestamp("dateOfBirth"),
  grade: varchar("grade", { length: 20 }),
  // Parent-specific fields
  occupation: varchar("occupation", { length: 100 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Parent-Student relationship for linking parents to their children
 */
export const parentStudentLinks = mysqlTable("parent_student_links", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull(),
  studentId: int("studentId").notNull(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParentStudentLink = typeof parentStudentLinks.$inferSelect;
export type InsertParentStudentLink = typeof parentStudentLinks.$inferInsert;

/**
 * Courses table - main course information
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }), // Bengali title
  description: text("description"),
  descriptionBn: text("descriptionBn"),
  thumbnail: text("thumbnail"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  durationMonths: int("durationMonths").default(3).notNull(), // Course tenure
  // Legacy category field (kept for backward compatibility)
  category: varchar("category", { length: 100 }),
  // New category hierarchy references
  categoryId: int("categoryId"), // Reference to course_categories
  subcategoryId: int("subcategoryId"), // Reference to course_subcategories
  sectionId: int("sectionId"), // Reference to course_sections (optional)
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  totalLessons: int("totalLessons").default(0),
  instructorId: int("instructorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Lessons within courses
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  orderIndex: int("orderIndex").default(0).notNull(),
  contentType: mysqlEnum("contentType", ["video", "pdf", "text", "mixed"]).default("mixed"),
  videoUrl: text("videoUrl"),
  duration: int("duration"), // Duration in minutes
  isPreview: boolean("isPreview").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Lesson materials (PDFs, docs, images, etc.)
 */
export const lessonMaterials = mysqlTable("lesson_materials", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["pdf", "doc", "pptx", "image", "video", "audio", "link"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"), // Size in bytes
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonMaterial = typeof lessonMaterials.$inferSelect;
export type InsertLessonMaterial = typeof lessonMaterials.$inferInsert;

/**
 * Student enrollments in courses
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  status: mysqlEnum("status", ["active", "expired", "suspended", "completed"]).default("active").notNull(),
  paymentId: varchar("paymentId", { length: 100 }),
  paymentAmount: decimal("paymentAmount", { precision: 10, scale: 2 }),
  progressPercent: int("progressPercent").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  completedAt: timestamp("completedAt"),
  expiryNotified: boolean("expiryNotified").default(false), // Track if expiry notification sent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Lesson progress tracking
 */
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  lessonId: int("lessonId").notNull(),
  completed: boolean("completed").default(false),
  progressPercent: int("progressPercent").default(0),
  watchedDuration: int("watchedDuration").default(0), // Seconds watched
  lastPosition: int("lastPosition").default(0), // Video position in seconds
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

/**
 * Student notes for lessons (auto-save feature)
 */
export const studentNotes = mysqlTable("student_notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  content: text("content"),
  autoGenerated: boolean("autoGenerated").default(false), // For auto note-taker
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentNote = typeof studentNotes.$inferSelect;
export type InsertStudentNote = typeof studentNotes.$inferInsert;

/**
 * Quizzes
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId"),
  lessonId: int("lessonId"),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  instructions: text("instructions"), // Detailed instructions for students
  durationMinutes: int("durationMinutes").default(30),
  passingScore: int("passingScore").default(60), // Percentage
  totalMarks: int("totalMarks").default(100),
  shuffleQuestions: boolean("shuffleQuestions").default(false),
  showResults: boolean("showResults").default(true),
  showCorrectAnswers: boolean("showCorrectAnswers").default(false), // Show correct answers after submission
  maxAttempts: int("maxAttempts").default(1),
  // Scheduling
  announcementDate: timestamp("announcementDate"), // When quiz is announced to students
  availableFrom: timestamp("availableFrom"), // When students can start taking the quiz
  availableUntil: timestamp("availableUntil"), // Deadline
  // Category/Class/Section filtering
  categoryId: int("categoryId"), // Course category
  subcategoryId: int("subcategoryId"), // Subcategory
  sectionId: int("sectionId"), // Section (class/section)
  targetClass: varchar("targetClass", { length: 50 }), // e.g., "Class 5", "Class 10"
  targetSection: varchar("targetSection", { length: 50 }), // e.g., "Section A", "Section B"
  // Attachment options
  allowHandwrittenUpload: boolean("allowHandwrittenUpload").default(false), // Allow scanned handwritten docs
  requireHandwrittenUpload: boolean("requireHandwrittenUpload").default(false), // Require handwritten submission
  // Grading
  autoGrade: boolean("autoGrade").default(true), // Auto-grade MCQ
  gradingStatus: mysqlEnum("gradingStatus", ["pending", "partial", "completed"]).default("pending"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz questions
 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  question: text("question").notNull(),
  questionBn: text("questionBn"),
  questionType: mysqlEnum("questionType", ["mcq", "true_false", "short_answer", "long_answer", "fill_blank"]).default("mcq"),
  options: json("options"), // JSON array of options for MCQ
  correctAnswer: text("correctAnswer"), // For MCQ/true_false - can be null for written answers
  answerGuideline: text("answerGuideline"), // For manual grading - expected answer points
  marks: int("marks").default(1),
  negativeMarks: decimal("negativeMarks", { precision: 5, scale: 2 }).default("0"), // Negative marking for wrong MCQ
  explanation: text("explanation"),
  imageUrl: text("imageUrl"), // Optional image for the question
  orderIndex: int("orderIndex").default(0),
  isRequired: boolean("isRequired").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * Quiz attempts by students
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  userId: int("userId").notNull(),
  score: decimal("score", { precision: 10, scale: 2 }), // Can be decimal for partial marks
  totalMarks: int("totalMarks"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  passed: boolean("passed"),
  answers: json("answers"), // JSON object of question_id: answer
  // Handwritten document attachment
  handwrittenUploadUrl: text("handwrittenUploadUrl"), // URL to scanned handwritten document
  handwrittenUploadName: varchar("handwrittenUploadName", { length: 255 }),
  // Grading status
  autoGradedScore: decimal("autoGradedScore", { precision: 10, scale: 2 }), // Score from auto-graded MCQs
  manualGradedScore: decimal("manualGradedScore", { precision: 10, scale: 2 }), // Score from manually graded questions
  gradingStatus: mysqlEnum("gradingStatus", ["pending", "auto_graded", "partially_graded", "fully_graded"]).default("pending"),
  gradedBy: int("gradedBy"), // Admin/teacher who graded
  gradedAt: timestamp("gradedAt"),
  feedback: text("feedback"), // Overall feedback from grader
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  submittedAt: timestamp("submittedAt"), // When student submitted (may differ from completedAt if auto-submitted)
  timeSpentSeconds: int("timeSpentSeconds"),
  isAutoSubmitted: boolean("isAutoSubmitted").default(false), // Was it auto-submitted due to timer?
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Assignments
 */
export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  lessonId: int("lessonId"),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  instructions: text("instructions"),
  totalMarks: int("totalMarks").default(100),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  allowLateSubmission: boolean("allowLateSubmission").default(false),
  attachmentUrl: text("attachmentUrl"), // Reference material
  status: mysqlEnum("status", ["draft", "published", "closed"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

/**
 * Assignment submissions
 */
export const assignmentSubmissions = mysqlTable("assignment_submissions", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull(),
  userId: int("userId").notNull(),
  fileUrl: text("fileUrl"),
  content: text("content"), // Text submission
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  isLate: boolean("isLate").default(false),
  score: int("score"),
  feedback: text("feedback"),
  gradedBy: int("gradedBy"),
  gradedAt: timestamp("gradedAt"),
  status: mysqlEnum("status", ["submitted", "graded", "returned"]).default("submitted"),
});

export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertAssignmentSubmission = typeof assignmentSubmissions.$inferInsert;

/**
 * Attendance records
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  classDate: timestamp("classDate").notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "excused"]).default("present"),
  remarks: text("remarks"),
  markedBy: int("markedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Teacher remarks for students
 */
export const teacherRemarks = mysqlTable("teacher_remarks", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId"),
  teacherId: int("teacherId").notNull(),
  remark: text("remark").notNull(),
  remarkType: mysqlEnum("remarkType", ["general", "performance", "behavior", "improvement"]).default("general"),
  isPrivate: boolean("isPrivate").default(false), // Only visible to parents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherRemark = typeof teacherRemarks.$inferSelect;
export type InsertTeacherRemark = typeof teacherRemarks.$inferInsert;

/**
 * Achievements/Badges
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameBn: varchar("nameBn", { length: 100 }),
  description: text("description"),
  iconUrl: text("iconUrl"),
  badgeColor: varchar("badgeColor", { length: 20 }),
  criteria: text("criteria"), // JSON or text description of how to earn
  points: int("points").default(0),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Student achievements earned
 */
export const studentAchievements = mysqlTable("student_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  awardedBy: int("awardedBy"), // Admin/teacher who awarded
});

export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = typeof studentAchievements.$inferInsert;

/**
 * Game scores for gamification
 */
export const gameScores = mysqlTable("game_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameName: varchar("gameName", { length: 100 }).notNull(),
  score: int("score").notNull(),
  level: int("level"),
  metadata: json("metadata"), // Additional game-specific data
  playedAt: timestamp("playedAt").defaultNow().notNull(),
});

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = typeof gameScores.$inferInsert;

/**
 * Announcements
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  content: text("content").notNull(),
  contentBn: text("contentBn"),
  targetAudience: mysqlEnum("targetAudience", ["all", "students", "parents", "teachers", "course_specific"]).default("all"),
  courseId: int("courseId"), // If course-specific
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal"),
  isPinned: boolean("isPinned").default(false),
  publishedAt: timestamp("publishedAt"),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Events calendar
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  eventType: mysqlEnum("eventType", ["exam", "quiz", "holiday", "meeting", "workshop", "competition", "other"]).default("other"),
  eventDate: timestamp("eventDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 255 }),
  isOnline: boolean("isOnline").default(false),
  meetingLink: text("meetingLink"),
  targetAudience: mysqlEnum("targetAudience", ["all", "students", "parents", "teachers", "course_specific"]).default("all"),
  courseId: int("courseId"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Live classes
 */
export const liveClasses = mysqlTable("live_classes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: int("durationMinutes").default(60),
  meetingLink: text("meetingLink"),
  meetingId: varchar("meetingId", { length: 100 }),
  meetingPassword: varchar("meetingPassword", { length: 50 }),
  hostId: int("hostId"),
  status: mysqlEnum("status", ["scheduled", "live", "completed", "cancelled"]).default("scheduled"),
  recordingUrl: text("recordingUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiveClass = typeof liveClasses.$inferSelect;
export type InsertLiveClass = typeof liveClasses.$inferInsert;

/**
 * Class schedule/routine
 */
export const classSchedule = mysqlTable("class_schedule", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  dayOfWeek: mysqlEnum("dayOfWeek", ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]).notNull(),
  startTime: varchar("startTime", { length: 10 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 10 }).notNull(),
  roomOrLink: varchar("roomOrLink", { length: 255 }),
  instructorId: int("instructorId"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClassSchedule = typeof classSchedule.$inferSelect;
export type InsertClassSchedule = typeof classSchedule.$inferInsert;

/**
 * Private messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["info", "warning", "success", "error", "reminder"]).default("info"),
  category: varchar("category", { length: 50 }), // e.g., 'course_expiry', 'quiz_reminder', etc.
  relatedId: int("relatedId"), // ID of related entity
  relatedType: varchar("relatedType", { length: 50 }), // Type of related entity
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * AIMVerse Episodes
 */
export const aimverseEpisodes = mysqlTable("aimverse_episodes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  descriptionBn: text("descriptionBn"),
  episodeNumber: int("episodeNumber"),
  seasonNumber: int("seasonNumber").default(1),
  thumbnailUrl: text("thumbnailUrl"),
  videoUrl: text("videoUrl"),
  trailerUrl: text("trailerUrl"),
  duration: int("duration"), // Minutes
  releaseDate: timestamp("releaseDate"),
  isReleased: boolean("isReleased").default(false),
  status: mysqlEnum("status", ["upcoming", "released", "archived"]).default("upcoming"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AimverseEpisode = typeof aimverseEpisodes.$inferSelect;
export type InsertAimverseEpisode = typeof aimverseEpisodes.$inferInsert;

/**
 * AIMVerse Educational Cards
 */
export const aimverseCards = mysqlTable("aimverse_cards", {
  id: int("id").autoincrement().primaryKey(),
  episodeId: int("episodeId"),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  content: text("content"),
  contentBn: text("contentBn"),
  cardType: mysqlEnum("cardType", ["character", "power", "lesson", "fact", "quiz"]).default("lesson"),
  imageUrl: text("imageUrl"),
  videoUrl: text("videoUrl"),
  metadata: json("metadata"), // Additional card-specific data
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AimverseCard = typeof aimverseCards.$inferSelect;
export type InsertAimverseCard = typeof aimverseCards.$inferInsert;

/**
 * AIMVerse Prizes/Winners
 */
export const aimversePrizes = mysqlTable("aimverse_prizes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }),
  description: text("description"),
  prizeType: mysqlEnum("prizeType", ["quiz", "competition", "achievement", "special"]).default("quiz"),
  winnerId: int("winnerId"),
  episodeId: int("episodeId"),
  announcedAt: timestamp("announcedAt"),
  prizeDetails: text("prizeDetails"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AimversePrize = typeof aimversePrizes.$inferSelect;
export type InsertAimversePrize = typeof aimversePrizes.$inferInsert;


/**
 * Chat Groups for group messaging
 */
export const chatGroups = mysqlTable("chat_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["course", "section", "class", "custom"]).default("custom").notNull(),
  courseId: int("courseId"), // If type is 'course', links to the course
  createdBy: int("createdBy").notNull(),
  avatarUrl: text("avatarUrl"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatGroup = typeof chatGroups.$inferSelect;
export type InsertChatGroup = typeof chatGroups.$inferInsert;

/**
 * Chat Group Members
 */
export const chatGroupMembers = mysqlTable("chat_group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "moderator", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
  isActive: boolean("isActive").default(true),
});

export type ChatGroupMember = typeof chatGroupMembers.$inferSelect;
export type InsertChatGroupMember = typeof chatGroupMembers.$inferInsert;

/**
 * Group Messages
 */
export const groupMessages = mysqlTable("group_messages", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachmentUrl"),
  attachmentType: varchar("attachmentType", { length: 50 }),
  isEdited: boolean("isEdited").default(false),
  editedAt: timestamp("editedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = typeof groupMessages.$inferInsert;

/**
 * Group Message Read Status
 */
export const groupMessageReads = mysqlTable("group_message_reads", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type GroupMessageRead = typeof groupMessageReads.$inferSelect;
export type InsertGroupMessageRead = typeof groupMessageReads.$inferInsert;


/**
 * Course Categories - Main categories for organizing courses
 * Examples: Academic, Tiny Explorers, Special Needs, Skills and Creativities, Spoken English & Grammar
 */
export const courseCategories = mysqlTable("course_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameBn: varchar("nameBn", { length: 255 }), // Bengali name
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionBn: text("descriptionBn"),
  icon: varchar("icon", { length: 100 }), // Icon name or URL
  color: varchar("color", { length: 20 }), // Theme color for the category
  orderIndex: int("orderIndex").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCategory = typeof courseCategories.$inferInsert;

/**
 * Course Subcategories - Subcategories within main categories
 * Examples: 
 * - Academic: English Medium, Bangla Medium, English Version
 * - Tiny Explorers: Preschoolers, Kindergartners
 * - Special Needs: Autism Level 1, Autism Level 2, Autism Level 3, Undefined
 * - Skills and Creativities: Kids, Young adults, Youths, Adults, Everyone
 * - Spoken English & Grammar: Kids, Beginners, Intermediate, Advanced, General
 */
export const courseSubcategories = mysqlTable("course_subcategories", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameBn: varchar("nameBn", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  descriptionBn: text("descriptionBn"),
  orderIndex: int("orderIndex").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseSubcategory = typeof courseSubcategories.$inferSelect;
export type InsertCourseSubcategory = typeof courseSubcategories.$inferInsert;

/**
 * Course Sections - Optional sections within subcategories
 * Examples:
 * - Academic > English Medium > Class 1-10
 * - Academic > English Medium > Class 5 > Section A, Section B
 */
export const courseSections = mysqlTable("course_sections", {
  id: int("id").autoincrement().primaryKey(),
  subcategoryId: int("subcategoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameBn: varchar("nameBn", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  // For Academic category - class selection
  classLevel: varchar("classLevel", { length: 20 }), // e.g., "1", "2", ... "10"
  // For sections within a class
  sectionName: varchar("sectionName", { length: 50 }), // e.g., "A", "B", "C"
  orderIndex: int("orderIndex").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseSection = typeof courseSections.$inferSelect;
export type InsertCourseSection = typeof courseSections.$inferInsert;


/**
 * Course Wishlist - stores user's favorited/wishlisted courses
 */
export const courseWishlist = mysqlTable("course_wishlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseWishlistItem = typeof courseWishlist.$inferSelect;
export type InsertCourseWishlistItem = typeof courseWishlist.$inferInsert;


/**
 * Quiz Answer Grades - Individual grades for each question in an attempt
 * Allows for partial marks and detailed feedback per question
 */
export const quizAnswerGrades = mysqlTable("quiz_answer_grades", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  studentAnswer: text("studentAnswer"), // The answer given by student
  isCorrect: boolean("isCorrect"), // For MCQ/true_false
  marksAwarded: decimal("marksAwarded", { precision: 5, scale: 2 }).default("0"),
  maxMarks: int("maxMarks").default(1),
  feedback: text("feedback"), // Feedback for this specific question
  gradedBy: int("gradedBy"), // Who graded (null if auto-graded)
  gradedAt: timestamp("gradedAt"),
  isAutoGraded: boolean("isAutoGraded").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAnswerGrade = typeof quizAnswerGrades.$inferSelect;
export type InsertQuizAnswerGrade = typeof quizAnswerGrades.$inferInsert;
