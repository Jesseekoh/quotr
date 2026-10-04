PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	FOREIGN KEY (`quote_section_id`) REFERENCES `quote_section`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_quote_item`("id", "quote_id", "quote_option_id", "product_id", "description", "brand", "specification", "category", "quantity", "unit", "unit_price", "total_price", "sort_order", "quote_section_id", "created_at", "updated_at") SELECT "id", "quote_id", "quote_option_id", "product_id", "description", "brand", "specification", "category", "quantity", "unit", "unit_price", "total_price", "sort_order", "quote_section_id", "created_at", "updated_at" FROM `quote_item`;--> statement-breakpoint
DROP TABLE `quote_item`;--> statement-breakpoint
ALTER TABLE `__new_quote_item` RENAME TO `quote_item`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `quote_item_quote_id_idx` ON `quote_item` (`quote_id`);--> statement-breakpoint
CREATE INDEX `quote_item_quote_option_id_idx` ON `quote_item` (`quote_option_id`);