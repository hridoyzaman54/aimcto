import { and, desc, eq, gte, lte, sql, or, like, inArray, isNull, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  courses, InsertCourse, Course,
  lessons, InsertLesson, Lesson,
  lessonMaterials, InsertLessonMaterial,
  enrollments, InsertEnrollment, Enrollment,
  lessonProgress, InsertLessonProgress,
  studentNotes, InsertStudentNote,
  quizzes, InsertQuiz, Quiz,
  quizQuestions, InsertQuizQuestion,
  quizAttempts, InsertQuizAttempt,
  quizAnswerGrades, InsertQuizAnswerGrade,
  assignments, InsertAssignment,
  assignmentSubmissions, InsertAssignmentSubmission,
  attendance, InsertAttendance,
  teacherRemarks, InsertTeacherRemark,
  achievements, InsertAchievement,
  studentAchievements, InsertStudentAchievement,
  gameScores, InsertGameScore,
  announcements, InsertAnnouncement,
  events, InsertEvent,
  liveClasses, InsertLiveClass,
  classSchedule, InsertClassSchedule,
  messages, InsertMessage,
  notifications, InsertNotification,
  parentStudentLinks, InsertParentStudentLink,
  aimverseEpisodes, InsertAimverseEpisode,
  aimverseCards, InsertAimverseCard,
  aimversePrizes, InsertAimversePrize,
  chatGroups, InsertChatGroup, ChatGroup,
  chatGroupMembers, InsertChatGroupMember,
  groupMessages, InsertGroupMessage,
  groupMessageReads,
  courseCategories, InsertCourseCategory, CourseCategory,
  courseSubcategories, InsertCourseSubcategory, CourseSubcategory,
  courseSections, InsertCourseSection, CourseSection,
  courseWishlist, InsertCourseWishlistItem,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // For OAuth users (legacy), generate placeholder email/password if not provided
    const values: InsertUser = {
      openId: user.openId || nanoid(16),
      email: user.email || `oauth_${nanoid(8)}@placeholder.local`,
      passwordHash: user.passwordHash || 'oauth-user-no-password',
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(role?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (role) {
    return db.select().from(users).where(eq(users.role, role as any)).orderBy(desc(users.createdAt));
  }
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'student' | 'parent' | 'teacher') {
  const db = await getDb();
  if (!db) return;
  
  // Generate student UID if becoming a student
  const updateData: any = { role };
  if (role === 'student') {
    updateData.studentUid = `STU-${nanoid(8).toUpperCase()}`;
  }
  
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserByStudentUid(studentUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.studentUid, studentUid)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ PARENT-STUDENT LINK HELPERS ============

export async function linkParentToStudent(parentId: number, studentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(parentStudentLinks).values({ parentId, studentId, verified: true, verifiedAt: new Date() });
}

export async function getLinkedStudents(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const links = await db.select().from(parentStudentLinks).where(eq(parentStudentLinks.parentId, parentId));
  if (links.length === 0) return [];
  
  const studentIds = links.map(l => l.studentId);
  return db.select().from(users).where(inArray(users.id, studentIds));
}

export async function verifyParentStudentLink(parentId: number, studentUid: string) {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };
  
  // Find student by UID
  const student = await getUserByStudentUid(studentUid);
  if (!student) {
    return { success: false, message: "Invalid student UID" };
  }
  
  // Check if already linked
  const existing = await db.select().from(parentStudentLinks)
    .where(and(eq(parentStudentLinks.parentId, parentId), eq(parentStudentLinks.studentId, student.id)))
    .limit(1);
  
  if (existing.length > 0) {
    return { success: false, message: "Already linked to this student" };
  }
  
  // Create link
  await linkParentToStudent(parentId, student.id);
  return { success: true, message: "Successfully linked to student", student };
}

// ============ COURSE HELPERS ============

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(courses).values(data);
  return result[0].insertId;
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCourses(status?: 'draft' | 'published' | 'archived') {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(courses).where(eq(courses.status, status)).orderBy(desc(courses.createdAt));
  }
  return db.select().from(courses).orderBy(desc(courses.createdAt));
}

export async function getPublishedCourses() {
  return getAllCourses('published');
}

// ============ LESSON HELPERS ============

export async function createLesson(data: InsertLesson) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(lessons).values(data);
  
  // Update course lesson count
  await db.update(courses)
    .set({ totalLessons: sql`${courses.totalLessons} + 1` })
    .where(eq(courses.id, data.courseId));
  
  return result[0].insertId;
}

export async function updateLesson(id: number, data: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) return;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;
  
  const lesson = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (lesson.length > 0) {
    await db.delete(lessons).where(eq(lessons.id, id));
    await db.update(courses)
      .set({ totalLessons: sql`GREATEST(${courses.totalLessons} - 1, 0)` })
      .where(eq(courses.id, lesson[0].courseId));
  }
}

export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.orderIndex));
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ LESSON MATERIAL HELPERS ============

export async function addLessonMaterial(data: InsertLessonMaterial) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(lessonMaterials).values(data);
  return result[0].insertId;
}

export async function getLessonMaterials(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonMaterials).where(eq(lessonMaterials.lessonId, lessonId)).orderBy(asc(lessonMaterials.orderIndex));
}

export async function deleteLessonMaterial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessonMaterials).where(eq(lessonMaterials.id, id));
}

// ============ ENROLLMENT HELPERS ============

export async function enrollStudent(userId: number, courseId: number, durationMonths: number, paymentId?: string, paymentAmount?: string) {
  const db = await getDb();
  if (!db) return;
  
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
  
  const result = await db.insert(enrollments).values({
    userId,
    courseId,
    expiresAt,
    paymentId,
    paymentAmount,
    status: 'active',
  });
  return result[0].insertId;
}

export async function getEnrollmentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: enrollments.id,
    userId: enrollments.userId,
    courseId: enrollments.courseId,
    enrolledAt: enrollments.enrolledAt,
    expiresAt: enrollments.expiresAt,
    status: enrollments.status,
    paymentId: enrollments.paymentId,
    paymentAmount: enrollments.paymentAmount,
    progressPercent: enrollments.progressPercent,
    lastAccessedAt: enrollments.lastAccessedAt,
    completedAt: enrollments.completedAt,

    createdAt: enrollments.createdAt,
    updatedAt: enrollments.updatedAt,
    courseTitle: courses.title,
    courseDescription: courses.description,
    courseThumbnail: courses.thumbnail,
  })
  .from(enrollments)
  .leftJoin(courses, eq(enrollments.courseId, courses.id))
  .where(eq(enrollments.userId, userId))
  .orderBy(desc(enrollments.enrolledAt));
  return result;
}

export async function getEnrollmentsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.courseId, courseId)).orderBy(desc(enrollments.enrolledAt));
}

export async function getActiveEnrollment(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(enrollments)
    .where(and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId),
      eq(enrollments.status, 'active')
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEnrollmentProgress(enrollmentId: number, progressPercent: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(enrollments).set({ progressPercent, lastAccessedAt: new Date() }).where(eq(enrollments.id, enrollmentId));
}

export async function getExpiringEnrollments(daysUntilExpiry: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysUntilExpiry);
  
  return db.select().from(enrollments)
    .where(and(
      eq(enrollments.status, 'active'),
      gte(enrollments.expiresAt, now),
      lte(enrollments.expiresAt, futureDate),
      eq(enrollments.expiryNotified, false)
    ));
}

export async function markEnrollmentNotified(enrollmentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(enrollments).set({ expiryNotified: true }).where(eq(enrollments.id, enrollmentId));
}

export async function expireEnrollments() {
  const db = await getDb();
  if (!db) return;
  
  await db.update(enrollments)
    .set({ status: 'expired' })
    .where(and(
      eq(enrollments.status, 'active'),
      lte(enrollments.expiresAt, new Date())
    ));
}

// ============ LESSON PROGRESS HELPERS ============

export async function updateLessonProgress(enrollmentId: number, lessonId: number, data: Partial<InsertLessonProgress>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.enrollmentId, enrollmentId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(lessonProgress).set(data).where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({ enrollmentId, lessonId, ...data });
  }
}

export async function getLessonProgressByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonProgress).where(eq(lessonProgress.enrollmentId, enrollmentId));
}

export async function markLessonComplete(enrollmentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Mark the lesson as complete
  await updateLessonProgress(enrollmentId, lessonId, { completed: true, progressPercent: 100, completedAt: new Date() });
  
  // Get the enrollment to find the courseId
  const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  if (!enrollment.length) return;
  
  const courseId = enrollment[0].courseId;
  
  // Get total lessons for this course
  const totalLessons = await db.select({ count: sql<number>`count(*)` })
    .from(lessons)
    .where(eq(lessons.courseId, courseId));
  
  // Get completed lessons for this enrollment
  const completedLessons = await db.select({ count: sql<number>`count(*)` })
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.enrollmentId, enrollmentId),
      eq(lessonProgress.completed, true)
    ));
  
  const total = Number(totalLessons[0]?.count) || 0;
  const completed = Number(completedLessons[0]?.count) || 0;
  
  // Calculate progress percentage
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Update enrollment progress
  await db.update(enrollments)
    .set({ 
      progressPercent,
      lastAccessedAt: new Date(),
      ...(progressPercent === 100 ? { completedAt: new Date(), status: 'completed' as const } : {})
    })
    .where(eq(enrollments.id, enrollmentId));
}

// ============ STUDENT NOTES HELPERS ============

export async function saveStudentNote(userId: number, lessonId: number, content: string, autoGenerated = false) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(studentNotes)
    .where(and(eq(studentNotes.userId, userId), eq(studentNotes.lessonId, lessonId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(studentNotes).set({ content }).where(eq(studentNotes.id, existing[0].id));
    return existing[0].id;
  } else {
    const result = await db.insert(studentNotes).values({ userId, lessonId, content, autoGenerated });
    return result[0].insertId;
  }
}

export async function getStudentNotes(userId: number, lessonId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (lessonId) {
    return db.select().from(studentNotes)
      .where(and(eq(studentNotes.userId, userId), eq(studentNotes.lessonId, lessonId)));
  }
  return db.select().from(studentNotes).where(eq(studentNotes.userId, userId)).orderBy(desc(studentNotes.updatedAt));
}

// ============ QUIZ HELPERS ============

export async function createQuiz(data: InsertQuiz) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(quizzes).values(data);
  return result[0].insertId;
}

