ALTER TABLE "friends" RENAME TO "followers";--> statement-breakpoint
ALTER TABLE "followers" RENAME COLUMN "friend_id" TO "follower_id";--> statement-breakpoint
ALTER TABLE "followers" DROP CONSTRAINT "friends_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "followers" DROP CONSTRAINT "friends_friend_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "followers" ADD COLUMN "id" serial NOT NULL PRIMARY KEY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
