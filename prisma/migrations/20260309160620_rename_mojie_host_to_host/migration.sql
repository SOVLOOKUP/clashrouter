/*
  Warnings:

  - You are about to drop the column `mojieHost` on the `Airport` table. All the data in the column will be lost.

*/
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
    "host" TEXT,
    "updateFrequency" INTEGER NOT NULL DEFAULT 60,
    "lastUpdateTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "errorMessage" TEXT,
    "nodesJson" JSONB NOT NULL DEFAULT [],
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Airport" ("createdAt", "errorMessage", "host", "id", "lastUpdateTime", "name", "nodeCount", "nodesJson", "password", "pluginType", "status", "subUrl", "updateFrequency", "updatedAt", "username") SELECT "createdAt", "errorMessage", "mojieHost", "id", "lastUpdateTime", "name", "nodeCount", "nodesJson", "password", "pluginType", "status", "subUrl", "updateFrequency", "updatedAt", "username" FROM "Airport";
DROP TABLE "Airport";
ALTER TABLE "new_Airport" RENAME TO "Airport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
