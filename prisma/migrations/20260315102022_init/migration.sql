-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
