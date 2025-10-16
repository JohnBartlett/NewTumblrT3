-- CreateTable
CREATE TABLE "StoredImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "blogName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "tags" TEXT NOT NULL,
    "description" TEXT,
    "notes" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "storedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoredImage_userId_idx" ON "StoredImage"("userId");

-- CreateIndex
CREATE INDEX "StoredImage_blogName_idx" ON "StoredImage"("blogName");

-- CreateIndex
CREATE INDEX "StoredImage_storedAt_idx" ON "StoredImage"("storedAt");

-- CreateIndex
CREATE INDEX "StoredImage_timestamp_idx" ON "StoredImage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "StoredImage_userId_postId_key" ON "StoredImage"("userId", "postId");

-- AddForeignKey
ALTER TABLE "StoredImage" ADD CONSTRAINT "StoredImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
