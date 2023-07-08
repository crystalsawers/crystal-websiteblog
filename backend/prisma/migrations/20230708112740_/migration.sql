/*
  Warnings:

  - You are about to drop the column `categoryId` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the `_BlogPostToCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BlogPostToCategory" DROP CONSTRAINT "_BlogPostToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlogPostToCategory" DROP CONSTRAINT "_BlogPostToCategory_B_fkey";

-- AlterTable
ALTER TABLE "BlogPost" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "_BlogPostToCategory";

-- CreateTable
CREATE TABLE "_BlogPostCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostCategory_AB_unique" ON "_BlogPostCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostCategory_B_index" ON "_BlogPostCategory"("B");

-- AddForeignKey
ALTER TABLE "_BlogPostCategory" ADD CONSTRAINT "_BlogPostCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostCategory" ADD CONSTRAINT "_BlogPostCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
