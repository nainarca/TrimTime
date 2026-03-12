-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'BARBER', 'SHOP_OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BarberStatus" AS ENUM ('AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLED', 'SERVING', 'SERVED', 'NO_SHOW', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('WALK_IN', 'APPOINTMENT');

-- CreateEnum
CREATE TYPE "QrCodeType" AS ENUM ('SHOP', 'BRANCH', 'BARBER', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'QUEUED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "preferred_lang" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "shop_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_branches" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operating_hours" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "avg_service_duration_mins" INTEGER NOT NULL DEFAULT 20,
    "current_status" "BarberStatus" NOT NULL DEFAULT 'OFFLINE',
    "queue_accepting" BOOLEAN NOT NULL DEFAULT false,
    "max_queue_size" INTEGER NOT NULL DEFAULT 20,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_mins" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barber_services" (
    "id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "custom_duration" INTEGER,
    "custom_price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barber_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_working" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "barber_id" TEXT,
    "type" "QrCodeType" NOT NULL,
    "target_url" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "scan_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "barber_id" TEXT,
    "customer_id" TEXT,
    "guest_phone" TEXT,
    "guest_name" TEXT,
    "service_id" TEXT,
    "ticket_number" INTEGER NOT NULL,
    "ticket_display" TEXT NOT NULL DEFAULT 'A000',
    "entry_type" "EntryType" NOT NULL DEFAULT 'WALK_IN',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "position" INTEGER NOT NULL,
    "estimated_wait_mins" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "called_at" TIMESTAMP(3),
    "serving_at" TIMESTAMP(3),
    "served_at" TIMESTAMP(3),
    "left_at" TIMESTAMP(3),
    "no_show_at" TIMESTAMP(3),
    "appointment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_mins" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barber_breaks" (
    "id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barber_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "queue_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripe_price_id" TEXT,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "max_barbers" INTEGER NOT NULL,
    "max_daily_queue_entries" INTEGER NOT NULL,
    "analytics_retention_days" INTEGER NOT NULL,
    "sms_credits_monthly" INTEGER NOT NULL DEFAULT 0,
    "has_appointments" BOOLEAN NOT NULL DEFAULT false,
    "has_analytics" BOOLEAN NOT NULL DEFAULT false,
    "has_multi_branch" BOOLEAN NOT NULL DEFAULT false,
    "has_api_access" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "trial_ends_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "queue_entry_id" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "event_type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "phone" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_role" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "barber_id" TEXT,
    "date" DATE NOT NULL,
    "total_served" INTEGER NOT NULL DEFAULT 0,
    "total_no_show" INTEGER NOT NULL DEFAULT 0,
    "total_left" INTEGER NOT NULL DEFAULT 0,
    "avg_wait_time_mins" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "avg_service_time_mins" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "peak_hour" INTEGER,
    "total_queue_entries" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_shop_id_idx" ON "user_roles"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_shop_id_key" ON "user_roles"("user_id", "role", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE INDEX "shops_owner_id_idx" ON "shops"("owner_id");

-- CreateIndex
CREATE INDEX "shops_is_active_idx" ON "shops"("is_active");

-- CreateIndex
CREATE INDEX "shop_branches_shop_id_is_active_idx" ON "shop_branches"("shop_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "operating_hours_branch_id_day_of_week_key" ON "operating_hours"("branch_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "barbers_user_id_key" ON "barbers"("user_id");

-- CreateIndex
CREATE INDEX "barbers_shop_id_is_active_idx" ON "barbers"("shop_id", "is_active");

-- CreateIndex
CREATE INDEX "barbers_shop_id_current_status_idx" ON "barbers"("shop_id", "current_status");

-- CreateIndex
CREATE INDEX "services_shop_id_is_active_idx" ON "services"("shop_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "barber_services_barber_id_service_id_key" ON "barber_services"("barber_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "working_hours_barber_id_day_of_week_key" ON "working_hours"("barber_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "idx_qr_code_active" ON "qr_codes"("code", "is_active");

-- CreateIndex
CREATE INDEX "qr_codes_shop_id_is_active_idx" ON "qr_codes"("shop_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_appointment_id_key" ON "queue_entries"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_queue_shop_status_time" ON "queue_entries"("shop_id", "status", "joined_at");

-- CreateIndex
CREATE INDEX "idx_queue_barber_status" ON "queue_entries"("barber_id", "status");

-- CreateIndex
CREATE INDEX "idx_queue_customer_status" ON "queue_entries"("customer_id", "status");

-- CreateIndex
CREATE INDEX "idx_queue_shop_time" ON "queue_entries"("shop_id", "joined_at");

-- CreateIndex
CREATE INDEX "idx_appt_barber_time_status" ON "appointments"("barber_id", "scheduled_at", "status");

-- CreateIndex
CREATE INDEX "idx_appt_customer_time" ON "appointments"("customer_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "idx_appt_shop_time" ON "appointments"("shop_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "barber_breaks_barber_id_starts_at_idx" ON "barber_breaks"("barber_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_queue_id_key" ON "reviews"("queue_id");

-- CreateIndex
CREATE INDEX "reviews_barber_id_is_visible_idx" ON "reviews"("barber_id", "is_visible");

-- CreateIndex
CREATE INDEX "reviews_shop_id_is_visible_idx" ON "reviews"("shop_id", "is_visible");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_customer_id_queue_id_key" ON "reviews"("customer_id", "queue_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_shop_id_key" ON "subscriptions"("shop_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

-- CreateIndex
CREATE INDEX "idx_notif_user_time" ON "notification_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_notif_queue_entry" ON "notification_logs"("queue_entry_id");

-- CreateIndex
CREATE INDEX "idx_notif_status_time" ON "notification_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_otp_phone_valid" ON "otp_requests"("phone", "is_used", "expires_at");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_actor_time" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_action_time" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_shop_date" ON "analytics_snapshots"("shop_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_shop_id_barber_id_date_key" ON "analytics_snapshots"("shop_id", "barber_id", "date");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_branches" ADD CONSTRAINT "shop_branches_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "shop_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "shop_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "shop_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "shop_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "shop_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_breaks" ADD CONSTRAINT "barber_breaks_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_requests" ADD CONSTRAINT "otp_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
