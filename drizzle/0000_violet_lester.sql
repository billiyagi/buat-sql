CREATE TABLE `columns` (
	`id` text PRIMARY KEY NOT NULL,
	`table_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`is_pk` integer DEFAULT false,
	`is_nullable` integer DEFAULT false,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `diagrams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`database_type` text DEFAULT 'generic' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `relations` (
	`id` text PRIMARY KEY NOT NULL,
	`diagram_id` text NOT NULL,
	`from_table_id` text NOT NULL,
	`from_column_id` text NOT NULL,
	`to_table_id` text NOT NULL,
	`to_column_id` text NOT NULL,
	FOREIGN KEY (`diagram_id`) REFERENCES `diagrams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`diagram_id` text NOT NULL,
	`name` text NOT NULL,
	`x` real DEFAULT 0 NOT NULL,
	`y` real DEFAULT 0 NOT NULL,
	`color` text DEFAULT '#3b82f6' NOT NULL,
	FOREIGN KEY (`diagram_id`) REFERENCES `diagrams`(`id`) ON UPDATE no action ON DELETE cascade
);
