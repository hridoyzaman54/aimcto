import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  {
    name: 'Academic',
    nameBn: 'একাডেমিক',
    slug: 'academic',
    description: 'Academic courses for school students following different curricula',
    icon: 'GraduationCap',
    color: '#3B82F6',
    orderIndex: 1,
    subcategories: [
      { name: 'English Medium', nameBn: 'ইংরেজি মাধ্যম', slug: 'english-medium', orderIndex: 1 },
      { name: 'Bangla Medium', nameBn: 'বাংলা মাধ্যম', slug: 'bangla-medium', orderIndex: 2 },
      { name: 'English Version', nameBn: 'ইংরেজি ভার্সন', slug: 'english-version', orderIndex: 3 },
    ]
  },
  {
    name: 'Tiny Explorers',
    nameBn: 'ক্ষুদে অভিযাত্রী',
    slug: 'tiny-explorers',
    description: 'Early childhood education programs for young learners',
    icon: 'Baby',
    color: '#EC4899',
    orderIndex: 2,
    subcategories: [
      { name: 'Preschoolers', nameBn: 'প্রি-স্কুলার', slug: 'preschoolers', orderIndex: 1 },
      { name: 'Kindergartners', nameBn: 'কিন্ডারগার্টেন', slug: 'kindergartners', orderIndex: 2 },
    ]
  },
  {
    name: 'Special Needs',
    nameBn: 'বিশেষ চাহিদা',
    slug: 'special-needs',
    description: 'Specialized courses for children with special needs',
    icon: 'Heart',
    color: '#8B5CF6',
    orderIndex: 3,
    subcategories: [
      { name: 'Autism Level 1', nameBn: 'অটিজম লেভেল ১', slug: 'autism-level-1', orderIndex: 1 },
      { name: 'Autism Level 2', nameBn: 'অটিজম লেভেল ২', slug: 'autism-level-2', orderIndex: 2 },
      { name: 'Autism Level 3', nameBn: 'অটিজম লেভেল ৩', slug: 'autism-level-3', orderIndex: 3 },
      { name: 'Undefined', nameBn: 'অনির্ধারিত', slug: 'undefined', orderIndex: 4 },
    ]
  },
  {
    name: 'Skills and Creativities',
    nameBn: 'দক্ষতা ও সৃজনশীলতা',
    slug: 'skills-and-creativities',
    description: 'Creative and skill-building courses for all ages',
    icon: 'Palette',
    color: '#F59E0B',
    orderIndex: 4,
    subcategories: [
      { name: 'Kids', nameBn: 'শিশু', slug: 'kids', orderIndex: 1 },
      { name: 'Young Adults', nameBn: 'তরুণ প্রাপ্তবয়স্ক', slug: 'young-adults', orderIndex: 2 },
      { name: 'Youths', nameBn: 'যুবক', slug: 'youths', orderIndex: 3 },
      { name: 'Adults', nameBn: 'প্রাপ্তবয়স্ক', slug: 'adults', orderIndex: 4 },
      { name: 'Everyone', nameBn: 'সবার জন্য', slug: 'everyone', orderIndex: 5 },
    ]
  },
  {
    name: 'Spoken English & Grammar',
    nameBn: 'স্পোকেন ইংলিশ ও গ্রামার',
    slug: 'spoken-english-grammar',
    description: 'English language courses for speaking and grammar skills',
    icon: 'Languages',
    color: '#10B981',
    orderIndex: 5,
    subcategories: [
      { name: 'Kids', nameBn: 'শিশু', slug: 'kids', orderIndex: 1 },
      { name: 'Beginners', nameBn: 'শুরুর স্তর', slug: 'beginners', orderIndex: 2 },
      { name: 'Intermediate', nameBn: 'মধ্যম স্তর', slug: 'intermediate', orderIndex: 3 },
      { name: 'Advanced', nameBn: 'উন্নত স্তর', slug: 'advanced', orderIndex: 4 },
      { name: 'General', nameBn: 'সাধারণ', slug: 'general', orderIndex: 5 },
    ]
  },
  {
    name: 'Mental Health',
    nameBn: 'মানসিক স্বাস্থ্য',
    slug: 'mental-health',
    description: 'Mental health awareness and support programs',
    icon: 'Brain',
    color: '#6366F1',
    orderIndex: 6,
    subcategories: [
      { name: 'Children', nameBn: 'শিশু', slug: 'children', orderIndex: 1 },
      { name: 'Teenagers', nameBn: 'কিশোর', slug: 'teenagers', orderIndex: 2 },
      { name: 'Adults', nameBn: 'প্রাপ্তবয়স্ক', slug: 'adults', orderIndex: 3 },
      { name: 'Parents', nameBn: 'অভিভাবক', slug: 'parents', orderIndex: 4 },
    ]
  },
  {
    name: 'Professional Development',
    nameBn: 'পেশাদার উন্নয়ন',
    slug: 'professional-development',
    description: 'Career and professional skill development courses',
    icon: 'Briefcase',
    color: '#0EA5E9',
    orderIndex: 7,
    subcategories: [
      { name: 'Career Skills', nameBn: 'ক্যারিয়ার দক্ষতা', slug: 'career-skills', orderIndex: 1 },
      { name: 'Leadership', nameBn: 'নেতৃত্ব', slug: 'leadership', orderIndex: 2 },
      { name: 'Communication', nameBn: 'যোগাযোগ', slug: 'communication', orderIndex: 3 },
    ]
  },
  {
    name: 'Technology',
    nameBn: 'প্রযুক্তি',
    slug: 'technology',
    description: 'Technology and digital skills courses',
    icon: 'Laptop',
    color: '#14B8A6',
    orderIndex: 8,
    subcategories: [
      { name: 'Basic Computer', nameBn: 'বেসিক কম্পিউটার', slug: 'basic-computer', orderIndex: 1 },
      { name: 'Programming', nameBn: 'প্রোগ্রামিং', slug: 'programming', orderIndex: 2 },
      { name: 'Digital Literacy', nameBn: 'ডিজিটাল সাক্ষরতা', slug: 'digital-literacy', orderIndex: 3 },
    ]
  },
];

