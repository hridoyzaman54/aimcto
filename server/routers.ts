import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, studentProcedure, parentProcedure, staffProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as auth from "./auth";

export const appRouter = router({
  system: systemRouter,
  
  // ============ AUTH ROUTER ============
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      // Check for JWT token in cookie first (email/password auth)
      const authToken = ctx.req.cookies['auth_token'];
      if (authToken) {
        const user = await auth.getUserFromToken(authToken);
        if (user) return user;
      }
      // Fall back to OAuth user
      return ctx.user;
    }),
    
    signup: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
      phone: z.string().optional(),
      adminCode: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const result = await auth.signupUser(input);
      if (result.success && result.token) {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('auth_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
      }
      return result;
    }),
    
    login: publicProcedure.input(z.object({
      email: z.string().optional(),
      phone: z.string().optional(),
      password: z.string(),
    })).mutation(async ({ ctx, input }) => {
      if (!input.email && !input.phone) {
        return { success: false, error: 'Email or phone is required' };
      }
      const result = await auth.loginUser(input);
      if (result.success && result.token) {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('auth_token', result.token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
      }
      return result;
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie('auth_token', { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ USER ROUTER ============
  user: router({
    getAll: adminProcedure.input(z.object({ role: z.string().optional() }).optional()).query(async ({ input }) => {
      return db.getAllUsers(input?.role);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getUserById(input.id);
    }),
    
    updateRole: adminProcedure.input(z.object({
      userId: z.number(),
      role: z.enum(['user', 'admin', 'student', 'parent', 'teacher']),
    })).mutation(async ({ input }) => {
      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),
    
    updateProfile: protectedProcedure.input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      grade: z.string().optional(),
      occupation: z.string().optional(),
      address: z.string().optional(),
      avatarUrl: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const updateData: any = { ...input };
      if (input.dateOfBirth) {
        updateData.dateOfBirth = new Date(input.dateOfBirth);
      }
      await db.updateUserProfile(ctx.user.id, updateData);
      return { success: true };
    }),
    
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),
    
    getByStudentUid: protectedProcedure.input(z.object({ uid: z.string() })).query(async ({ input }) => {
      return db.getUserByStudentUid(input.uid);
    }),
  }),

  // ============ PARENT-STUDENT LINK ROUTER ============
  parentStudent: router({
    verifyAndLink: parentProcedure.input(z.object({ studentUid: z.string() })).mutation(async ({ ctx, input }) => {
      return db.verifyParentStudentLink(ctx.user.id, input.studentUid);
    }),
    
    getLinkedStudents: parentProcedure.query(async ({ ctx }) => {
      return db.getLinkedStudents(ctx.user.id);
    }),
  }),

  // ============ COURSE ROUTER ============
  course: router({
    create: adminProcedure.input(z.object({
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      thumbnail: z.string().optional(),
      price: z.string().optional(),
      durationMonths: z.number().default(3),
      category: z.string().optional(),
      categoryId: z.number().optional(),
      subcategoryId: z.number().optional(),
      sectionId: z.number().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createCourse(input);
      return { success: true, id };
    }),
    
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      thumbnail: z.string().optional(),
      price: z.string().optional(),
      durationMonths: z.number().optional(),
      category: z.string().optional(),
      categoryId: z.number().optional(),
      subcategoryId: z.number().optional(),
      sectionId: z.number().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCourse(id, data);
      return { success: true };
    }),
    
    // Get courses by category
    getByCategory: publicProcedure.input(z.object({ categoryId: z.number() })).query(async ({ input }) => {
      return db.getCoursesByCategory(input.categoryId);
    }),
    
    // Get courses by subcategory
    getBySubcategory: publicProcedure.input(z.object({ subcategoryId: z.number() })).query(async ({ input }) => {
      return db.getCoursesBySubcategory(input.subcategoryId);
    }),
    
    // Get courses by section
    getBySection: publicProcedure.input(z.object({ sectionId: z.number() })).query(async ({ input }) => {
      return db.getCoursesBySection(input.sectionId);
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCourse(input.id);
      return { success: true };
    }),
    
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getCourseById(input.id);
    }),
    
    getAll: publicProcedure.input(z.object({ 
      status: z.enum(['draft', 'published', 'archived']).optional() 
    }).optional()).query(async ({ input }) => {
      return db.getAllCourses(input?.status);
    }),
    
    getPublished: publicProcedure.query(async () => {
      return db.getPublishedCourses();
    }),
  }),

  // ============ LESSON ROUTER ============
  lesson: router({
    create: adminProcedure.input(z.object({
      courseId: z.number(),
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      orderIndex: z.number().optional(),
      contentType: z.enum(['video', 'pdf', 'text', 'mixed']).optional(),
      videoUrl: z.string().optional(),
      duration: z.number().optional(),
      isPreview: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createLesson(input);
      return { success: true, id };
    }),
    
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      orderIndex: z.number().optional(),
      contentType: z.enum(['video', 'pdf', 'text', 'mixed']).optional(),
      videoUrl: z.string().optional(),
      duration: z.number().optional(),
      isPreview: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateLesson(id, data);
      return { success: true };
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteLesson(input.id);
      return { success: true };
    }),
    
    getByCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getLessonsByCourse(input.courseId);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getLessonById(input.id);
    }),
    
    // Lesson materials
    addMaterial: adminProcedure.input(z.object({
      lessonId: z.number(),
      title: z.string(),
      type: z.enum(['pdf', 'doc', 'pptx', 'image', 'video', 'audio', 'link']),
      fileUrl: z.string(),
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      orderIndex: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.addLessonMaterial(input);
      return { success: true, id };
    }),
    
    getMaterials: protectedProcedure.input(z.object({ lessonId: z.number() })).query(async ({ input }) => {
      return db.getLessonMaterials(input.lessonId);
    }),
    
    deleteMaterial: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteLessonMaterial(input.id);
      return { success: true };
    }),
  }),

  // ============ WISHLIST ROUTER ============
  wishlist: router({
    add: protectedProcedure.input(z.object({
      courseId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.addToWishlist(ctx.user.id, input.courseId);
      return { success: true, id };
    }),
    
    remove: protectedProcedure.input(z.object({
      courseId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await db.removeFromWishlist(ctx.user.id, input.courseId);
      return { success: true };
    }),
    
    toggle: protectedProcedure.input(z.object({
      courseId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const isWishlisted = await db.isInWishlist(ctx.user.id, input.courseId);
      if (isWishlisted) {
        await db.removeFromWishlist(ctx.user.id, input.courseId);
        return { success: true, isWishlisted: false };
      } else {
        await db.addToWishlist(ctx.user.id, input.courseId);
        return { success: true, isWishlisted: true };
      }
    }),
    
    check: protectedProcedure.input(z.object({
      courseId: z.number(),
    })).query(async ({ ctx, input }) => {
      const isWishlisted = await db.isInWishlist(ctx.user.id, input.courseId);
      return { isWishlisted };
    }),
    
    getMyWishlist: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWishlist(ctx.user.id);
    }),
    
    getMyWishlistIds: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWishlistCourseIds(ctx.user.id);
    }),
  }),

  // ============ ENROLLMENT ROUTER ============
  enrollment: router({
    enroll: protectedProcedure.input(z.object({
      courseId: z.number(),
      paymentId: z.string().optional(),
      paymentAmount: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const course = await db.getCourseById(input.courseId);
      if (!course) throw new Error("Course not found");
      
      const id = await db.enrollStudent(
        ctx.user.id, 
        input.courseId, 
        course.durationMonths,
        input.paymentId,
        input.paymentAmount
      );
      return { success: true, id };
    }),
    
    // Admin manual enrollment
    adminEnroll: adminProcedure.input(z.object({
      userId: z.number(),
      courseId: z.number(),
      durationMonths: z.number().optional(),
    })).mutation(async ({ input }) => {
      const course = await db.getCourseById(input.courseId);
      if (!course) throw new Error("Course not found");
      
      const id = await db.enrollStudent(
        input.userId, 
        input.courseId, 
        input.durationMonths || course.durationMonths
      );
      return { success: true, id };
    }),
    
    getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
      return db.getEnrollmentsByUser(ctx.user.id);
    }),
    
    getByCourse: staffProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getEnrollmentsByCourse(input.courseId);
    }),
    
    checkAccess: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ ctx, input }) => {
      const enrollment = await db.getActiveEnrollment(ctx.user.id, input.courseId);
      return { hasAccess: !!enrollment, enrollment };
    }),
    
    updateProgress: studentProcedure.input(z.object({
      enrollmentId: z.number(),
      progressPercent: z.number(),
    })).mutation(async ({ input }) => {
      await db.updateEnrollmentProgress(input.enrollmentId, input.progressPercent);
      return { success: true };
    }),
  }),

  // ============ LESSON PROGRESS ROUTER ============
  progress: router({
    update: studentProcedure.input(z.object({
      enrollmentId: z.number(),
      lessonId: z.number(),
      progressPercent: z.number().optional(),
      watchedDuration: z.number().optional(),
      lastPosition: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { enrollmentId, lessonId, ...data } = input;
      await db.updateLessonProgress(enrollmentId, lessonId, data);
      return { success: true };
    }),
    
    markComplete: studentProcedure.input(z.object({
      enrollmentId: z.number(),
      lessonId: z.number(),
    })).mutation(async ({ input }) => {
      await db.markLessonComplete(input.enrollmentId, input.lessonId);
      return { success: true };
    }),
    
    getByEnrollment: protectedProcedure.input(z.object({ enrollmentId: z.number() })).query(async ({ input }) => {
      return db.getLessonProgressByEnrollment(input.enrollmentId);
    }),
  }),

  // ============ STUDENT NOTES ROUTER ============
  notes: router({
    save: studentProcedure.input(z.object({
      lessonId: z.number(),
      content: z.string(),
      autoGenerated: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.saveStudentNote(ctx.user.id, input.lessonId, input.content, input.autoGenerated);
      return { success: true, id };
    }),
    
    getByLesson: studentProcedure.input(z.object({ lessonId: z.number() })).query(async ({ ctx, input }) => {
      return db.getStudentNotes(ctx.user.id, input.lessonId);
    }),
    
    getAll: studentProcedure.query(async ({ ctx }) => {
      return db.getStudentNotes(ctx.user.id);
    }),
  }),

  // ============ QUIZ ROUTER ============
  quiz: router({
    // Admin CRUD operations
    create: adminProcedure.input(z.object({
      courseId: z.number().optional(),
      lessonId: z.number().optional(),
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      durationMinutes: z.number().optional(),
      passingScore: z.number().optional(),
      totalMarks: z.number().optional(),
      shuffleQuestions: z.boolean().optional(),
      showResults: z.boolean().optional(),
      showCorrectAnswers: z.boolean().optional(),
      maxAttempts: z.number().optional(),
      announcementDate: z.string().optional(),
      availableFrom: z.string().optional(),
      availableUntil: z.string().optional(),
      categoryId: z.number().optional(),
      subcategoryId: z.number().optional(),
      sectionId: z.number().optional(),
      targetClass: z.string().optional(),
      targetSection: z.string().optional(),
      allowHandwrittenUpload: z.boolean().optional(),
      requireHandwrittenUpload: z.boolean().optional(),
      autoGrade: z.boolean().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    })).mutation(async ({ ctx, input }) => {
      const data: any = { ...input, createdBy: ctx.user.id };
      if (input.announcementDate) data.announcementDate = new Date(input.announcementDate);
      if (input.availableFrom) data.availableFrom = new Date(input.availableFrom);
      if (input.availableUntil) data.availableUntil = new Date(input.availableUntil);
      const id = await db.createQuiz(data);
      return { success: true, id };
    }),
    
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      durationMinutes: z.number().optional(),
      passingScore: z.number().optional(),
      totalMarks: z.number().optional(),
      shuffleQuestions: z.boolean().optional(),
      showResults: z.boolean().optional(),
      showCorrectAnswers: z.boolean().optional(),
      maxAttempts: z.number().optional(),
      announcementDate: z.string().optional(),
      availableFrom: z.string().optional(),
      availableUntil: z.string().optional(),
      categoryId: z.number().optional(),
      subcategoryId: z.number().optional(),
      sectionId: z.number().optional(),
      targetClass: z.string().optional(),
      targetSection: z.string().optional(),
      allowHandwrittenUpload: z.boolean().optional(),
      requireHandwrittenUpload: z.boolean().optional(),
      autoGrade: z.boolean().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...inputData } = input;
      const data: any = { ...inputData };
      if (input.announcementDate) data.announcementDate = new Date(input.announcementDate);
      if (input.availableFrom) data.availableFrom = new Date(input.availableFrom);
      if (input.availableUntil) data.availableUntil = new Date(input.availableUntil);
      await db.updateQuiz(id, data);
      return { success: true };
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteQuiz(input.id);
      return { success: true };
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getQuizById(input.id);
    }),
    
    getAll: adminProcedure.input(z.object({
      status: z.string().optional(),
      categoryId: z.number().optional(),
      courseId: z.number().optional(),
      targetClass: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAllQuizzes(input);
    }),
    
    getByCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getQuizzesByCourse(input.courseId);
    }),
    
    getWithQuestions: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getQuizWithQuestions(input.id);
    }),
    
    // Questions
    addQuestion: adminProcedure.input(z.object({
      quizId: z.number(),
      question: z.string(),
      questionBn: z.string().optional(),
      questionType: z.enum(['mcq', 'true_false', 'short_answer', 'long_answer', 'fill_blank']).optional(),
      options: z.any().optional(),
      correctAnswer: z.string().optional(),
      answerGuideline: z.string().optional(),
      marks: z.number().optional(),
      negativeMarks: z.string().optional(),
      explanation: z.string().optional(),
      imageUrl: z.string().optional(),
      orderIndex: z.number().optional(),
      isRequired: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.addQuizQuestion(input);
      return { success: true, id };
    }),
    
    updateQuestion: adminProcedure.input(z.object({
      id: z.number(),
      question: z.string().optional(),
      questionBn: z.string().optional(),
      questionType: z.enum(['mcq', 'true_false', 'short_answer', 'long_answer', 'fill_blank']).optional(),
      options: z.any().optional(),
      correctAnswer: z.string().optional(),
      answerGuideline: z.string().optional(),
      marks: z.number().optional(),
      negativeMarks: z.string().optional(),
      explanation: z.string().optional(),
      imageUrl: z.string().optional(),
      orderIndex: z.number().optional(),
      isRequired: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateQuizQuestion(id, data);
      return { success: true };
    }),
    
    getQuestions: protectedProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => {
      return db.getQuizQuestions(input.quizId);
    }),
    
    deleteQuestion: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteQuizQuestion(input.id);
      return { success: true };
    }),
    
    // Student quiz taking
    getAvailable: studentProcedure.input(z.object({
      categoryId: z.number().optional(),
      courseId: z.number().optional(),
    }).optional()).query(async ({ ctx, input }) => {
      return db.getAvailableQuizzesForStudent(ctx.user.id, input);
    }),
    
    startAttempt: studentProcedure.input(z.object({ quizId: z.number() })).mutation(async ({ ctx, input }) => {
      const id = await db.startQuizAttempt(input.quizId, ctx.user.id);
      return { success: true, attemptId: id };
    }),
    
    submitAttempt: studentProcedure.input(z.object({
      attemptId: z.number(),
      answers: z.record(z.string(), z.string()),
      handwrittenUploadUrl: z.string().optional(),
      handwrittenUploadName: z.string().optional(),
      isAutoSubmitted: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const result = await db.submitQuizAttemptEnhanced(
        input.attemptId, 
        input.answers,
        input.handwrittenUploadUrl,
        input.handwrittenUploadName,
        input.isAutoSubmitted
      );
      return { success: true, ...result };
    }),
    
    // Legacy submit (for backward compatibility)
    submitAttemptLegacy: studentProcedure.input(z.object({
      attemptId: z.number(),
      answers: z.any(),
      score: z.number(),
      totalMarks: z.number(),
    })).mutation(async ({ input }) => {
      await db.submitQuizAttempt(input.attemptId, input.answers, input.score, input.totalMarks);
      return { success: true };
    }),
    
    getMyAttempts: studentProcedure.input(z.object({ quizId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getQuizAttempts(ctx.user.id, input?.quizId);
    }),
    
    // Admin grading
    getAttemptsByQuiz: adminProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => {
      return db.getQuizAttemptsByQuiz(input.quizId);
    }),
    
    getAttemptForGrading: adminProcedure.input(z.object({ attemptId: z.number() })).query(async ({ input }) => {
      return db.getAttemptForGrading(input.attemptId);
    }),
    
    gradeAnswer: adminProcedure.input(z.object({
      gradeId: z.number(),
      marksAwarded: z.number(),
      feedback: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.gradeAnswer(input.gradeId, input.marksAwarded, input.feedback || null, ctx.user.id);
      return { success: true };
    }),
    
    finalizeGrading: adminProcedure.input(z.object({
      attemptId: z.number(),
      feedback: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.finalizeAttemptGrading(input.attemptId, input.feedback || null, ctx.user.id);
      return { success: true, ...result };
    }),
    
    getPendingGrading: adminProcedure.query(async () => {
      return db.getPendingGradingAttempts();
    }),
  }),

  // ============ ASSIGNMENT ROUTER ============
  assignment: router({
    create: adminProcedure.input(z.object({
      courseId: z.number(),
      lessonId: z.number().optional(),
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      totalMarks: z.number().optional(),
      startDate: z.date().optional(),
      dueDate: z.date().optional(),
      allowLateSubmission: z.boolean().optional(),
      attachmentUrl: z.string().optional(),
      status: z.enum(['draft', 'published', 'closed']).optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAssignment(input);
      return { success: true, id };
    }),
    
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      totalMarks: z.number().optional(),
      startDate: z.date().optional(),
      dueDate: z.date().optional(),
      allowLateSubmission: z.boolean().optional(),
      attachmentUrl: z.string().optional(),
      status: z.enum(['draft', 'published', 'closed']).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAssignment(id, data);
      return { success: true };
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteAssignment(input.id);
      return { success: true };
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getAssignmentById(input.id);
    }),
    
    getByCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getAssignmentsByCourse(input.courseId);
    }),
    
    // Submissions
    submit: studentProcedure.input(z.object({
      assignmentId: z.number(),
      fileUrl: z.string().optional(),
      content: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.submitAssignment({ ...input, userId: ctx.user.id });
      return { success: true, id };
    }),
    
    getSubmissions: staffProcedure.input(z.object({ assignmentId: z.number() })).query(async ({ input }) => {
      return db.getAssignmentSubmissions(input.assignmentId);
    }),
    
    getMySubmissions: studentProcedure.query(async ({ ctx }) => {
      return db.getStudentSubmissions(ctx.user.id);
    }),
    
    getMyAssignments: studentProcedure.query(async ({ ctx }) => {
      return db.getStudentAssignments(ctx.user.id);
    }),
    
    grade: staffProcedure.input(z.object({
      submissionId: z.number(),
      score: z.number(),
      feedback: z.string(),
    })).mutation(async ({ ctx, input }) => {
      await db.gradeSubmission(input.submissionId, input.score, input.feedback, ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ ATTENDANCE ROUTER ============
  attendance: router({
    mark: staffProcedure.input(z.object({
      userId: z.number(),
      courseId: z.number(),
      classDate: z.date(),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      remarks: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.markAttendance({ ...input, markedBy: ctx.user.id });
      return { success: true, id };
    }),
    
    getByStudent: protectedProcedure.input(z.object({ 
      userId: z.number().optional(),
      courseId: z.number().optional() 
    }).optional()).query(async ({ ctx, input }) => {
      const userId = input?.userId || ctx.user.id;
      return db.getAttendanceByStudent(userId, input?.courseId);
    }),
    
    getByCourse: staffProcedure.input(z.object({ 
      courseId: z.number(),
      date: z.date().optional(),
    })).query(async ({ input }) => {
      return db.getAttendanceByCourse(input.courseId, input.date);
    }),
  }),

  // ============ TEACHER REMARKS ROUTER ============
  remarks: router({
    add: staffProcedure.input(z.object({
      studentId: z.number(),
      courseId: z.number().optional(),
      remark: z.string(),
      remarkType: z.enum(['general', 'performance', 'behavior', 'improvement']).optional(),
      isPrivate: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.addTeacherRemark({ ...input, teacherId: ctx.user.id });
      return { success: true, id };
    }),
    
    getByStudent: protectedProcedure.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
      return db.getRemarksByStudent(input.studentId);
    }),
    
    getByCourse: staffProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getRemarksByCourse(input.courseId);
    }),
  }),

  // ============ ACHIEVEMENT ROUTER ============
  achievement: router({
    create: adminProcedure.input(z.object({
      name: z.string(),
      nameBn: z.string().optional(),
      description: z.string().optional(),
      iconUrl: z.string().optional(),
      badgeColor: z.string().optional(),
      criteria: z.string().optional(),
      points: z.number().optional(),
      category: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAchievement(input);
      return { success: true, id };
    }),
    
    getAll: publicProcedure.query(async () => {
      return db.getAllAchievements();
    }),
    
    award: staffProcedure.input(z.object({
      userId: z.number(),
      achievementId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await db.awardAchievement(input.userId, input.achievementId, ctx.user.id);
      return { success: true };
    }),
    
    getStudentAchievements: protectedProcedure.input(z.object({ userId: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
      const userId = input?.userId || ctx.user.id;
      return db.getStudentAchievements(userId);
    }),
  }),

  // ============ GAME SCORE ROUTER ============
  game: router({
    saveScore: studentProcedure.input(z.object({
      gameName: z.string(),
      score: z.number(),
      level: z.number().optional(),
      metadata: z.any().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.saveGameScore({ ...input, userId: ctx.user.id });
      return { success: true, id };
    }),
    
    getMyScores: studentProcedure.input(z.object({ gameName: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getGameScores(ctx.user.id, input?.gameName);
    }),
    
    getLeaderboard: publicProcedure.input(z.object({ 
      gameName: z.string(),
      limit: z.number().optional(),
    })).query(async ({ input }) => {
      return db.getLeaderboard(input.gameName, input.limit);
    }),
  }),

  // ============ ANNOUNCEMENT ROUTER ============
  announcement: router({
    create: adminProcedure.input(z.object({
      title: z.string(),
      titleBn: z.string().optional(),
      content: z.string(),
      contentBn: z.string().optional(),
      targetAudience: z.enum(['all', 'students', 'parents', 'teachers', 'course_specific']).optional(),
      courseId: z.number().optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      isPinned: z.boolean().optional(),
      publishedAt: z.date().optional(),
      expiresAt: z.date().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createAnnouncement({ ...input, createdBy: ctx.user.id });
      return { success: true, id };
    }),
    
    getAll: protectedProcedure.input(z.object({
      audience: z.string().optional(),
      courseId: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAnnouncements(input?.audience, input?.courseId);
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteAnnouncement(input.id);
      return { success: true };
    }),
  }),

  // ============ EVENT ROUTER ============
  event: router({
    create: adminProcedure.input(z.object({
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      eventType: z.enum(['exam', 'quiz', 'holiday', 'meeting', 'workshop', 'competition', 'other']).optional(),
      eventDate: z.date(),
      endDate: z.date().optional(),
      location: z.string().optional(),
      isOnline: z.boolean().optional(),
      meetingLink: z.string().optional(),
      targetAudience: z.enum(['all', 'students', 'parents', 'teachers', 'course_specific']).optional(),
      courseId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createEvent({ ...input, createdBy: ctx.user.id });
      return { success: true, id };
    }),
    
    getUpcoming: publicProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(async ({ input }) => {
      return db.getUpcomingEvents(input?.limit);
    }),
    
    getByCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getEventsByCourse(input.courseId);
    }),
    
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteEvent(input.id);
      return { success: true };
    }),
  }),

  // ============ LIVE CLASS ROUTER ============
  liveClass: router({
    create: adminProcedure.input(z.object({
      courseId: z.number(),
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      scheduledAt: z.date(),
      durationMinutes: z.number().optional(),
      meetingLink: z.string().optional(),
      meetingId: z.string().optional(),
      meetingPassword: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createLiveClass({ ...input, hostId: ctx.user.id });
      return { success: true, id };
    }),
    
    getUpcoming: protectedProcedure.input(z.object({ courseId: z.number().optional() }).optional()).query(async ({ input }) => {
      return db.getUpcomingLiveClasses(input?.courseId);
    }),
    
    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
    })).mutation(async ({ input }) => {
      await db.updateLiveClassStatus(input.id, input.status);
      return { success: true };
    }),
  }),

  // ============ CLASS SCHEDULE ROUTER ============
  schedule: router({
    create: adminProcedure.input(z.object({
      courseId: z.number(),
      dayOfWeek: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
      startTime: z.string(),
      endTime: z.string(),
      roomOrLink: z.string().optional(),
      instructorId: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createClassSchedule(input);
      return { success: true, id };
    }),
    
    getByCourse: protectedProcedure.input(z.object({ courseId: z.number() })).query(async ({ input }) => {
      return db.getClassSchedule(input.courseId);
    }),
  }),

  // ============ MESSAGE ROUTER ============
  message: router({
    send: protectedProcedure.input(z.object({
      toUserId: z.number(),
      subject: z.string().optional(),
      content: z.string(),
      attachmentUrl: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.sendMessage({ ...input, fromUserId: ctx.user.id });
      return { success: true, id };
    }),
    
    getInbox: protectedProcedure.query(async ({ ctx }) => {
      return db.getInbox(ctx.user.id);
    }),
    
    getSent: protectedProcedure.query(async ({ ctx }) => {
      return db.getSentMessages(ctx.user.id);
    }),
    
    markRead: protectedProcedure.input(z.object({ messageId: z.number() })).mutation(async ({ input }) => {
      await db.markMessageRead(input.messageId);
      return { success: true };
    }),
    
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadCount(ctx.user.id);
    }),
  }),

  // ============ NOTIFICATION ROUTER ============
  notification: router({
    create: protectedProcedure.input(z.object({
      userId: z.number(),
      title: z.string(),
      content: z.string().optional(),
      type: z.enum(['info', 'warning', 'success', 'error', 'reminder']).optional(),
      category: z.string().optional(),
      relatedId: z.number().optional(),
      relatedType: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createNotification(input);
      return { success: true, id };
    }),
    
    getMyNotifications: protectedProcedure.input(z.object({ unreadOnly: z.boolean().optional() }).optional()).query(async ({ ctx, input }) => {
      return db.getUserNotifications(ctx.user.id, input?.unreadOnly);
    }),
    
    markRead: protectedProcedure.input(z.object({ notificationId: z.number() })).mutation(async ({ input }) => {
      await db.markNotificationRead(input.notificationId);
      return { success: true };
    }),
    
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ AIMVERSE ROUTER ============
  aimverse: router({
    // Episodes
    createEpisode: adminProcedure.input(z.object({
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      episodeNumber: z.number().optional(),
      seasonNumber: z.number().optional(),
      thumbnailUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      trailerUrl: z.string().optional(),
      duration: z.number().optional(),
      releaseDate: z.date().optional(),
      isReleased: z.boolean().optional(),
      status: z.enum(['upcoming', 'released', 'archived']).optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAimverseEpisode(input);
      return { success: true, id };
    }),
    
    updateEpisode: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      episodeNumber: z.number().optional(),
      seasonNumber: z.number().optional(),
      thumbnailUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      trailerUrl: z.string().optional(),
      duration: z.number().optional(),
      releaseDate: z.date().optional(),
      isReleased: z.boolean().optional(),
      status: z.enum(['upcoming', 'released', 'archived']).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAimverseEpisode(id, data);
      return { success: true };
    }),
    
    getEpisodes: publicProcedure.input(z.object({ releasedOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
      return db.getAimverseEpisodes(input?.releasedOnly);
    }),
    
    getEpisodeById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getAimverseEpisodeById(input.id);
    }),
    
    // Cards
    createCard: adminProcedure.input(z.object({
      episodeId: z.number().optional(),
      title: z.string(),
      titleBn: z.string().optional(),
      content: z.string().optional(),
      contentBn: z.string().optional(),
      cardType: z.enum(['character', 'power', 'lesson', 'fact', 'quiz']).optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      metadata: z.any().optional(),
      orderIndex: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAimverseCard(input);
      return { success: true, id };
    }),
    
    getCards: publicProcedure.input(z.object({ episodeId: z.number().optional() }).optional()).query(async ({ input }) => {
      return db.getAimverseCards(input?.episodeId);
    }),
    
    // Prizes
    createPrize: adminProcedure.input(z.object({
      title: z.string(),
      titleBn: z.string().optional(),
      description: z.string().optional(),
      prizeType: z.enum(['quiz', 'competition', 'achievement', 'special']).optional(),
      winnerId: z.number().optional(),
      episodeId: z.number().optional(),
      announcedAt: z.date().optional(),
      prizeDetails: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAimversePrize(input);
      return { success: true, id };
    }),
    
    getPrizes: publicProcedure.query(async () => {
      return db.getAimversePrizes();
    }),
  }),

  // ============ DASHBOARD STATS ROUTER ============
  dashboard: router({
    adminStats: adminProcedure.query(async () => {
      return db.getAdminDashboardStats();
    }),
    
    studentStats: studentProcedure.query(async ({ ctx }) => {
      return db.getStudentDashboardStats(ctx.user.id);
    }),
  }),

  // ============ CATEGORY ROUTER ============
  category: router({
    // Get all categories
    getAll: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    
    // Get category by ID
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getCategoryById(input.id);
    }),
    
    // Get category by slug
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getCategoryBySlug(input.slug);
    }),
    
    // Get full category hierarchy (categories -> subcategories -> sections)
    getHierarchy: publicProcedure.query(async () => {
      return db.getCategoryHierarchy();
    }),
    
    // Create category (admin only)
    create: adminProcedure.input(z.object({
      name: z.string(),
      nameBn: z.string().optional(),
      slug: z.string(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      orderIndex: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createCategory(input);
      return { success: true, id };
    }),
    
    // Update category (admin only)
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameBn: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      orderIndex: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, data);
      return { success: true };
    }),
    
    // Delete category (admin only)
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
  }),

  // ============ SUBCATEGORY ROUTER ============
  subcategory: router({
    // Get subcategories by category
    getByCategory: publicProcedure.input(z.object({ categoryId: z.number() })).query(async ({ input }) => {
      return db.getSubcategoriesByCategory(input.categoryId);
    }),
    
    // Get subcategory by ID
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getSubcategoryById(input.id);
    }),
    
    // Create subcategory (admin only)
    create: adminProcedure.input(z.object({
      categoryId: z.number(),
      name: z.string(),
      nameBn: z.string().optional(),
      slug: z.string(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      orderIndex: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createSubcategory(input);
      return { success: true, id };
    }),
    
    // Update subcategory (admin only)
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameBn: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      descriptionBn: z.string().optional(),
      orderIndex: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSubcategory(id, data);
      return { success: true };
    }),
    
    // Delete subcategory (admin only)
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteSubcategory(input.id);
      return { success: true };
    }),
  }),

  // ============ SECTION ROUTER ============
  section: router({
    // Get sections by subcategory
    getBySubcategory: publicProcedure.input(z.object({ subcategoryId: z.number() })).query(async ({ input }) => {
      return db.getSectionsBySubcategory(input.subcategoryId);
    }),
    
    // Get section by ID
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getSectionById(input.id);
    }),
    
    // Create section (admin only)
    create: adminProcedure.input(z.object({
      subcategoryId: z.number(),
      name: z.string(),
      nameBn: z.string().optional(),
      slug: z.string(),
      description: z.string().optional(),
      classLevel: z.string().optional(),
      sectionName: z.string().optional(),
      orderIndex: z.number().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createSection(input);
      return { success: true, id };
    }),
    
    // Update section (admin only)
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameBn: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      classLevel: z.string().optional(),
      sectionName: z.string().optional(),
      orderIndex: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSection(id, data);
      return { success: true };
    }),
    
    // Delete section (admin only)
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteSection(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
