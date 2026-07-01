CREATE TABLE "sponsor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"logo_url" text NOT NULL,
	"website_url" text,
	"category" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sponsor_category_idx" ON "sponsor" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sponsor_active_idx" ON "sponsor" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sponsor_order_idx" ON "sponsor" USING btree ("display_order");