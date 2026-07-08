ALTER TABLE "job" ADD COLUMN "slug" varchar(250) DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX "job_slug_idx" ON "job" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_slug_unique" UNIQUE("slug");