export async function updateQuiz(id: number, data: Partial<InsertQuiz>) {
  const db = await getDb();
  if (!db) return;
  await db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

export async function deleteQuiz(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuizzesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).orderBy(desc(quizzes.createdAt));
}

export async function addQuizQuestion(data: InsertQuizQuestion) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(quizQuestions).values(data);
  return result[0].insertId;
}

export async function getQuizQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(asc(quizQuestions.orderIndex));
}

export async function deleteQuizQuestion(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
}

export async function startQuizAttempt(quizId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(quizAttempts).values({ quizId, userId });
  return result[0].insertId;
}

export async function submitQuizAttempt(attemptId: number, answers: any, score: number, totalMarks: number) {
  const db = await getDb();
  if (!db) return;
  
  const percentage = (score / totalMarks) * 100;
  const quiz = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  
  if (quiz.length > 0) {
    const quizData = await getQuizById(quiz[0].quizId);
    const passed = percentage >= (quizData?.passingScore || 60);
    
    await db.update(quizAttempts).set({
      answers,
      score: score.toString(),
      totalMarks,
      percentage: percentage.toFixed(2),
      passed,
      completedAt: new Date(),
      timeSpentSeconds: Math.floor((new Date().getTime() - quiz[0].startedAt.getTime()) / 1000),
    }).where(eq(quizAttempts.id, attemptId));
  }
}

export async function getQuizAttempts(userId: number, quizId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (quizId) {
    return db.select().from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
      .orderBy(desc(quizAttempts.startedAt));
  }
  return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.startedAt));
}

// Get all quizzes for admin management
export async function getAllQuizzes(filters?: {
  status?: string;
  categoryId?: number;
  courseId?: number;
  targetClass?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.status) conditions.push(eq(quizzes.status, filters.status as any));
  if (filters?.categoryId) conditions.push(eq(quizzes.categoryId, filters.categoryId));
  if (filters?.courseId) conditions.push(eq(quizzes.courseId, filters.courseId));
  if (filters?.targetClass) conditions.push(eq(quizzes.targetClass, filters.targetClass));
  
  if (conditions.length > 0) {
    return db.select().from(quizzes).where(and(...conditions)).orderBy(desc(quizzes.createdAt));
  }
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

// Get quiz with questions for taking
export async function getQuizWithQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (quiz.length === 0) return null;
  
  const questions = await db.select().from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(asc(quizQuestions.orderIndex));
  
  return { ...quiz[0], questions };
}

// Update quiz question
export async function updateQuizQuestion(id: number, data: Partial<InsertQuizQuestion>) {
  const db = await getDb();
  if (!db) return;
  await db.update(quizQuestions).set(data).where(eq(quizQuestions.id, id));
}

// Enhanced submit quiz attempt with auto-grading
export async function submitQuizAttemptEnhanced(
  attemptId: number, 
  answers: Record<string, string>, 
  handwrittenUploadUrl?: string,
  handwrittenUploadName?: string,
  isAutoSubmitted?: boolean
) {
  const db = await getDb();
  if (!db) return;
  
  const attempt = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attempt.length === 0) return;
  
  const quiz = await getQuizWithQuestions(attempt[0].quizId);
  if (!quiz) return;
  
  let autoGradedScore = 0;
  let manualGradingNeeded = false;
  const answerGrades: InsertQuizAnswerGrade[] = [];
  
  // Process each question
  for (const question of quiz.questions) {
    const studentAnswer = answers[question.id.toString()] || '';
    const isAutoGradable = ['mcq', 'true_false', 'fill_blank'].includes(question.questionType || 'mcq');
    
    if (isAutoGradable && question.correctAnswer) {
      const isCorrect = studentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      const marksAwarded = isCorrect ? (question.marks || 1) : 0;
      autoGradedScore += marksAwarded;
      
      answerGrades.push({
        attemptId,
        questionId: question.id,
        studentAnswer,
        isCorrect,
        marksAwarded: marksAwarded.toString(),
        maxMarks: question.marks || 1,
        isAutoGraded: true,
      });
    } else {
      // Manual grading needed for written answers
      manualGradingNeeded = true;
      answerGrades.push({
        attemptId,
        questionId: question.id,
        studentAnswer,
        isCorrect: null,
        marksAwarded: '0',
        maxMarks: question.marks || 1,
        isAutoGraded: false,
      });
    }
  }
  
  // Insert answer grades
  if (answerGrades.length > 0) {
    await db.insert(quizAnswerGrades).values(answerGrades);
  }
  
  const gradingStatus = manualGradingNeeded ? 'auto_graded' : 'fully_graded';
  const totalMarks = quiz.totalMarks || 100;
  const percentage = (autoGradedScore / totalMarks) * 100;
  const passed = percentage >= (quiz.passingScore || 60);
  
  await db.update(quizAttempts).set({
    answers,
    autoGradedScore: autoGradedScore.toString(),
    score: manualGradingNeeded ? null : autoGradedScore.toString(),
    totalMarks,
    percentage: manualGradingNeeded ? null : percentage.toFixed(2),
    passed: manualGradingNeeded ? null : passed,
    gradingStatus,
    handwrittenUploadUrl,
    handwrittenUploadName,
    isAutoSubmitted: isAutoSubmitted || false,
    submittedAt: new Date(),
    completedAt: new Date(),
    timeSpentSeconds: Math.floor((new Date().getTime() - attempt[0].startedAt.getTime()) / 1000),
  }).where(eq(quizAttempts.id, attemptId));
  
  return { autoGradedScore, manualGradingNeeded, gradingStatus };
}

