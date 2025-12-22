/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Order_Product` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrderStatusEnum" AS ENUM ('pending', 'cancelled', 'completed');

-- DropForeignKey
ALTER TABLE "Order_Product" DROP CONSTRAINT "FK_073c85ed133e05241040bd70f02";

-- DropForeignKey
ALTER TABLE "Order_Product" DROP CONSTRAINT "FK_3fb066240db56c9558a91139431";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatusEnum" NOT NULL DEFAULT 'pending',
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "total" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET NOT NULL;

-- DropTable
DROP TABLE "Order_Product";

-- DropEnum
DROP TYPE "Order_Status_Enum";

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtTime" DECIMAL(10,2) NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "FK_073c85ed133e05241040bd70f02" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "FK_3fb066240db56c9558a91139431" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