async function seedCategories() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Starting category seeding...');
  
  for (const category of categories) {
    // Check if category already exists
    const [existing] = await connection.execute(
      'SELECT id FROM course_categories WHERE slug = ?',
      [category.slug]
    );
    
    let categoryId;
    
    if (existing.length > 0) {
      categoryId = existing[0].id;
      console.log(`Category "${category.name}" already exists with id ${categoryId}`);
    } else {
      // Insert main category
      const [result] = await connection.execute(
        `INSERT INTO course_categories (name, nameBn, slug, description, icon, color, orderIndex, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
        [category.name, category.nameBn, category.slug, category.description, category.icon, category.color, category.orderIndex]
      );
      categoryId = result.insertId;
      console.log(`Created category: ${category.name} (id: ${categoryId})`);
    }
    
    // Insert subcategories
    for (const sub of category.subcategories) {
      const subSlug = `${category.slug}-${sub.slug}`;
      
      const [existingSub] = await connection.execute(
        'SELECT id FROM course_subcategories WHERE slug = ? AND categoryId = ?',
        [subSlug, categoryId]
      );
      
      if (existingSub.length > 0) {
        console.log(`  - Subcategory "${sub.name}" already exists`);
      } else {
        await connection.execute(
          `INSERT INTO course_subcategories (categoryId, name, nameBn, slug, orderIndex, isActive) 
           VALUES (?, ?, ?, ?, ?, true)`,
          [categoryId, sub.name, sub.nameBn, subSlug, sub.orderIndex]
        );
        console.log(`  - Created subcategory: ${sub.name}`);
      }
    }
  }
  
  // Create class sections for Academic category
  const [academicCat] = await connection.execute(
    'SELECT id FROM course_categories WHERE slug = ?',
    ['academic']
  );
  
  if (academicCat.length > 0) {
    const academicId = academicCat[0].id;
    
    // Get subcategories for Academic
    const [academicSubs] = await connection.execute(
      'SELECT id, name, slug FROM course_subcategories WHERE categoryId = ?',
      [academicId]
    );
    
    // Create class levels (1-10) for each academic subcategory
    for (const sub of academicSubs) {
      for (let classNum = 1; classNum <= 10; classNum++) {
        const sectionSlug = `${sub.slug}-class-${classNum}`;
        
        const [existingSection] = await connection.execute(
          'SELECT id FROM course_sections WHERE slug = ? AND subcategoryId = ?',
          [sectionSlug, sub.id]
        );
        
        if (existingSection.length === 0) {
          await connection.execute(
            `INSERT INTO course_sections (subcategoryId, name, nameBn, slug, classLevel, orderIndex, isActive) 
             VALUES (?, ?, ?, ?, ?, ?, true)`,
            [sub.id, `Class ${classNum}`, `শ্রেণি ${classNum}`, sectionSlug, String(classNum), classNum]
          );
        }
      }
      console.log(`  - Created class levels 1-10 for ${sub.name}`);
    }
  }
  
  console.log('Category seeding completed!');
  await connection.end();
}

seedCategories().catch(console.error);
