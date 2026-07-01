ALTER TABLE "event_transaction" ADD COLUMN "payin_id" varchar(100);--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "payment_channel" text;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "payment_amount" integer;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "fee_amount" integer;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_transaction" ADD COLUMN "raw_callback" jsonb;