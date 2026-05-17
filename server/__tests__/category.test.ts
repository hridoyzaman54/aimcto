import { describe, it, expect } from 'vitest';
import * as db from '../db';

describe('Category System', () => {
  describe('Category Hierarchy', () => {
    it('should get all categories with hierarchy', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(Array.isArray(hierarchy)).toBe(true);
      
      // Should have seeded categories
      expect(hierarchy.length).toBeGreaterThan(0);
      
      // Check structure of first category
      const firstCategory = hierarchy[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('subcategories');
      expect(Array.isArray(firstCategory.subcategories)).toBe(true);
    });

    it('should have Academic category with subcategories', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      expect(academicCategory).toBeDefined();
      
      // Academic should have subcategories like English Medium, Bangla Medium, etc.
      expect(academicCategory?.subcategories?.length).toBeGreaterThan(0);
      
      // Check for English Medium subcategory
      const englishMedium = academicCategory?.subcategories?.find(s => s.name === 'English Medium');
      expect(englishMedium).toBeDefined();
      
      // English Medium should have sections (Class 1-10)
      expect(englishMedium?.sections?.length).toBeGreaterThan(0);
    });

    it('should have Tiny Explorers category', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      const tinyExplorers = hierarchy.find(c => c.name === 'Tiny Explorers');
      expect(tinyExplorers).toBeDefined();
      
      // Should have Preschoolers and Kindergartners subcategories
      const preschoolers = tinyExplorers?.subcategories?.find(s => s.name === 'Preschoolers');
      const kindergartners = tinyExplorers?.subcategories?.find(s => s.name === 'Kindergartners');
      
      expect(preschoolers).toBeDefined();
      expect(kindergartners).toBeDefined();
    });

    it('should have Special Needs category with autism levels', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      const specialNeeds = hierarchy.find(c => c.name === 'Special Needs');
      expect(specialNeeds).toBeDefined();
      
      // Should have autism level subcategories
      const autismLevel1 = specialNeeds?.subcategories?.find(s => s.name === 'Autism Level 1');
      const autismLevel2 = specialNeeds?.subcategories?.find(s => s.name === 'Autism Level 2');
      const autismLevel3 = specialNeeds?.subcategories?.find(s => s.name === 'Autism Level 3');
      
      expect(autismLevel1).toBeDefined();
      expect(autismLevel2).toBeDefined();
      expect(autismLevel3).toBeDefined();
    });

    it('should have Skills and Creativities category', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      const skills = hierarchy.find(c => c.name === 'Skills and Creativities');
      expect(skills).toBeDefined();
      
      // Should have age group subcategories
      const kids = skills?.subcategories?.find(s => s.name === 'Kids');
      const adults = skills?.subcategories?.find(s => s.name === 'Adults');
      const everyone = skills?.subcategories?.find(s => s.name === 'Everyone');
      
      expect(kids).toBeDefined();
      expect(adults).toBeDefined();
      expect(everyone).toBeDefined();
    });

    it('should have Spoken English & Grammar category', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      
      const spokenEnglish = hierarchy.find(c => c.name === 'Spoken English & Grammar');
      expect(spokenEnglish).toBeDefined();
      
      // Should have level subcategories
      const beginners = spokenEnglish?.subcategories?.find(s => s.name === 'Beginners');
      const intermediate = spokenEnglish?.subcategories?.find(s => s.name === 'Intermediate');
      const advanced = spokenEnglish?.subcategories?.find(s => s.name === 'Advanced');
      
      expect(beginners).toBeDefined();
      expect(intermediate).toBeDefined();
      expect(advanced).toBeDefined();
    });
  });

  describe('Category Database Functions', () => {
    it('should get all categories', async () => {
      const categories = await db.getAllCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should get subcategories by category', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      
      if (academicCategory) {
        const subcategories = await db.getSubcategoriesByCategory(academicCategory.id);
        
        expect(Array.isArray(subcategories)).toBe(true);
        expect(subcategories.length).toBeGreaterThan(0);
      }
    });

    it('should get sections by subcategory', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      const englishMedium = academicCategory?.subcategories?.find(s => s.name === 'English Medium');
      
      if (englishMedium) {
        const sections = await db.getSectionsBySubcategory(englishMedium.id);
        
        expect(Array.isArray(sections)).toBe(true);
        expect(sections.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Course Category Filtering', () => {
    it('should allow courses to be filtered by category', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      
      if (academicCategory) {
        const coursesByCategory = await db.getCoursesByCategory(academicCategory.id);
        
        expect(Array.isArray(coursesByCategory)).toBe(true);
        // All returned courses should have the correct categoryId
        coursesByCategory.forEach(course => {
          expect(course.categoryId).toBe(academicCategory.id);
        });
      }
    });

    it('should allow courses to be filtered by subcategory', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      const englishMedium = academicCategory?.subcategories?.find(s => s.name === 'English Medium');
      
      if (englishMedium) {
        const coursesBySubcategory = await db.getCoursesBySubcategory(englishMedium.id);
        
        expect(Array.isArray(coursesBySubcategory)).toBe(true);
        // All returned courses should have the correct subcategoryId
        coursesBySubcategory.forEach(course => {
          expect(course.subcategoryId).toBe(englishMedium.id);
        });
      }
    });

    it('should allow courses to be filtered by section', async () => {
      const hierarchy = await db.getCategoryHierarchy();
      const academicCategory = hierarchy.find(c => c.name === 'Academic');
      const englishMedium = academicCategory?.subcategories?.find(s => s.name === 'English Medium');
      const class5 = englishMedium?.sections?.find(s => s.name === 'Class 5');
      
      if (class5) {
        const coursesBySection = await db.getCoursesBySection(class5.id);
        
        expect(Array.isArray(coursesBySection)).toBe(true);
        // All returned courses should have the correct sectionId
        coursesBySection.forEach(course => {
          expect(course.sectionId).toBe(class5.id);
        });
      }
    });
  });
});
