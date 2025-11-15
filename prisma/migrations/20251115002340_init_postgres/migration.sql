-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "image" TEXT,
    "profile_image_url" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_users" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "family_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule_type" TEXT NOT NULL,
    "schedule_days" TEXT,
    "scheduled_time" TEXT,
    "parent_habit_id" INTEGER,
    "is_parent" BOOLEAN NOT NULL,
    "created_at" TEXT,
    "updated_at" TEXT,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_completions" (
    "id" SERIAL NOT NULL,
    "habit_id" INTEGER NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "created_at" TEXT,

    CONSTRAINT "habit_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule_type" TEXT,
    "schedule_days" TEXT,
    "scheduled_time" time,
    "due_date" TIMESTAMP(3),
    "due_time" time,
    "reminder_datetime" TEXT,
    "reminder_recurrence" TEXT,
    "reminder_days" TEXT,
    "is_completed" BOOLEAN,
    "completed_at" TEXT,
    "is_dismissed" BOOLEAN,
    "dismissed_at" TIMESTAMP(3),
    "priority" TEXT,
    "parent_item_id" INTEGER,
    "is_parent" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TEXT,
    "recurrence_type" TEXT,
    "recurrence_interval" INTEGER,
    "recurrence_unit" TEXT,
    "recurrence_anchor" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_completions" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "item_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flask_dance_oauth" (
    "user_id" TEXT,
    "browser_session_key" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "token" json NOT NULL,

    CONSTRAINT "flask_dance_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_users_2" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "family_users_family_id_user_id_key" ON "family_users"("family_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_habit_completions_1" ON "habit_completions"("habit_id", "completion_date");

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_item_completions_1" ON "item_completions"("item_id", "completion_date");

-- CreateIndex
CREATE UNIQUE INDEX "sqlite_autoindex_flask_dance_oauth_1" ON "flask_dance_oauth"("user_id", "browser_session_key", "provider");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_users" ADD CONSTRAINT "family_users_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_users" ADD CONSTRAINT "family_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_parent_habit_id_fkey" FOREIGN KEY ("parent_habit_id") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_parent_item_id_fkey" FOREIGN KEY ("parent_item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "item_completions" ADD CONSTRAINT "item_completions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "flask_dance_oauth" ADD CONSTRAINT "flask_dance_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
