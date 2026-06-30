-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "fulfillmentType" TEXT NOT NULL DEFAULT 'delivery',
ADD COLUMN     "locationLink" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pickupName" TEXT,
ADD COLUMN     "pickupTime" TEXT;
