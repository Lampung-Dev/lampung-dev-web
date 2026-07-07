CREATE TABLE "job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"company_initial" varchar(5) NOT NULL,
	"location" varchar(200) NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"salary" varchar(100) NOT NULL,
	"experience" varchar(100) NOT NULL,
	"education" varchar(100) NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text NOT NULL,
	"responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "job" ADD CONSTRAINT "job_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_category_idx" ON "job" USING btree ("category");--> statement-breakpoint
CREATE INDEX "job_is_active_idx" ON "job" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "job_created_at_idx" ON "job" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sponsor_category_idx" ON "sponsor" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sponsor_active_idx" ON "sponsor" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sponsor_order_idx" ON "sponsor" USING btree ("display_order");