// Get all attempts for a quiz (admin view)
export async function getQuizAttemptsByQuiz(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const attempts = await db.select({
    attempt: quizAttempts,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
    }
  })
  .from(quizAttempts)
  .leftJoin(users, eq(quizAttempts.userId, users.id))
  .where(eq(quizAttempts.quizId, quizId))
  .orderBy(desc(quizAttempts.submittedAt));
  
  return attempts;
}

// Get attempt with answer grades for grading
export async function getAttemptForGrading(attemptId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const attempt = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attempt.length === 0) return null;
  
  const quiz = await getQuizWithQuestions(attempt[0].quizId);
  const grades = await db.select().from(quizAnswerGrades)
    .where(eq(quizAnswerGrades.attemptId, attemptId))
    .orderBy(asc(quizAnswerGrades.questionId));
  
  const user = await db.select().from(users).where(eq(users.id, attempt[0].userId)).limit(1);
  
  return {
    attempt: attempt[0],
    quiz,
    grades,
    user: user[0] || null,
  };
}

// Grade a single answer (manual grading)
export async function gradeAnswer(
  gradeId: number, 
  marksAwarded: number, 
  feedback: string | null,
  gradedBy: number
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(quizAnswerGrades).set({
    marksAwarded: marksAwarded.toString(),
    feedback,
    gradedBy,
    gradedAt: new Date(),
  }).where(eq(quizAnswerGrades.id, gradeId));
}

// Finalize grading for an attempt
export async function finalizeAttemptGrading(
  attemptId: number,
  feedback: string | null,
  gradedBy: number
) {
  const db = await getDb();
  if (!db) return;
  
  // Calculate total score from all grades
  const grades = await db.select().from(quizAnswerGrades)
    .where(eq(quizAnswerGrades.attemptId, attemptId));
  
  const totalScore = grades.reduce((sum, g) => sum + parseFloat(g.marksAwarded || '0'), 0);
  const manualScore = grades
    .filter(g => !g.isAutoGraded)
    .reduce((sum, g) => sum + parseFloat(g.marksAwarded || '0'), 0);
  
  const attempt = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId)).limit(1);
  if (attempt.length === 0) return;
  
  const quiz = await getQuizById(attempt[0].quizId);
  const totalMarks = quiz?.totalMarks || 100;
  const percentage = (totalScore / totalMarks) * 100;
  const passed = percentage >= (quiz?.passingScore || 60);
  
  await db.update(quizAttempts).set({
    score: totalScore.toString(),
    manualGradedScore: manualScore.toString(),
    percentage: percentage.toFixed(2),
    passed,
    gradingStatus: 'fully_graded',
    feedback,
    gradedBy,
    gradedAt: new Date(),
  }).where(eq(quizAttempts.id, attemptId));
  
  return { totalScore, percentage, passed };
}

// Get available quizzes for a student
export async function getAvailableQuizzesForStudent(userId: number, filters?: {
  categoryId?: number;
  courseId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const conditions = [
    eq(quizzes.status, 'published'),
    or(
      isNull(quizzes.availableFrom),
      lte(quizzes.availableFrom, now)
    ),
    or(
      isNull(quizzes.availableUntil),
      gte(quizzes.availableUntil, now)
    ),
  ];
  
  if (filters?.categoryId) conditions.push(eq(quizzes.categoryId, filters.categoryId));
  if (filters?.courseId) conditions.push(eq(quizzes.courseId, filters.courseId));
  
  const availableQuizzes = await db.select().from(quizzes)
    .where(and(...conditions))
    .orderBy(desc(quizzes.announcementDate), desc(quizzes.createdAt));
  
  // Get user's attempts for these quizzes
  const quizIds = availableQuizzes.map(q => q.id);
  const userAttempts = quizIds.length > 0 
    ? await db.select().from(quizAttempts)
        .where(and(
          eq(quizAttempts.userId, userId),
          inArray(quizAttempts.quizId, quizIds)
        ))
    : [];
  
  // Map attempts to quizzes
  return availableQuizzes.map(quiz => ({
    ...quiz,
    attempts: userAttempts.filter(a => a.quizId === quiz.id),
    canAttempt: userAttempts.filter(a => a.quizId === quiz.id).length < (quiz.maxAttempts || 1),
  }));
}

// Get pending grading for admin
export async function getPendingGradingAttempts() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    attempt: quizAttempts,
    quiz: quizzes,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
    }
  })
  .from(quizAttempts)
  .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
  .leftJoin(users, eq(quizAttempts.userId, users.id))
  .where(
    or(
      eq(quizAttempts.gradingStatus, 'pending'),
      eq(quizAttempts.gradingStatus, 'auto_graded'),
      eq(quizAttempts.gradingStatus, 'partially_graded')
    )
  )
  .orderBy(asc(quizAttempts.submittedAt));
}

