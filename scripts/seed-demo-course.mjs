/**
 * Seed script to create a demo course with sample materials
 * Run with: node scripts/seed-demo-course.mjs
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function seedDemoCourse() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('Creating demo course...');
    
    // Create demo course
    const [courseResult] = await connection.execute(`
      INSERT INTO courses (title, description, category, level, price, durationMonths, thumbnail, status, createdAt, updatedAt)
      VALUES (
        'Introduction to Web Development',
        'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything from basic concepts to building your first interactive website.',
        'Technology',
        'beginner',
        0,
        3,
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
        'published',
        NOW(),
        NOW()
      )
    `);
    
    const courseId = courseResult.insertId;
    console.log(`Created course with ID: ${courseId}`);
    
    // Create lessons
    const lessons = [
      {
        title: 'Getting Started with HTML',
        description: 'Learn the basics of HTML structure and common tags',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 15,
        orderIndex: 1
      },
      {
        title: 'Styling with CSS',
        description: 'Introduction to CSS selectors, properties, and layouts',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 20,
        orderIndex: 2
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn variables, functions, and basic DOM manipulation',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 25,
        orderIndex: 3
      },
      {
        title: 'Building Your First Website',
        description: 'Put it all together and create a complete website',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 30,
        orderIndex: 4
      }
    ];
    
    const lessonIds = [];
    for (const lesson of lessons) {
      const [lessonResult] = await connection.execute(`
        INSERT INTO lessons (courseId, title, description, videoUrl, duration, orderIndex, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [courseId, lesson.title, lesson.description, lesson.videoUrl, lesson.duration, lesson.orderIndex]);
      
      lessonIds.push(lessonResult.insertId);
      console.log(`Created lesson: ${lesson.title}`);
    }
    
    // Create lesson materials
    const materials = [
      // Lesson 1 materials
      { lessonId: lessonIds[0], title: 'HTML Cheat Sheet', type: 'pdf', fileUrl: 'https://websitesetup.org/wp-content/uploads/2019/11/html5-tag-cheat-sheet-2019.pdf', orderIndex: 1 },
      { lessonId: lessonIds[0], title: 'HTML Structure Diagram', type: 'image', fileUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', orderIndex: 2 },
      
      // Lesson 2 materials
      { lessonId: lessonIds[1], title: 'CSS Properties Reference', type: 'pdf', fileUrl: 'https://websitesetup.org/wp-content/uploads/2019/11/wsu-css-cheat-sheet-gdocs.pdf', orderIndex: 1 },
      { lessonId: lessonIds[1], title: 'Flexbox Guide', type: 'image', fileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', orderIndex: 2 },
      
      // Lesson 3 materials
      { lessonId: lessonIds[2], title: 'JavaScript Basics', type: 'pdf', fileUrl: 'https://websitesetup.org/wp-content/uploads/2020/09/Javascript-Cheat-Sheet.pdf', orderIndex: 1 },
      { lessonId: lessonIds[2], title: 'Code Examples', type: 'doc', fileUrl: 'https://example.com/js-examples.docx', orderIndex: 2 },
      
      // Lesson 4 materials
      { lessonId: lessonIds[3], title: 'Project Template', type: 'doc', fileUrl: 'https://example.com/project-template.docx', orderIndex: 1 },
      { lessonId: lessonIds[3], title: 'Final Project Screenshot', type: 'image', fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', orderIndex: 2 },
    ];
    
    for (const material of materials) {
      await connection.execute(`
        INSERT INTO lesson_materials (lessonId, title, type, fileUrl, orderIndex, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [material.lessonId, material.title, material.type, material.fileUrl, material.orderIndex]);
      console.log(`Created material: ${material.title}`);
    }
    
    // Create a quiz for the course
    const [quizResult] = await connection.execute(`
      INSERT INTO quizzes (courseId, title, description, timeLimitMinutes, passingPercentage, status, createdAt, updatedAt)
      VALUES (?, 'Web Development Basics Quiz', 'Test your knowledge of HTML, CSS, and JavaScript fundamentals', 30, 70, 'published', NOW(), NOW())
    `, [courseId]);
    
    const quizId = quizResult.insertId;
    console.log(`Created quiz with ID: ${quizId}`);
    
    // Create quiz questions
    const questions = [
      {
        question: 'What does HTML stand for?',
        type: 'multiple_choice',
        options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language']),
        correctAnswer: 'Hyper Text Markup Language',
        points: 10
      },
      {
        question: 'Which CSS property is used to change the text color?',
        type: 'multiple_choice',
        options: JSON.stringify(['font-color', 'text-color', 'color', 'foreground-color']),
        correctAnswer: 'color',
        points: 10
      },
      {
        question: 'Which symbol is used for comments in JavaScript?',
        type: 'multiple_choice',
        options: JSON.stringify(['<!-- -->', '/* */', '// or /* */', '# #']),
        correctAnswer: '// or /* */',
        points: 10
      },
      {
        question: 'What is the correct HTML tag for the largest heading?',
        type: 'multiple_choice',
        options: JSON.stringify(['<heading>', '<h6>', '<h1>', '<head>']),
        correctAnswer: '<h1>',
        points: 10
      },
      {
        question: 'CSS stands for Cascading Style Sheets',
        type: 'true_false',
        options: JSON.stringify(['True', 'False']),
        correctAnswer: 'True',
        points: 10
      }
    ];
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await connection.execute(`
        INSERT INTO quiz_questions (quizId, question, questionType, options, correctAnswer, marks, orderIndex, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [quizId, q.question, q.type === 'multiple_choice' ? 'mcq' : q.type, q.options, q.correctAnswer, q.points, i + 1]);
    }
    console.log(`Created ${questions.length} quiz questions`);
    
    // Create an assignment
    await connection.execute(`
      INSERT INTO assignments (courseId, title, description, dueDate, totalMarks, status, createdAt, updatedAt)
      VALUES (?, 'Build a Personal Portfolio', 'Create a simple personal portfolio website using HTML and CSS. Include at least 3 sections: About Me, Projects, and Contact.', DATE_ADD(NOW(), INTERVAL 14 DAY), 100, 'published', NOW(), NOW())
    `, [courseId]);
    console.log('Created assignment');
    
    console.log('\n✅ Demo course created successfully!');
    console.log(`Course ID: ${courseId}`);
    console.log(`Lessons: ${lessonIds.length}`);
    console.log(`Materials: ${materials.length}`);
    console.log(`Quiz: 1 with ${questions.length} questions`);
    console.log(`Assignment: 1`);
    
  } catch (error) {
    console.error('Error seeding demo course:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDemoCourse();
