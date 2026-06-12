-- DropIndex
DROP INDEX IF EXISTS "ConceptNote_incidentId_key";

-- AlterTable
ALTER TABLE "ConceptNote" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ConceptNote" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE UNIQUE INDEX "ConceptNote_incidentId_version_key" ON "ConceptNote"("incidentId", "version");