// ============ ASSIGNMENT HELPERS ============

export async function createAssignment(data: InsertAssignment) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(assignments).values(data);
  return result[0].insertId;
}

export async function updateAssignment(id: number, data: Partial<InsertAssignment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(assignments).set(data).where(eq(assignments.id, id));
}

export async function deleteAssignment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(assignments).where(eq(assignments.id, id));
}

export async function getAssignmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssignmentsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignments).where(eq(assignments.courseId, courseId)).orderBy(desc(assignments.createdAt));
}

export async function submitAssignment(data: InsertAssignmentSubmission) {
  const db = await getDb();
  if (!db) return;
  
  // Check if late
  const assignment = await getAssignmentById(data.assignmentId);
  const isLate = assignment?.dueDate ? new Date() > assignment.dueDate : false;
  
  const result = await db.insert(assignmentSubmissions).values({ ...data, isLate });
  return result[0].insertId;
}

export async function getAssignmentSubmissions(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, assignmentId)).orderBy(desc(assignmentSubmissions.submittedAt));
}

export async function getStudentSubmissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.userId, userId)).orderBy(desc(assignmentSubmissions.submittedAt));
}

export async function getStudentAssignments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get user's enrolled courses
  const userEnrollments = await db.select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, userId));
  
  const courseIds = userEnrollments.map(e => e.courseId);
  if (courseIds.length === 0) return [];
  
  // Get all assignments for enrolled courses
  const allAssignments = await db.select()
    .from(assignments)
    .where(inArray(assignments.courseId, courseIds))
    .orderBy(desc(assignments.dueDate));
  
  // Get user's submissions
  const userSubmissions = await db.select()
    .from(assignmentSubmissions)
    .where(eq(assignmentSubmissions.userId, userId));
  
  // Get course names
  const courseList = await db.select({ id: courses.id, title: courses.title })
    .from(courses)
    .where(inArray(courses.id, courseIds));
  
  const courseMap = new Map(courseList.map(c => [c.id, c.title]));
  const submissionMap = new Map(userSubmissions.map(s => [s.assignmentId, s]));
  
  // Combine data
  return allAssignments.map(a => ({
    ...a,
    courseName: courseMap.get(a.courseId!) || 'Unknown Course',
    submission: submissionMap.get(a.id),
  }));
}

export async function gradeSubmission(submissionId: number, score: number, feedback: string, gradedBy: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assignmentSubmissions).set({
    score,
    feedback,
    gradedBy,
    gradedAt: new Date(),
    status: 'graded',
  }).where(eq(assignmentSubmissions.id, submissionId));
}

// ============ ATTENDANCE HELPERS ============

export async function markAttendance(data: InsertAttendance) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(attendance).values(data);
  return result[0].insertId;
}

export async function getAttendanceByStudent(userId: number, courseId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (courseId) {
    return db.select().from(attendance)
      .where(and(eq(attendance.userId, userId), eq(attendance.courseId, courseId)))
      .orderBy(desc(attendance.classDate));
  }
  return db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.classDate));
}

export async function getAttendanceByCourse(courseId: number, date?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (date) {
    return db.select().from(attendance)
      .where(and(eq(attendance.courseId, courseId), eq(attendance.classDate, date)));
  }
  return db.select().from(attendance).where(eq(attendance.courseId, courseId)).orderBy(desc(attendance.classDate));
}

// ============ TEACHER REMARKS HELPERS ============

export async function addTeacherRemark(data: InsertTeacherRemark) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(teacherRemarks).values(data);
  return result[0].insertId;
}

export async function getRemarksByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teacherRemarks).where(eq(teacherRemarks.studentId, studentId)).orderBy(desc(teacherRemarks.createdAt));
}

export async function getRemarksByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teacherRemarks).where(eq(teacherRemarks.courseId, courseId)).orderBy(desc(teacherRemarks.createdAt));
}

// ============ ACHIEVEMENT HELPERS ============

export async function createAchievement(data: InsertAchievement) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(achievements).values(data);
  return result[0].insertId;
}

export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievements).orderBy(desc(achievements.createdAt));
}

export async function awardAchievement(userId: number, achievementId: number, awardedBy?: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already awarded
  const existing = await db.select().from(studentAchievements)
    .where(and(eq(studentAchievements.userId, userId), eq(studentAchievements.achievementId, achievementId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(studentAchievements).values({ userId, achievementId, awardedBy });
  }
}

export async function getStudentAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentAchievements).where(eq(studentAchievements.userId, userId)).orderBy(desc(studentAchievements.earnedAt));
}

// ============ GAME SCORE HELPERS ============

export async function saveGameScore(data: InsertGameScore) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(gameScores).values(data);
  return result[0].insertId;
}

