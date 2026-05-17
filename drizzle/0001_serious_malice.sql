CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameBn` varchar(100),
	`description` text,
	`iconUrl` text,
	`badgeColor` varchar(20),
	`criteria` text,
	`points` int DEFAULT 0,
	`category` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aimverse_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`content` text,
	`contentBn` text,
	`cardType` enum('character','power','lesson','fact','quiz') DEFAULT 'lesson',
	`imageUrl` text,
	`videoUrl` text,
	`metadata` json,
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aimverse_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aimverse_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`descriptionBn` text,
	`episodeNumber` int,
	`seasonNumber` int DEFAULT 1,
	`thumbnailUrl` text,
	`videoUrl` text,
	`trailerUrl` text,
	`duration` int,
	`releaseDate` timestamp,
	`isReleased` boolean DEFAULT false,
	`status` enum('upcoming','released','archived') DEFAULT 'upcoming',
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aimverse_episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aimverse_prizes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`prizeType` enum('quiz','competition','achievement','special') DEFAULT 'quiz',
	`winnerId` int,
	`episodeId` int,
	`announcedAt` timestamp,
	`prizeDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aimverse_prizes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`content` text NOT NULL,
	`contentBn` text,
	`targetAudience` enum('all','students','parents','teachers','course_specific') DEFAULT 'all',
	`courseId` int,
	`priority` enum('low','normal','high','urgent') DEFAULT 'normal',
	`isPinned` boolean DEFAULT false,
	`publishedAt` timestamp,
	`expiresAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`userId` int NOT NULL,
	`fileUrl` text,
	`content` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`isLate` boolean DEFAULT false,
	`score` int,
	`feedback` text,
	`gradedBy` int,
	`gradedAt` timestamp,
	`status` enum('submitted','graded','returned') DEFAULT 'submitted',
	CONSTRAINT `assignment_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`lessonId` int,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`instructions` text,
	`totalMarks` int DEFAULT 100,
	`startDate` timestamp,
	`dueDate` timestamp,
	`allowLateSubmission` boolean DEFAULT false,
	`attachmentUrl` text,
	`status` enum('draft','published','closed') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`classDate` timestamp NOT NULL,
	`status` enum('present','absent','late','excused') DEFAULT 'present',
	`remarks` text,
	`markedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`dayOfWeek` enum('sunday','monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`roomOrLink` varchar(255),
	`instructorId` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`descriptionBn` text,
	`thumbnail` text,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`durationMonths` int NOT NULL DEFAULT 3,
	`category` varchar(100),
	`level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`totalLessons` int DEFAULT 0,
	`instructorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`status` enum('active','expired','suspended','completed') NOT NULL DEFAULT 'active',
	`paymentId` varchar(100),
	`paymentAmount` decimal(10,2),
	`progressPercent` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`completedAt` timestamp,
	`expiryNotified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`eventType` enum('exam','quiz','holiday','meeting','workshop','competition','other') DEFAULT 'other',
	`eventDate` timestamp NOT NULL,
	`endDate` timestamp,
	`location` varchar(255),
	`isOnline` boolean DEFAULT false,
	`meetingLink` text,
	`targetAudience` enum('all','students','parents','teachers','course_specific') DEFAULT 'all',
	`courseId` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameName` varchar(100) NOT NULL,
	`score` int NOT NULL,
	`level` int,
	`metadata` json,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('pdf','doc','image','video','audio','link') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255),
	`fileSize` int,
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lesson_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`lessonId` int NOT NULL,
	`completed` boolean DEFAULT false,
	`progressPercent` int DEFAULT 0,
	`watchedDuration` int DEFAULT 0,
	`lastPosition` int DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`contentType` enum('video','pdf','text','mixed') DEFAULT 'mixed',
	`videoUrl` text,
	`duration` int,
	`isPreview` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`scheduledAt` timestamp NOT NULL,
	`durationMinutes` int DEFAULT 60,
	`meetingLink` text,
	`meetingId` varchar(100),
	`meetingPassword` varchar(50),
	`hostId` int,
	`status` enum('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
	`recordingUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`subject` varchar(255),
	`content` text NOT NULL,
	`attachmentUrl` text,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`type` enum('info','warning','success','error','reminder') DEFAULT 'info',
	`category` varchar(50),
	`relatedId` int,
	`relatedType` varchar(50),
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parent_student_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL,
	`studentId` int NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_student_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int,
	`totalMarks` int,
	`percentage` decimal(5,2),
	`passed` boolean,
	`answers` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`timeSpentSeconds` int,
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`question` text NOT NULL,
	`questionBn` text,
	`questionType` enum('mcq','true_false','short_answer') DEFAULT 'mcq',
	`options` json,
	`correctAnswer` text NOT NULL,
	`marks` int DEFAULT 1,
	`explanation` text,
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int,
	`lessonId` int,
	`title` varchar(255) NOT NULL,
	`titleBn` varchar(255),
	`description` text,
	`durationMinutes` int DEFAULT 30,
	`passingScore` int DEFAULT 60,
	`totalMarks` int DEFAULT 100,
	`shuffleQuestions` boolean DEFAULT false,
	`showResults` boolean DEFAULT true,
	`maxAttempts` int DEFAULT 1,
	`availableFrom` timestamp,
	`availableUntil` timestamp,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`awardedBy` int,
	CONSTRAINT `student_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`content` text,
	`autoGenerated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_remarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int,
	`teacherId` int NOT NULL,
	`remark` text NOT NULL,
	`remarkType` enum('general','performance','behavior','improvement') DEFAULT 'general',
	`isPrivate` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacher_remarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','student','parent','teacher') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `studentUid` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `grade` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `occupation` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_studentUid_unique` UNIQUE(`studentUid`);