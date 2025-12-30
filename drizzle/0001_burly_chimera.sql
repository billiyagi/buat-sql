ALTER TABLE `relations` ADD `on_delete` text DEFAULT 'NO ACTION' NOT NULL;--> statement-breakpoint
ALTER TABLE `relations` ADD `on_update` text DEFAULT 'NO ACTION' NOT NULL;