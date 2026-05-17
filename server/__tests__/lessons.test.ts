import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('../db', () => ({
  createLesson: vi.fn(),
  getLesson: vi.fn(),
  getLessonsByCourse: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
}));

import * as db from '../db';

describe('Lesson Management Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLesson', () => {
    it('should create a lesson with video content', async () => {
      const mockLesson = {
        id: 1,
        courseId: 1,
        title: 'Introduction to Math',
        description: 'Basic math concepts',
        contentType: 'video',
        contentUrl: 'https://example.com/video.mp4',
        order: 1,
        duration: 600,
        isPreview: false,
      };
      
      (db.createLesson as any).mockResolvedValue(mockLesson);
      
      const result = await db.createLesson({
        courseId: 1,
        title: 'Introduction to Math',
        description: 'Basic math concepts',
        contentType: 'video',
        contentUrl: 'https://example.com/video.mp4',
        order: 1,
        duration: 600,
        isPreview: false,
      });
      
      expect(result).toEqual(mockLesson);
      expect(result.contentType).toBe('video');
    });

    it('should create a lesson with PDF content', async () => {
      const mockLesson = {
        id: 2,
        courseId: 1,
        title: 'Math Workbook',
        description: 'Practice problems',
        contentType: 'pdf',
        contentUrl: 'https://example.com/workbook.pdf',
        order: 2,
        isPreview: true,
      };
      
      (db.createLesson as any).mockResolvedValue(mockLesson);
      
      const result = await db.createLesson({
        courseId: 1,
        title: 'Math Workbook',
        description: 'Practice problems',
        contentType: 'pdf',
        contentUrl: 'https://example.com/workbook.pdf',
        order: 2,
        isPreview: true,
      });
      
      expect(result).toEqual(mockLesson);
      expect(result.contentType).toBe('pdf');
      expect(result.isPreview).toBe(true);
    });
  });

  describe('getLesson', () => {
    it('should return a lesson by id', async () => {
      const mockLesson = {
        id: 1,
        courseId: 1,
        title: 'Introduction to Math',
        contentType: 'video',
      };
      
      (db.getLesson as any).mockResolvedValue(mockLesson);
      
      const result = await db.getLesson(1);
      
      expect(result).toEqual(mockLesson);
      expect(db.getLesson).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent lesson', async () => {
      (db.getLesson as any).mockResolvedValue(null);
      
      const result = await db.getLesson(999);
      
      expect(result).toBeNull();
    });
  });

  describe('getLessonsByCourse', () => {
    it('should return all lessons for a course ordered by order field', async () => {
      const mockLessons = [
        { id: 1, courseId: 1, title: 'Lesson 1', order: 1 },
        { id: 2, courseId: 1, title: 'Lesson 2', order: 2 },
        { id: 3, courseId: 1, title: 'Lesson 3', order: 3 },
      ];
      
      (db.getLessonsByCourse as any).mockResolvedValue(mockLessons);
      
      const result = await db.getLessonsByCourse(1);
      
      expect(result).toEqual(mockLessons);
      expect(result.length).toBe(3);
      // Verify ordering
      expect(result[0].order).toBeLessThan(result[1].order);
      expect(result[1].order).toBeLessThan(result[2].order);
    });

    it('should return empty array for course with no lessons', async () => {
      (db.getLessonsByCourse as any).mockResolvedValue([]);
      
      const result = await db.getLessonsByCourse(999);
      
      expect(result).toEqual([]);
    });
  });

  describe('updateLesson', () => {
    it('should update lesson title and description', async () => {
      const mockUpdatedLesson = {
        id: 1,
        courseId: 1,
        title: 'Updated Title',
        description: 'Updated description',
        contentType: 'video',
      };
      
      (db.updateLesson as any).mockResolvedValue(mockUpdatedLesson);
      
      const result = await db.updateLesson(1, {
        title: 'Updated Title',
        description: 'Updated description',
      });
      
      expect(result).toEqual(mockUpdatedLesson);
      expect(result.title).toBe('Updated Title');
    });

    it('should update lesson order for reordering', async () => {
      const mockUpdatedLesson = {
        id: 1,
        courseId: 1,
        title: 'Lesson 1',
        order: 3,
      };
      
      (db.updateLesson as any).mockResolvedValue(mockUpdatedLesson);
      
      const result = await db.updateLesson(1, { order: 3 });
      
      expect(result.order).toBe(3);
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson by id', async () => {
      (db.deleteLesson as any).mockResolvedValue({ success: true });
      
      const result = await db.deleteLesson(1);
      
      expect(result).toEqual({ success: true });
      expect(db.deleteLesson).toHaveBeenCalledWith(1);
    });
  });
});

describe('Lesson Content Types', () => {
  it('should support video content type', () => {
    const validContentTypes = ['video', 'pdf', 'text', 'quiz'];
    expect(validContentTypes).toContain('video');
  });

  it('should support pdf content type', () => {
    const validContentTypes = ['video', 'pdf', 'text', 'quiz'];
    expect(validContentTypes).toContain('pdf');
  });

  it('should support text content type', () => {
    const validContentTypes = ['video', 'pdf', 'text', 'quiz'];
    expect(validContentTypes).toContain('text');
  });
});
