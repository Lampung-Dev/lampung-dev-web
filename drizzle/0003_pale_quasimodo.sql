CREATE TABLE "event_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'REGISTERED' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attended" boolean DEFAULT false NOT NULL,
	"attended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(250) NOT NULL,
	"description" text NOT NULL,
	"event_type_id" uuid,
	"location" varchar(300) NOT NULL,
	"image_url" text NOT NULL,
	"instagram_url" text,
	"event_date" timestamp with time zone NOT NULL,
	"max_capacity" integer,
	"registration_status" text DEFAULT 'OPEN' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_event_type_id_event_type_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_registration_event_idx" ON "event_registration" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_registration_user_idx" ON "event_registration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_registration_status_idx" ON "event_registration" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_slug_idx" ON "event" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_date_idx" ON "event" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "event_reg_status_idx" ON "event" USING btree ("registration_status");--> statement-breakpoint
CREATE INDEX "event_type_name_idx" ON "event_type" USING btree ("name");