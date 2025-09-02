/*
  Warnings:

  - A unique constraint covering the columns `[courseId,userId]` on the table `Purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Purchases_courseId_userId_key" ON "public"."Purchases"("courseId", "userId");
