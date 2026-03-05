/*
  Warnings:

  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `subscribeUrl` on the `Airport` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Group_airportId_idx";

-- DropIndex
DROP INDEX "GroupNode_nodeId_idx";

-- DropIndex
DROP INDEX "GroupNode_groupId_idx";

-- DropIndex
DROP INDEX "Node_status_idx";

-- DropIndex
DROP INDEX "Node_latency_idx";

-- DropIndex
DROP INDEX "Node_airportId_idx";

-- DropIndex
DROP INDEX "SubscriptionGroup_groupId_idx";

-- DropIndex
DROP INDEX "SubscriptionGroup_subscriptionId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Group";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GroupNode";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Node";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionGroup";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_AirportToSubscription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AirportToSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "Airport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AirportToSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pluginType" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "subUrl" TEXT,
    "updateFrequency" INTEGER NOT NULL DEFAULT 60,
    "lastUpdateTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "errorMessage" TEXT,
    "nodesJson" JSONB NOT NULL DEFAULT [],
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Airport" ("createdAt", "errorMessage", "id", "lastUpdateTime", "name", "password", "pluginType", "status", "updateFrequency", "updatedAt", "username") SELECT "createdAt", "errorMessage", "id", "lastUpdateTime", "name", "password", "pluginType", "status", "updateFrequency", "updatedAt", "username" FROM "Airport";
DROP TABLE "Airport";
ALTER TABLE "new_Airport" RENAME TO "Airport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_AirportToSubscription_AB_unique" ON "_AirportToSubscription"("A", "B");

-- CreateIndex
CREATE INDEX "_AirportToSubscription_B_index" ON "_AirportToSubscription"("B");