export async function getGameScores(userId: number, gameName?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (gameName) {
    return db.select().from(gameScores)
      .where(and(eq(gameScores.userId, userId), eq(gameScores.gameName, gameName)))
      .orderBy(desc(gameScores.score))
      .limit(10);
  }
  return db.select().from(gameScores).where(eq(gameScores.userId, userId)).orderBy(desc(gameScores.playedAt));
}

export async function getLeaderboard(gameName: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gameScores).where(eq(gameScores.gameName, gameName)).orderBy(desc(gameScores.score)).limit(limit);
}

// ============ ANNOUNCEMENT HELPERS ============

export async function createAnnouncement(data: InsertAnnouncement) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(announcements).values(data);
  return result[0].insertId;
}

export async function getAnnouncements(audience?: string, courseId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (audience) {
    conditions.push(or(eq(announcements.targetAudience, audience as any), eq(announcements.targetAudience, 'all')));
  }
  if (courseId) {
    conditions.push(or(eq(announcements.courseId, courseId), isNull(announcements.courseId)));
  }
  
  if (conditions.length > 0) {
    return db.select().from(announcements).where(and(...conditions)).orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }
  return db.select().from(announcements).orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(announcements).where(eq(announcements.id, id));
}

// ============ EVENT HELPERS ============

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(events).values(data);
  return result[0].insertId;
}

export async function getUpcomingEvents(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(gte(events.eventDate, new Date())).orderBy(asc(events.eventDate)).limit(limit);
}

export async function getEventsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.courseId, courseId)).orderBy(asc(events.eventDate));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(events).where(eq(events.id, id));
}

// ============ LIVE CLASS HELPERS ============

export async function createLiveClass(data: InsertLiveClass) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(liveClasses).values(data);
  return result[0].insertId;
}

export async function getUpcomingLiveClasses(courseId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [gte(liveClasses.scheduledAt, new Date()), eq(liveClasses.status, 'scheduled')];
  if (courseId) {
    conditions.push(eq(liveClasses.courseId, courseId));
  }
  
  return db.select().from(liveClasses).where(and(...conditions)).orderBy(asc(liveClasses.scheduledAt));
}

export async function updateLiveClassStatus(id: number, status: 'scheduled' | 'live' | 'completed' | 'cancelled') {
  const db = await getDb();
  if (!db) return;
  await db.update(liveClasses).set({ status }).where(eq(liveClasses.id, id));
}

// ============ CLASS SCHEDULE HELPERS ============

export async function createClassSchedule(data: InsertClassSchedule) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(classSchedule).values(data);
  return result[0].insertId;
}

export async function getClassSchedule(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classSchedule).where(eq(classSchedule.courseId, courseId));
}

// ============ MESSAGE HELPERS ============

export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getInbox(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.toUserId, userId)).orderBy(desc(messages.createdAt));
}

export async function getSentMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.fromUserId, userId)).orderBy(desc(messages.createdAt));
}

export async function markMessageRead(messageId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true, readAt: new Date() }).where(eq(messages.id, messageId));
}

export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(messages)
    .where(and(eq(messages.toUserId, userId), eq(messages.isRead, false)));
  return result[0]?.count || 0;
}

// ============ NOTIFICATION HELPERS ============

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  
  return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.userId, userId));
}

// ============ AIMVERSE HELPERS ============

export async function createAimverseEpisode(data: InsertAimverseEpisode) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(aimverseEpisodes).values(data);
  return result[0].insertId;
}

export async function updateAimverseEpisode(id: number, data: Partial<InsertAimverseEpisode>) {
  const db = await getDb();
  if (!db) return;
  await db.update(aimverseEpisodes).set(data).where(eq(aimverseEpisodes.id, id));
}

export async function getAimverseEpisodes(releasedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (releasedOnly) {
    return db.select().from(aimverseEpisodes).where(eq(aimverseEpisodes.isReleased, true)).orderBy(desc(aimverseEpisodes.releaseDate));
  }
  return db.select().from(aimverseEpisodes).orderBy(desc(aimverseEpisodes.createdAt));
}

export async function getAimverseEpisodeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aimverseEpisodes).where(eq(aimverseEpisodes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAimverseCard(data: InsertAimverseCard) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(aimverseCards).values(data);
  return result[0].insertId;
}

export async function getAimverseCards(episodeId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (episodeId) {
    return db.select().from(aimverseCards).where(eq(aimverseCards.episodeId, episodeId)).orderBy(asc(aimverseCards.orderIndex));
  }
  return db.select().from(aimverseCards).orderBy(desc(aimverseCards.createdAt));
}

export async function createAimversePrize(data: InsertAimversePrize) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(aimversePrizes).values(data);
  return result[0].insertId;
}

export async function getAimversePrizes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aimversePrizes).orderBy(desc(aimversePrizes.announcedAt));
}

// ============ DASHBOARD STATS HELPERS ============

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [
    totalStudents,
    totalCourses,
    totalEnrollments,
    activeEnrollments,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'student')),
    db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.status, 'published')),
    db.select({ count: sql<number>`count(*)` }).from(enrollments),
    db.select({ count: sql<number>`count(*)` }).from(enrollments).where(eq(enrollments.status, 'active')),
  ]);
  
  return {
    totalStudents: totalStudents[0]?.count || 0,
    totalCourses: totalCourses[0]?.count || 0,
    totalEnrollments: totalEnrollments[0]?.count || 0,
    activeEnrollments: activeEnrollments[0]?.count || 0,
  };
}

