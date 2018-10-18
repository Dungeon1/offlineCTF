BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `users` (
	`id`	INTEGER,
	`username`	TEXT NOT NULL,
	`email`	TEXT,
	`isAdmin`	BOOLEAN,
	`isHidden`	BOOLEAN,
	`password`	TEXT,
	`school`	INTEGER,
	`region`	TEXT,
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `tasks` (
	`id`	INTEGER,
	`name`	TEXT,
	`desc`	TEXT,
	`file`	TEXT,
	`flag`	TEXT,
	`score`	INT,
	`category`	INT,
	FOREIGN KEY(`category`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `pages` (
	`id`	INTEGER,
	`name`	TEXT,
	`url`	TEXT,
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `flags` (
	`task_id`	INTEGER,
	`user_id`	INTEGER,
	`score`	INTEGER,
	`timestamp`	BIGINT,
	`ip`	TEXT,
	PRIMARY KEY(`task_id`,`user_id`),
	FOREIGN KEY(`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
	FOREIGN KEY(`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `categories` (
	`id`	INTEGER,
	`page_id`	INTEGER,
	`name`	TEXT,
	`template`	TEXT,
	PRIMARY KEY(`id`)
);
COMMIT;
