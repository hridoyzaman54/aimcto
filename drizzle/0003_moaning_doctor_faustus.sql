CREATE TABLE `chat_group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','moderator','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`leftAt` timestamp,
	`isActive` boolean DEFAULT true,
	CONSTRAINT `chat_group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('course','section','class','custom') NOT NULL DEFAULT 'custom',
	`courseId` int,
	`createdBy` int NOT NULL,
	`avatarUrl` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_message_reads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_message_reads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`attachmentUrl` text,
	`attachmentType` varchar(50),
	`isEdited` boolean DEFAULT false,
	`editedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_messages_id` PRIMARY KEY(`id`)
);
