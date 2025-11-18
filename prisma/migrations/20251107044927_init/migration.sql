/*
  Warnings:

  - You are about to drop the columns `created_at` and `updated_at` on the `Admins` table.
    All the data in those columns will be lost.
*/

BEGIN TRY

BEGIN TRAN;

/* --------------------------------------------------------------
   1. Drop the DEFAULT constraints that SQL Server created
      for the two columns (they are named automatically).
   -------------------------------------------------------------- */
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += N'ALTER TABLE [dbo].[Admins] DROP CONSTRAINT [' + dc.name + N']; '
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID(N'[dbo].[Admins]')
  AND c.name IN (N'created_at', N'updated_at');

EXEC sp_executesql @sql;

/* --------------------------------------------------------------
   2. Now it is safe to drop the columns.
   -------------------------------------------------------------- */
ALTER TABLE [dbo].[Admins]
DROP COLUMN [created_at], [updated_at];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH