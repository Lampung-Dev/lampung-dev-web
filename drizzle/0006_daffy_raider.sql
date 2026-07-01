CREATE TABLE "event_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"provider" text DEFAULT 'XENITH' NOT NULL,
	"external_id" text,
	"reference_code" text,
	"is_processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_transaction_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE varchar(250);--> statement-breakpoint
ALTER TABLE "event_transaction" ADD CONSTRAINT "event_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD CONSTRAINT "event_transaction_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_trx_user_idx" ON "event_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_trx_event_idx" ON "event_transaction" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_trx_status_idx" ON "event_transaction" USING btree ("status");