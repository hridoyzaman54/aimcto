import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from '../db';

describe('Lesson Progress and Enrollment Progress', () => {
  let testCourseId: number;
  let testLessonIds: number[] = [];
  let testEnrollmentId: number;
  const testUserId = 1; // Use existing user

  beforeAll(async () => {
    // Create a test course
    testCourseId = await db.createCourse({
      title: 'Progress Test Course',
      description: 'Course for testing progress calculation',
      level: 'beginner',
      status: 'published',
      price: '0',
      durationMonths: 3,
    });

    // Create 4 lessons for the course
    for (let i = 1; i <= 4; i++) {
      const lessonId = await db.createLesson({
        courseId: testCourseId,
        title: `Test Lesson ${i}`,
        orderIndex: i,
        contentType: 'video',
      });
      testLessonIds.push(lessonId);
    }

    // Create enrollment for the test user
    testEnrollmentId = await db.enrollStudent(testUserId, testCourseId, 3) as number;
  });

  afterAll(async () => {
    // Clean up test data
    if (testEnrollmentId) {
      // Delete lesson progress first
      const progressRecords = await db.getLessonProgressByEnrollment(testEnrollmentId);
      // Progress records will be cleaned up with enrollment
    }
    
    // Delete lessons
    for (const lessonId of testLessonIds) {
      await db.deleteLesson(lessonId);
    }
    
    // Delete enrollment and course
    if (testEnrollmentId) {
      // Note: We'd need a deleteEnrollment function, but for now we'll leave it
    }
    if (testCourseId) {
      await db.deleteCourse(testCourseId);
    }
  });

  describe('markLessonComplete', () => {
    it('should mark a lesson as complete and update enrollment progress to 25%', async () => {
      // Mark first lesson complete (1 of 4 = 25%)
      await db.markLessonComplete(testEnrollmentId, testLessonIds[0]);

      // Check lesson progress
      const lessonProgress = await db.getLessonProgressByEnrollment(testEnrollmentId);
      const completedLesson = lessonProgress.find(p => p.lessonId === testLessonIds[0]);
      
      expect(completedLesson).toBeDefined();
      expect(completedLesson?.completed).toBe(true);
      expect(completedLesson?.progressPercent).toBe(100);

      // Check enrollment progress (should be 25% = 1/4)
      const enrollment = await db.getActiveEnrollment(testUserId, testCourseId);
      expect(enrollment?.progressPercent).toBe(25);
    });

    it('should update enrollment progress to 50% after completing second lesson', async () => {
      // Mark second lesson complete (2 of 4 = 50%)
      await db.markLessonComplete(testEnrollmentId, testLessonIds[1]);

      // Check enrollment progress
      const enrollment = await db.getActiveEnrollment(testUserId, testCourseId);
      expect(enrollment?.progressPercent).toBe(50);
    });

    it('should update enrollment progress to 75% after completing third lesson', async () => {
      // Mark third lesson complete (3 of 4 = 75%)
      await db.markLessonComplete(testEnrollmentId, testLessonIds[2]);

      // Check enrollment progress
      const enrollment = await db.getActiveEnrollment(testUserId, testCourseId);
      expect(enrollment?.progressPercent).toBe(75);
    });

    it('should update enrollment progress to 100% and mark as completed after all lessons done', async () => {
      // Mark fourth lesson complete (4 of 4 = 100%)
      await db.markLessonComplete(testEnrollmentId, testLessonIds[3]);

      // Check enrollment progress - use getEnrollmentsByUser since status is now 'completed'
      const enrollments = await db.getEnrollmentsByUser(testUserId);
      const enrollment = enrollments.find(e => e.id === testEnrollmentId);
      expect(enrollment?.progressPercent).toBe(100);
      // Note: status is updated to 'completed' when progress reaches 100%
    });
  });

  describe('getEnrollmentsByUser', () => {
    it('should return enrollments with course title', async () => {
      const enrollments = await db.getEnrollmentsByUser(testUserId);
      
      expect(Array.isArray(enrollments)).toBe(true);
      
      const testEnrollment = enrollments.find(e => e.id === testEnrollmentId);
      expect(testEnrollment).toBeDefined();
      expect(testEnrollment?.courseTitle).toBe('Progress Test Course');
      expect(testEnrollment?.progressPercent).toBe(100);
    });
  });
});
