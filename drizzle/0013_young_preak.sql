CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(250) NOT NULL,
	"description" text,
	"logo_url" text,
	"website" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(250) NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(50) NOT NULL,
	"linkedin" text,
	"portfolio" text,
	"resume_url" text NOT NULL,
	"expected_salary" varchar(100),
	"availability" varchar(100) NOT NULL,
	"cover_letter" text NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"company_id" uuid,
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
ALTER TABLE "user" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "company" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "job_category_idx" ON "job" USING btree ("category");--> statement-breakpoint
CREATE INDEX "job_is_active_idx" ON "job" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "job_created_at_idx" ON "job" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_company_idx" ON "job" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sponsor_category_idx" ON "sponsor" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sponsor_active_idx" ON "sponsor" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sponsor_order_idx" ON "sponsor" USING btree ("display_order");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_company_idx" ON "user" USING btree ("company_id");