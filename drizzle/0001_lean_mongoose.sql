CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`alertType` enum('low_stock','out_of_stock','pending_approval') NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readById` int,
	`readDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationId` int NOT NULL,
	`requestedById` int NOT NULL,
	`firstLevelApproverId` int,
	`secondLevelApproverId` int,
	`firstLevelStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`secondLevelStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`firstLevelApprovalDate` datetime,
	`secondLevelApprovalDate` datetime,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`),
	CONSTRAINT `approvals_operationId_unique` UNIQUE(`operationId`)
);
--> statement-breakpoint
CREATE TABLE `dailyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` datetime NOT NULL,
	`totalParts` int NOT NULL,
	`lowStockParts` int NOT NULL,
	`totalConsumption` int NOT NULL,
	`totalAdditions` int NOT NULL,
	`totalOperations` int NOT NULL,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`previousQuantity` int NOT NULL,
	`newQuantity` int NOT NULL,
	`changeType` enum('addition','consumption','adjustment') NOT NULL,
	`operationId` int,
	`notes` text,
	`changedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthlyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`totalConsumption` int NOT NULL,
	`totalAdditions` int NOT NULL,
	`totalOperations` int NOT NULL,
	`averageDailyConsumption` decimal(10,2) NOT NULL,
	`estimatedMaintenanceCost` decimal(10,2) NOT NULL,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthlyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`operationDate` datetime NOT NULL,
	`operationType` enum('addition','consumption') NOT NULL,
	`vehicleId` int NOT NULL,
	`partId` int NOT NULL,
	`quantity` int NOT NULL,
	`driverName` varchar(255) NOT NULL,
	`notes` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdById` int NOT NULL,
	`approvedById` int,
	`approvalDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operations_id` PRIMARY KEY(`id`),
	CONSTRAINT `operations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `parts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`quantityAvailable` int NOT NULL DEFAULT 0,
	`quantityRequired` int NOT NULL DEFAULT 0,
	`alertThreshold` int NOT NULL DEFAULT 0,
	`cost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parts_id` PRIMARY KEY(`id`),
	CONSTRAINT `parts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`plateNumber` varchar(50) NOT NULL,
	`driverName` varchar(255) NOT NULL,
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`lastMaintenanceDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_code_unique` UNIQUE(`code`),
	CONSTRAINT `vehicles_plateNumber_unique` UNIQUE(`plateNumber`)
);