export async function getStudentDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [
    enrolledCourses,
    completedLessons,
    quizzesTaken,
    achievementsEarned,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(enrollments).where(and(eq(enrollments.userId, userId), eq(enrollments.status, 'active'))),
    db.select({ count: sql<number>`count(*)` }).from(lessonProgress).where(eq(lessonProgress.completed, true)),
    db.select({ count: sql<number>`count(*)` }).from(quizAttempts).where(eq(quizAttempts.userId, userId)),
    db.select({ count: sql<number>`count(*)` }).from(studentAchievements).where(eq(studentAchievements.userId, userId)),
  ]);
  
  return {
    enrolledCourses: enrolledCourses[0]?.count || 0,
    completedLessons: completedLessons[0]?.count || 0,
    quizzesTaken: quizzesTaken[0]?.count || 0,
    achievementsEarned: achievementsEarned[0]?.count || 0,
  };
}


// ============ CHAT GROUP HELPERS ============

export async function createChatGroup(data: {
  name: string;
  type: 'course' | 'section' | 'class' | 'custom';
  courseId?: number;
  createdBy: number;
  memberIds: number[];
  description?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(chatGroups).values({
    name: data.name,
    type: data.type,
    courseId: data.courseId,
    createdBy: data.createdBy,
    description: data.description,
  });
  
  const groupId = result[0].insertId;
  
  // Add creator as admin
  await db.insert(chatGroupMembers).values({
    groupId,
    userId: data.createdBy,
    role: 'admin',
  });
  
  // Add other members
  if (data.memberIds.length > 0) {
    const memberValues = data.memberIds
      .filter(id => id !== data.createdBy)
      .map(userId => ({
        groupId,
        userId,
        role: 'member' as const,
      }));
    
    if (memberValues.length > 0) {
      await db.insert(chatGroupMembers).values(memberValues);
    }
  }
  
  return { id: groupId, ...data };
}

export async function getChatGroup(groupId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(chatGroups).where(eq(chatGroups.id, groupId)).limit(1);
  if (result.length === 0) return null;
  
  const members = await db.select({
    userId: chatGroupMembers.userId,
    role: chatGroupMembers.role,
    userName: users.name,
  })
  .from(chatGroupMembers)
  .leftJoin(users, eq(chatGroupMembers.userId, users.id))
  .where(and(eq(chatGroupMembers.groupId, groupId), eq(chatGroupMembers.isActive, true)));
  
  return { ...result[0], members };
}

export async function getUserChatGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const memberGroups = await db.select({
    groupId: chatGroupMembers.groupId,
  })
  .from(chatGroupMembers)
  .where(and(eq(chatGroupMembers.userId, userId), eq(chatGroupMembers.isActive, true)));
  
  if (memberGroups.length === 0) return [];
  
  const groupIds = memberGroups.map(m => m.groupId);
  const groups = await db.select().from(chatGroups).where(inArray(chatGroups.id, groupIds));
  
  return groups;
}

export async function addGroupMembers(groupId: number, memberIds: number[]) {
  const db = await getDb();
  if (!db) return;
  
  const values = memberIds.map(userId => ({
    groupId,
    userId,
    role: 'member' as const,
  }));
  
  await db.insert(chatGroupMembers).values(values);
}

export async function removeGroupMembers(groupId: number, memberIds: number[]) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(chatGroupMembers)
    .set({ isActive: false, leftAt: new Date() })
    .where(and(
      eq(chatGroupMembers.groupId, groupId),
      inArray(chatGroupMembers.userId, memberIds)
    ));
}

export async function saveDirectMessage(data: { fromUserId: number; toUserId: number; content: string }) {
  const db = await getDb();
  if (!db) return { id: 0 };
  
  const result = await db.insert(messages).values({
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    content: data.content,
  });
  
  return { id: result[0].insertId };
}

export async function saveGroupMessage(data: { groupId: number; senderId: number; content: string }) {
  const db = await getDb();
  if (!db) return { id: 0 };
  
  const result = await db.insert(groupMessages).values({
    groupId: data.groupId,
    senderId: data.senderId,
    content: data.content,
  });
  
  return { id: result[0].insertId };
}

export async function getDirectMessages(userId1: number, userId2: number, limit = 50, before?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    id: messages.id,
    fromUserId: messages.fromUserId,
    toUserId: messages.toUserId,
    content: messages.content,
    createdAt: messages.createdAt,
    isRead: messages.isRead,
    senderName: users.name,
  })
  .from(messages)
  .leftJoin(users, eq(messages.fromUserId, users.id))
  .where(
    or(
      and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
      and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
    )
  )
  .orderBy(desc(messages.createdAt))
  .limit(limit);
  
  return query;
}

