ALTER TABLE "job_application" ADD COLUMN "employment_status" varchar(100);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "latitude" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "longitude" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "employment_status" text;