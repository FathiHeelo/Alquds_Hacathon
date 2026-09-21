-- Technician opt-in and coordinates are required for safe radius-based urgent dispatch.
ALTER TABLE `TechnicianProfile`
  ADD COLUMN `lat` DOUBLE NULL,
  ADD COLUMN `lng` DOUBLE NULL,
  ADD COLUMN `acceptsUrgentRequests` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `UrgentDispatch` (
  `id` VARCHAR(191) NOT NULL,
  `requestId` VARCHAR(191) NOT NULL,
  `radiusKm` INTEGER NOT NULL DEFAULT 3,
  `eligibleTechnicianIds` JSON NOT NULL,
  `acceptedTechnicianId` VARCHAR(191) NULL,
  `status` ENUM('searching', 'assigned', 'cancelled', 'expired') NOT NULL DEFAULT 'searching',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `UrgentDispatch_requestId_key`(`requestId`),
  INDEX `UrgentDispatch_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `UrgentDispatch`
  ADD CONSTRAINT `UrgentDispatch_requestId_fkey`
  FOREIGN KEY (`requestId`) REFERENCES `RepairRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
