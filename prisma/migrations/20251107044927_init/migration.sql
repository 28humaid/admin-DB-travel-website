/*
  Warnings:

  - You are about to drop the column `created_at` on the `Admins` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Admins` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Admins] DROP COLUMN [created_at],
[updated_at];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
