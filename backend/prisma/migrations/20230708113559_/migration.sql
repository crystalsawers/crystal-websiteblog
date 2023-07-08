/*
  Warnings:

  - You are about to drop the `_BlogPostCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BlogPostCategory" DROP CONSTRAINT "_BlogPostCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlogPostCategory" DROP CONSTRAINT "_BlogPostCategory_B_fkey";

-- DropTable
DROP TABLE "_BlogPostCategory";

-- CreateTable
CREATE TABLE "_BlogPostToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostToCategory_AB_unique" ON "_BlogPostToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostToCategory_B_index" ON "_BlogPostToCategory"("B");

-- AddForeignKey
ALTER TABLE "_BlogPostToCategory" ADD CONSTRAINT "_BlogPostToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostToCategory" ADD CONSTRAINT "_BlogPostToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
