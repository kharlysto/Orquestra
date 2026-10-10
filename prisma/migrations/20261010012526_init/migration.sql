-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'SALES', 'INVENTORY', 'ANALYTICS', 'CRM');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ELECTRONICS', 'FOOD', 'APPAREL', 'BEAUTY', 'HOME', 'GENERAL');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'PHP', 'EUR', 'GBP', 'JPY', 'CNY');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('SOLD', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MessageVisibility" AS ENUM ('GENERAL', 'PRIVATE');

-- CreateEnum
CREATE TYPE "AuthChallengePurpose" AS ENUM ('SIGNUP', 'LOGIN');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('WHATSAPP', 'WECHAT', 'LINE', 'MESSENGER', 'VIBER', 'TELEGRAM', 'SMS', 'GMAIL', 'OUTLOOK');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CrmDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CrmMessageStatus" AS ENUM ('RECEIVED', 'QUEUED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DISCONNECTED', 'CONNECTED');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "trustedIps" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "details" JSONB NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "stock" INTEGER NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'SOLD',
    "note" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "source" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "record" JSONB NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "code" TEXT NOT NULL,
    "temporaryPassword" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentionUserId" TEXT,
    "attachment" JSONB,
    "visibility" "MessageVisibility" NOT NULL DEFAULT 'GENERAL',
    "recipientId" TEXT,
    "replyToId" TEXT,
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "externalId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "subject" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmMessage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "direction" "CrmDirection" NOT NULL,
    "externalId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CrmMessageStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "label" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "accountAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" "AuthChallengePurpose" NOT NULL,
    "ip" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_ownerId_key" ON "Workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Product_workspaceId_category_idx" ON "Product"("workspaceId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Product_workspaceId_sku_key" ON "Product"("workspaceId", "sku");

-- CreateIndex
CREATE INDEX "Sale_workspaceId_createdAt_idx" ON "Sale"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Customer_workspaceId_name_idx" ON "Customer"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_code_key" ON "Invitation"("code");

-- CreateIndex
CREATE INDEX "Invitation_workspaceId_email_idx" ON "Invitation"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "Message_workspaceId_createdAt_idx" ON "Message"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_workspaceId_visibility_idx" ON "Message"("workspaceId", "visibility");

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_lastMessageAt_idx" ON "Conversation"("workspaceId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_workspaceId_channel_externalId_key" ON "Conversation"("workspaceId", "channel", "externalId");

-- CreateIndex
CREATE INDEX "CrmMessage_workspaceId_conversationId_createdAt_idx" ON "CrmMessage"("workspaceId", "conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmMessage_workspaceId_channel_externalId_key" ON "CrmMessage"("workspaceId", "channel", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_channel_key" ON "Integration"("workspaceId", "channel");

-- CreateIndex
CREATE INDEX "AuthChallenge_email_purpose_createdAt_idx" ON "AuthChallenge"("email", "purpose", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveEntry" ADD CONSTRAINT "ArchiveEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveEntry" ADD CONSTRAINT "ArchiveEntry_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthChallenge" ADD CONSTRAINT "AuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
