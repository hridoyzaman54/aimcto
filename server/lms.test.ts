import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

// Note: These tests run against the real database.
// The tests are designed to verify the database helpers work correctly
// with actual data, not mock data.

describe("LMS Database Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Helpers", () => {
    it("should return array of users when getting all users", async () => {
      const users = await db.getAllUsers();
      expect(Array.isArray(users)).toBe(true);
      // If there are users, verify they have expected properties
      if (users.length > 0) {
        expect(users[0]).toHaveProperty("id");
        expect(users[0]).toHaveProperty("email");
        expect(users[0]).toHaveProperty("role");
      }
    });

    it("should return user or undefined when getting user by ID", async () => {
      const user = await db.getUserById(1);
      // User may or may not exist depending on database state
      if (user) {
        expect(user).toHaveProperty("id");
        expect(user.id).toBe(1);
      } else {
        expect(user).toBeUndefined();
      }
    });

    it("should return undefined when getting user by non-existent student UID", async () => {
      const user = await db.getUserByStudentUid("STU-NONEXISTENT-12345678");
      expect(user).toBeUndefined();
    });
  });

  describe("Course Helpers", () => {
    it("should return array when getting all courses", async () => {
      const courses = await db.getAllCourses();
      expect(Array.isArray(courses)).toBe(true);
    });

    it("should return array when getting published courses", async () => {
      const courses = await db.getPublishedCourses();
      expect(Array.isArray(courses)).toBe(true);
    });

    it("should return undefined when getting course by non-existent ID", async () => {
      const course = await db.getCourseById(999999);
      expect(course).toBeUndefined();
    });
  });

  describe("Lesson Helpers", () => {
    it("should return array when getting lessons by course", async () => {
      const lessons = await db.getLessonsByCourse(1);
      expect(Array.isArray(lessons)).toBe(true);
    });

    it("should return undefined when getting lesson by non-existent ID", async () => {
      const lesson = await db.getLessonById(999999);
      expect(lesson).toBeUndefined();
    });

    it("should return array when getting lesson materials", async () => {
      const materials = await db.getLessonMaterials(1);
      expect(Array.isArray(materials)).toBe(true);
    });
  });

  describe("Enrollment Helpers", () => {
    it("should return array when getting user enrollments", async () => {
      const enrollments = await db.getEnrollmentsByUser(1);
      expect(Array.isArray(enrollments)).toBe(true);
    });

    it("should return array when getting course enrollments", async () => {
      const enrollments = await db.getEnrollmentsByCourse(1);
      expect(Array.isArray(enrollments)).toBe(true);
    });

    it("should return undefined when getting non-existent active enrollment", async () => {
      const enrollment = await db.getActiveEnrollment(999999, 999999);
      expect(enrollment).toBeUndefined();
    });
  });

  describe("Quiz Helpers", () => {
    it("should return array when getting quizzes by course", async () => {
      const quizzes = await db.getQuizzesByCourse(1);
      expect(Array.isArray(quizzes)).toBe(true);
    });

    it("should return undefined when getting quiz by non-existent ID", async () => {
      const quiz = await db.getQuizById(999999);
      expect(quiz).toBeUndefined();
    });

    it("should return array when getting quiz questions", async () => {
      const questions = await db.getQuizQuestions(1);
      expect(Array.isArray(questions)).toBe(true);
    });

    it("should return array when getting quiz attempts", async () => {
      const attempts = await db.getQuizAttempts(1, 1);
      expect(Array.isArray(attempts)).toBe(true);
    });
  });

  describe("Assignment Helpers", () => {
    it("should return array when getting assignments by course", async () => {
      const assignments = await db.getAssignmentsByCourse(1);
      expect(Array.isArray(assignments)).toBe(true);
    });

    it("should return undefined when getting assignment by non-existent ID", async () => {
      const assignment = await db.getAssignmentById(999999);
      expect(assignment).toBeUndefined();
    });

    it("should return array when getting assignment submissions", async () => {
      const submissions = await db.getAssignmentSubmissions(1);
      expect(Array.isArray(submissions)).toBe(true);
    });

    it("should return array when getting student submissions", async () => {
      const submissions = await db.getStudentSubmissions(999999);
      expect(Array.isArray(submissions)).toBe(true);
    });
  });

  describe("Attendance Helpers", () => {
    it("should return array when getting student attendance", async () => {
      const attendance = await db.getAttendanceByStudent(1);
      expect(Array.isArray(attendance)).toBe(true);
    });

    it("should return array when getting course attendance", async () => {
      const attendance = await db.getAttendanceByCourse(1);
      expect(Array.isArray(attendance)).toBe(true);
    });
  });

  describe("Achievement Helpers", () => {
    it("should return array when getting all achievements", async () => {
      const achievements = await db.getAllAchievements();
      expect(Array.isArray(achievements)).toBe(true);
    });

    it("should return array when getting student achievements", async () => {
      const achievements = await db.getStudentAchievements(1);
      expect(Array.isArray(achievements)).toBe(true);
    });
  });

  describe("Game Score Helpers", () => {
    it("should return array when getting student game scores", async () => {
      const scores = await db.getGameScores(1);
      expect(Array.isArray(scores)).toBe(true);
    });

    it("should return array when getting game leaderboard", async () => {
      const leaderboard = await db.getLeaderboard("memory-match");
      expect(Array.isArray(leaderboard)).toBe(true);
    });
  });

  describe("Announcement Helpers", () => {
    it("should return array when getting announcements", async () => {
      const announcements = await db.getAnnouncements();
      expect(Array.isArray(announcements)).toBe(true);
    });
  });

  describe("Event Helpers", () => {
    it("should return array when getting upcoming events", async () => {
      const events = await db.getUpcomingEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it("should return array when getting events by course", async () => {
      const events = await db.getEventsByCourse(1);
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe("Live Class Helpers", () => {
    it("should return array when getting upcoming live classes", async () => {
      const classes = await db.getUpcomingLiveClasses(1);
      expect(Array.isArray(classes)).toBe(true);
    });
  });

  describe("Message Helpers", () => {
    it("should return array when getting inbox", async () => {
      const messages = await db.getInbox(1);
      expect(Array.isArray(messages)).toBe(true);
    });

    it("should return array when getting sent messages", async () => {
      const messages = await db.getSentMessages(1);
      expect(Array.isArray(messages)).toBe(true);
    });

    it("should return number when getting unread count", async () => {
      const count = await db.getUnreadCount(1);
      expect(typeof count).toBe("number");
    });
  });

  describe("Notification Helpers", () => {
    it("should return array when getting user notifications", async () => {
      const notifications = await db.getUserNotifications(1);
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("AIMVerse Helpers", () => {
    it("should return array when getting all episodes", async () => {
      const episodes = await db.getAimverseEpisodes();
      expect(Array.isArray(episodes)).toBe(true);
    });

    it("should return array when getting released episodes", async () => {
      const episodes = await db.getAimverseEpisodes(true);
      expect(Array.isArray(episodes)).toBe(true);
    });

    it("should return array when getting episode cards", async () => {
      const cards = await db.getAimverseCards(1);
      expect(Array.isArray(cards)).toBe(true);
    });

    it("should return array when getting episode prizes", async () => {
      const prizes = await db.getAimversePrizes();
      expect(Array.isArray(prizes)).toBe(true);
    });
  });

  describe("Dashboard Stats Helpers", () => {
    it("should return stats object for admin dashboard", async () => {
      const stats = await db.getAdminDashboardStats();
      expect(stats).toHaveProperty("totalStudents");
      expect(stats).toHaveProperty("totalCourses");
      expect(stats).toHaveProperty("totalEnrollments");
      expect(stats).toHaveProperty("activeEnrollments");
    });

    it("should return stats object for student dashboard", async () => {
      const stats = await db.getStudentDashboardStats(1);
      expect(stats).toHaveProperty("enrolledCourses");
      expect(stats).toHaveProperty("completedLessons");
      expect(stats).toHaveProperty("quizzesTaken");
      expect(stats).toHaveProperty("achievementsEarned");
    });
  });

  describe("Parent-Student Link Helpers", () => {
    it("should return array when getting linked students", async () => {
      const students = await db.getLinkedStudents(1);
      expect(Array.isArray(students)).toBe(true);
    });

    it("should return result object when verifying link with invalid UID", async () => {
      const result = await db.verifyParentStudentLink(1, "INVALID-UID");
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(false);
    });
  });

  describe("Student Notes Helpers", () => {
    it("should return array when getting student notes", async () => {
      const notes = await db.getStudentNotes(1, 1);
      expect(Array.isArray(notes)).toBe(true);
    });
  });

  describe("Lesson Progress Helpers", () => {
    it("should return array when getting lesson progress by enrollment", async () => {
      const progress = await db.getLessonProgressByEnrollment(1);
      expect(Array.isArray(progress)).toBe(true);
    });
  });

  describe("Teacher Remarks Helpers", () => {
    it("should return array when getting remarks by student", async () => {
      const remarks = await db.getRemarksByStudent(1);
      expect(Array.isArray(remarks)).toBe(true);
    });

    it("should return array when getting remarks by course", async () => {
      const remarks = await db.getRemarksByCourse(1);
      expect(Array.isArray(remarks)).toBe(true);
    });
  });

  describe("Class Schedule Helpers", () => {
    it("should return array when getting class schedule", async () => {
      const schedule = await db.getClassSchedule(1);
      expect(Array.isArray(schedule)).toBe(true);
    });
  });
});
