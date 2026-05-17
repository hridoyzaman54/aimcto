CREATE TABLE `quiz_answer_grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`questionId` int NOT NULL,
	`studentAnswer` text,
	`isCorrect` boolean,
	`marksAwarded` decimal(5,2) DEFAULT '0',
	`maxMarks` int DEFAULT 1,
	`feedback` text,
	`gradedBy` int,
	`gradedAt` timestamp,
	`isAutoGraded` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_answer_grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `score` decimal(10,2);--> statement-breakpoint
ALTER TABLE `quiz_questions` MODIFY COLUMN `questionType` enum('mcq','true_false','short_answer','long_answer','fill_blank') DEFAULT 'mcq';--> statement-breakpoint
ALTER TABLE `quiz_questions` MODIFY COLUMN `correctAnswer` text;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `handwrittenUploadUrl` text;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `handwrittenUploadName` varchar(255);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `autoGradedScore` decimal(10,2);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `manualGradedScore` decimal(10,2);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `gradingStatus` enum('pending','auto_graded','partially_graded','fully_graded') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `gradedBy` int;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `gradedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `feedback` text;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `submittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `isAutoSubmitted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `answerGuideline` text;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `negativeMarks` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `imageUrl` text;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `isRequired` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `instructions` text;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `showCorrectAnswers` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `announcementDate` timestamp;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `subcategoryId` int;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `sectionId` int;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `targetClass` varchar(50);--> statement-breakpoint
ALTER TABLE `quizzes` ADD `targetSection` varchar(50);--> statement-breakpoint
ALTER TABLE `quizzes` ADD `allowHandwrittenUpload` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `requireHandwrittenUpload` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `autoGrade` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `gradingStatus` enum('pending','partial','completed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `quizzes` ADD `createdBy` int;