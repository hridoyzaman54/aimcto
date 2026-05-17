import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from '../db';

describe('Lesson Materials Feature', () => {
  let testCourseId: number;
  let testLessonId: number;
  let testMaterialId: number;

  beforeAll(async () => {
    // Create a test course
    testCourseId = await db.createCourse({
      title: 'Test Course for Materials',
      description: 'Test course',
      level: 'beginner',
      status: 'draft',
      price: '0',
      durationMonths: 3,
    });

    // Create a test lesson
    testLessonId = await db.createLesson({
      courseId: testCourseId,
      title: 'Test Lesson for Materials',
      orderIndex: 1,
      contentType: 'mixed',
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testMaterialId) {
      await db.deleteLessonMaterial(testMaterialId);
    }
    if (testLessonId) {
      await db.deleteLesson(testLessonId);
    }
    if (testCourseId) {
      await db.deleteCourse(testCourseId);
    }
  });

  describe('addLessonMaterial', () => {
    it('should add a PDF material to a lesson', async () => {
      testMaterialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Lecture Notes PDF',
        type: 'pdf',
        fileUrl: 'https://example.com/notes.pdf',
        fileName: 'notes.pdf',
        fileSize: 1024000,
      });

      expect(testMaterialId).toBeDefined();
      expect(typeof testMaterialId).toBe('number');
    });

    it('should add a PPTX material to a lesson', async () => {
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Lecture Slides',
        type: 'pptx',
        fileUrl: 'https://example.com/slides.pptx',
        fileName: 'slides.pptx',
        fileSize: 2048000,
      });

      expect(materialId).toBeDefined();
      
      // Clean up
      await db.deleteLessonMaterial(materialId);
    });

    it('should add a video material to a lesson', async () => {
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Tutorial Video',
        type: 'video',
        fileUrl: 'https://example.com/video.mp4',
        fileName: 'video.mp4',
        fileSize: 50000000,
      });

      expect(materialId).toBeDefined();
      
      // Clean up
      await db.deleteLessonMaterial(materialId);
    });

    it('should add a doc material to a lesson', async () => {
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Assignment Document',
        type: 'doc',
        fileUrl: 'https://example.com/assignment.docx',
        fileName: 'assignment.docx',
        fileSize: 512000,
      });

      expect(materialId).toBeDefined();
      
      // Clean up
      await db.deleteLessonMaterial(materialId);
    });

    it('should add an image material to a lesson', async () => {
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Diagram Image',
        type: 'image',
        fileUrl: 'https://example.com/diagram.png',
        fileName: 'diagram.png',
        fileSize: 256000,
      });

      expect(materialId).toBeDefined();
      
      // Clean up
      await db.deleteLessonMaterial(materialId);
    });

    it('should add a link material to a lesson', async () => {
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'External Resource',
        type: 'link',
        fileUrl: 'https://example.com/resource',
      });

      expect(materialId).toBeDefined();
      
      // Clean up
      await db.deleteLessonMaterial(materialId);
    });
  });

  describe('getLessonMaterials', () => {
    it('should retrieve all materials for a lesson', async () => {
      const materials = await db.getLessonMaterials(testLessonId);

      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThanOrEqual(1);
      
      const material = materials.find(m => m.id === testMaterialId);
      expect(material).toBeDefined();
      expect(material?.title).toBe('Lecture Notes PDF');
      expect(material?.type).toBe('pdf');
    });

    it('should return empty array for lesson with no materials', async () => {
      // Create a new lesson without materials
      const emptyLessonId = await db.createLesson({
        courseId: testCourseId,
        title: 'Empty Lesson',
        orderIndex: 2,
        contentType: 'video',
      });

      const materials = await db.getLessonMaterials(emptyLessonId);
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBe(0);

      // Clean up
      await db.deleteLesson(emptyLessonId);
    });
  });

  describe('deleteLessonMaterial', () => {
    it('should delete a material from a lesson', async () => {
      // Create a material to delete
      const materialId = await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Material to Delete',
        type: 'pdf',
        fileUrl: 'https://example.com/delete.pdf',
      });

      // Delete it
      await db.deleteLessonMaterial(materialId);

      // Verify it's deleted
      const materials = await db.getLessonMaterials(testLessonId);
      const deletedMaterial = materials.find(m => m.id === materialId);
      expect(deletedMaterial).toBeUndefined();
    });
  });

  describe('Multiple materials per lesson', () => {
    it('should support adding multiple materials of different types to one lesson', async () => {
      const materialIds: number[] = [];

      // Add video
      materialIds.push(await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Video Content',
        type: 'video',
        fileUrl: 'https://example.com/video.mp4',
      }));

      // Add PDF
      materialIds.push(await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'PDF Notes',
        type: 'pdf',
        fileUrl: 'https://example.com/notes.pdf',
      }));

      // Add PPTX slides
      materialIds.push(await db.addLessonMaterial({
        lessonId: testLessonId,
        title: 'Presentation Slides',
        type: 'pptx',
        fileUrl: 'https://example.com/slides.pptx',
      }));

      // Verify all materials are added
      const materials = await db.getLessonMaterials(testLessonId);
      
      // Should have at least 3 new materials plus the one from beforeAll
      expect(materials.length).toBeGreaterThanOrEqual(4);

      // Verify different types exist
      const types = materials.map(m => m.type);
      expect(types).toContain('video');
      expect(types).toContain('pdf');
      expect(types).toContain('pptx');

      // Clean up
      for (const id of materialIds) {
        await db.deleteLessonMaterial(id);
      }
    });
  });
});
