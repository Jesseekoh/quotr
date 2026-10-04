PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customer` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_customer`("id", "user_id", "name", "phone", "email", "address", "created_at", "updated_at") SELECT "id", "user_id", "name", "phone", "email", "address", "created_at", "updated_at" FROM `customer`;--> statement-breakpoint
DROP TABLE `customer`;--> statement-breakpoint
ALTER TABLE `__new_customer` RENAME TO `customer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `customer_user_id_idx` ON `customer` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_quote` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quote_number` text NOT NULL,
	`customer_id` text NOT NULL,
	`label` text DEFAULT 'ENDUSER_PRICE' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`load_profile_total` integer,
	`load_profile_notes` text,
	`payment_terms` text,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_quote`("id", "user_id", "quote_number", "customer_id", "label", "status", "load_profile_total", "load_profile_notes", "payment_terms", "notes", "created_at", "updated_at") SELECT "id", "user_id", "quote_number", "customer_id", "label", "status", "load_profile_total", "load_profile_notes", "payment_terms", "notes", "created_at", "updated_at" FROM `quote`;--> statement-breakpoint
DROP TABLE `quote`;--> statement-breakpoint
ALTER TABLE `__new_quote` RENAME TO `quote`;--> statement-breakpoint
CREATE UNIQUE INDEX `quote_quote_number_unique` ON `quote` (`quote_number`);--> statement-breakpoint
CREATE INDEX `quote_user_id_idx` ON `quote` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_quote_item` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`quote_option_id` text,
	`product_id` text,
	`description` text NOT NULL,
	`brand` text,
	`specification` text,
	`category` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'pcs',
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`quote_section_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quote`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_option_id`) REFERENCES `quote_option`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quote_section_id`) REFERENCES `quote_section`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_quote_item`("id", "quote_id", "quote_option_id", "product_id", "description", "brand", "specification", "category", "quantity", "unit", "unit_price", "total_price", "sort_order", "quote_section_id", "created_at", "updated_at") SELECT "id", "quote_id", "quote_option_id", "product_id", "description", "brand", "specification", "category", "quantity", "unit", "unit_price", "total_price", "sort_order", "quote_section_id", "created_at", "updated_at" FROM `quote_item`;--> statement-breakpoint
DROP TABLE `quote_item`;--> statement-breakpoint
ALTER TABLE `__new_quote_item` RENAME TO `quote_item`;--> statement-breakpoint
CREATE INDEX `quote_item_quote_id_idx` ON `quote_item` (`quote_id`);--> statement-breakpoint
CREATE INDEX `quote_item_quote_option_id_idx` ON `quote_item` (`quote_option_id`);--> statement-breakpoint
CREATE TABLE `__new_quote_option` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_default` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`quote_section_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quote`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_section_id`) REFERENCES `quote_section`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_quote_option`("id", "quote_id", "name", "description", "is_default", "sort_order", "quote_section_id", "created_at", "updated_at") SELECT "id", "quote_id", "name", "description", "is_default", "sort_order", "quote_section_id", "created_at", "updated_at" FROM `quote_option`;--> statement-breakpoint
DROP TABLE `quote_option`;--> statement-breakpoint
ALTER TABLE `__new_quote_option` RENAME TO `quote_option`;--> statement-breakpoint
CREATE INDEX `quote_option_quote_id_idx` ON `quote_option` (`quote_id`);--> statement-breakpoint
CREATE TABLE `__new_quote_section` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quote`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_quote_section`("id", "quote_id", "name", "sort_order", "created_at", "updated_at") SELECT "id", "quote_id", "name", "sort_order", "created_at", "updated_at" FROM `quote_section`;--> statement-breakpoint
DROP TABLE `quote_section`;--> statement-breakpoint
ALTER TABLE `__new_quote_section` RENAME TO `quote_section`;--> statement-breakpoint
CREATE INDEX `quote_section_quote_id_idx` ON `quote_section` (`quote_id`);