CREATE TABLE `course_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameBn` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`descriptionBn` text,
	`icon` varchar(100),
	`color` varchar(20),
	`orderIndex` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `course_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subcategoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameBn` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`classLevel` varchar(20),
	`sectionName` varchar(50),
	`orderIndex` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_subcategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameBn` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`descriptionBn` text,
	`orderIndex` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_subcategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `subcategoryId` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `sectionId` int;