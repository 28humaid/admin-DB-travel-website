/*
  Warnings:

  - You are about to alter the column `date_of_booking` on the `Bookings` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `date_of_travel` on the `Bookings` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `statement_period` on the `Bookings` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(50)` to `Date`.
  - You are about to alter the column `refund_date` on the `Refunds` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [Bookings_client_id_date_of_travel_idx] ON [dbo].[Bookings];

-- DropIndex
DROP INDEX [Refunds_client_id_refund_date_idx] ON [dbo].[Refunds];

-- AlterTable
ALTER TABLE [dbo].[Admins] ADD [created_at] DATETIME2 NOT NULL CONSTRAINT [Admins_created_at_df] DEFAULT CURRENT_TIMESTAMP,
[updated_at] DATETIME2 NOT NULL CONSTRAINT [Admins_updated_at_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[Bookings] ALTER COLUMN [date_of_booking] DATE NULL;
ALTER TABLE [dbo].[Bookings] ALTER COLUMN [date_of_travel] DATE NULL;
ALTER TABLE [dbo].[Bookings] ALTER COLUMN [sector] NVARCHAR(100) NULL;
ALTER TABLE [dbo].[Bookings] ALTER COLUMN [statement_period] DATE NULL;

-- AlterTable
ALTER TABLE [dbo].[Clients] ADD [has_excel] BIT NOT NULL CONSTRAINT [Clients_has_excel_df] DEFAULT 0;

-- AlterTable
ALTER TABLE [dbo].[Refunds] ALTER COLUMN [refund_date] DATE NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Bookings_client_id_date_of_travel_idx] ON [dbo].[Bookings]([client_id], [date_of_travel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Refunds_client_id_refund_date_idx] ON [dbo].[Refunds]([client_id], [refund_date]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
