-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "FactState" AS ENUM ('yes', 'no', 'unknown');
CREATE TYPE "GenderType" AS ENUM ('mens', 'womens', 'all_gender', 'private');
CREATE TYPE "Confidence" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ReportStatus" AS ENUM ('open', 'reviewed', 'dismissed');
CREATE TYPE "ReportType" AS ENUM ('incorrect_access', 'closed', 'directions', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailDomain" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MagicLinkToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "centroidLat" DOUBLE PRECISION NOT NULL,
    "centroidLng" DOUBLE PRECISION NOT NULL,
    "footprint" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "importedAt" TIMESTAMP(3),
    "stepFreeAccess" "FactState" NOT NULL DEFAULT 'unknown',
    "hours" TEXT,
    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Washroom" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "directions" TEXT NOT NULL,
    "genderType" "GenderType" NOT NULL,
    "hours" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "bayesianScore" DOUBLE PRECISION,
    "rankLetter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Washroom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WashroomAttribute" (
    "id" TEXT NOT NULL,
    "washroomId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" "FactState" NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WashroomAttribute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "washroomId" TEXT NOT NULL,
    "cleanliness" INTEGER NOT NULL,
    "privacy" INTEGER NOT NULL,
    "availability" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "washroomId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataImport" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureCount" INTEGER NOT NULL,
    CONSTRAINT "DataImport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "MagicLinkToken_tokenHash_key" ON "MagicLinkToken"("tokenHash");
CREATE INDEX "MagicLinkToken_email_createdAt_idx" ON "MagicLinkToken"("email", "createdAt");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "Building_sourceId_key" ON "Building"("sourceId");
CREATE INDEX "Building_centroidLat_centroidLng_idx" ON "Building"("centroidLat", "centroidLng");
CREATE INDEX "Building_name_idx" ON "Building"("name");
CREATE INDEX "Washroom_buildingId_idx" ON "Washroom"("buildingId");
CREATE UNIQUE INDEX "WashroomAttribute_washroomId_key_key" ON "WashroomAttribute"("washroomId", "key");
CREATE UNIQUE INDEX "Rating_userId_washroomId_key" ON "Rating"("userId", "washroomId");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Washroom" ADD CONSTRAINT "Washroom_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WashroomAttribute" ADD CONSTRAINT "WashroomAttribute_washroomId_fkey" FOREIGN KEY ("washroomId") REFERENCES "Washroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_washroomId_fkey" FOREIGN KEY ("washroomId") REFERENCES "Washroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_washroomId_fkey" FOREIGN KEY ("washroomId") REFERENCES "Washroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