export async function getGroupMessages(groupId: number, limit = 50, before?: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: groupMessages.id,
    groupId: groupMessages.groupId,
    senderId: groupMessages.senderId,
    content: groupMessages.content,
    createdAt: groupMessages.createdAt,
    senderName: users.name,
  })
  .from(groupMessages)
  .leftJoin(users, eq(groupMessages.senderId, users.id))
  .where(eq(groupMessages.groupId, groupId))
  .orderBy(desc(groupMessages.createdAt))
  .limit(limit);
}

export async function markMessagesAsRead(messageIds: number[], userId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Mark direct messages as read
  await db.update(messages)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      inArray(messages.id, messageIds),
      eq(messages.toUserId, userId)
    ));
}


// ============ CATEGORY HELPERS ============

// Course Categories
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseCategories).where(eq(courseCategories.isActive, true)).orderBy(asc(courseCategories.orderIndex));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courseCategories).where(eq(courseCategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courseCategories).where(eq(courseCategories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCourseCategory) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(courseCategories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: Partial<InsertCourseCategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseCategories).set(data).where(eq(courseCategories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  // Soft delete by setting isActive to false
  await db.update(courseCategories).set({ isActive: false }).where(eq(courseCategories.id, id));
}

// Course Subcategories
export async function getSubcategoriesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseSubcategories)
    .where(and(eq(courseSubcategories.categoryId, categoryId), eq(courseSubcategories.isActive, true)))
    .orderBy(asc(courseSubcategories.orderIndex));
}

export async function getSubcategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courseSubcategories).where(eq(courseSubcategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubcategory(data: InsertCourseSubcategory) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(courseSubcategories).values(data);
  return result[0].insertId;
}

export async function updateSubcategory(id: number, data: Partial<InsertCourseSubcategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseSubcategories).set(data).where(eq(courseSubcategories.id, id));
}

export async function deleteSubcategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseSubcategories).set({ isActive: false }).where(eq(courseSubcategories.id, id));
}

// Course Sections
export async function getSectionsBySubcategory(subcategoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseSections)
    .where(and(eq(courseSections.subcategoryId, subcategoryId), eq(courseSections.isActive, true)))
    .orderBy(asc(courseSections.orderIndex));
}

export async function getSectionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courseSections).where(eq(courseSections.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSection(data: InsertCourseSection) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(courseSections).values(data);
  return result[0].insertId;
}

export async function updateSection(id: number, data: Partial<InsertCourseSection>) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseSections).set(data).where(eq(courseSections.id, id));
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseSections).set({ isActive: false }).where(eq(courseSections.id, id));
}

// Get full category hierarchy
export async function getCategoryHierarchy() {
  const db = await getDb();
  if (!db) return [];
  
  const categories = await getAllCategories();
  const result = [];
  
  for (const category of categories) {
    const subcategories = await getSubcategoriesByCategory(category.id);
    const subcatsWithSections = [];
    
    for (const subcat of subcategories) {
      const sections = await getSectionsBySubcategory(subcat.id);
      subcatsWithSections.push({
        ...subcat,
        sections
      });
    }
    
    result.push({
      ...category,
      subcategories: subcatsWithSections
    });
  }
  
  return result;
}

// Get courses by category
export async function getCoursesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses)
    .where(and(eq(courses.categoryId, categoryId), eq(courses.status, 'published')))
    .orderBy(desc(courses.createdAt));
}

export async function getCoursesBySubcategory(subcategoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses)
    .where(and(eq(courses.subcategoryId, subcategoryId), eq(courses.status, 'published')))
    .orderBy(desc(courses.createdAt));
}

export async function getCoursesBySection(sectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses)
    .where(and(eq(courses.sectionId, sectionId), eq(courses.status, 'published')))
    .orderBy(desc(courses.createdAt));
}


// ============ WISHLIST HELPERS ============

export async function addToWishlist(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already in wishlist
  const existing = await db.select().from(courseWishlist)
    .where(and(eq(courseWishlist.userId, userId), eq(courseWishlist.courseId, courseId)))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0].id; // Already in wishlist
  }
  
  const result = await db.insert(courseWishlist).values({ userId, courseId });
  return result[0].insertId;
}

export async function removeFromWishlist(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(courseWishlist)
    .where(and(eq(courseWishlist.userId, userId), eq(courseWishlist.courseId, courseId)));
}

export async function isInWishlist(userId: number, courseId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(courseWishlist)
    .where(and(eq(courseWishlist.userId, userId), eq(courseWishlist.courseId, courseId)))
    .limit(1);
  
  return result.length > 0;
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get wishlist items with course details
  const wishlistItems = await db.select({
    wishlistId: courseWishlist.id,
    courseId: courseWishlist.courseId,
    addedAt: courseWishlist.createdAt,
    course: courses,
  })
  .from(courseWishlist)
  .innerJoin(courses, eq(courseWishlist.courseId, courses.id))
  .where(eq(courseWishlist.userId, userId))
  .orderBy(desc(courseWishlist.createdAt));
  
  return wishlistItems;
}

export async function getUserWishlistCourseIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({ courseId: courseWishlist.courseId })
    .from(courseWishlist)
    .where(eq(courseWishlist.userId, userId));
  
  return result.map(r => r.courseId);
}
