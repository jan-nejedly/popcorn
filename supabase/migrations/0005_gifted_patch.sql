ALTER TABLE "followers" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;