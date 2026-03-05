-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pluginType" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "subscribeUrl" TEXT NOT NULL,
    "updateFrequency" INTEGER NOT NULL DEFAULT 60,
    "lastUpdateTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "latency" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "rawConfig" TEXT NOT NULL,
    "airportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Node_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "Airport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GroupNode" (
    "groupId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("groupId", "nodeId"),
    CONSTRAINT "GroupNode_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupNode_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SubscriptionGroup" (
    "subscriptionId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("subscriptionId", "groupId"),
    CONSTRAINT "SubscriptionGroup_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Node_airportId_idx" ON "Node"("airportId");

-- CreateIndex
CREATE INDEX "Node_latency_idx" ON "Node"("latency");

-- CreateIndex
CREATE INDEX "Node_status_idx" ON "Node"("status");

-- CreateIndex
CREATE INDEX "GroupNode_groupId_idx" ON "GroupNode"("groupId");

-- CreateIndex
CREATE INDEX "GroupNode_nodeId_idx" ON "GroupNode"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_token_key" ON "Subscription"("token");

-- CreateIndex
CREATE INDEX "SubscriptionGroup_subscriptionId_idx" ON "SubscriptionGroup"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionGroup_groupId_idx" ON "SubscriptionGroup"("groupId");
