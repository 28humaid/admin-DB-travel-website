BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Admins] (
    [admin_id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(100) NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [full_name] NVARCHAR(100),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Admins_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [Admins_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Admins_pkey] PRIMARY KEY CLUSTERED ([admin_id]),
    CONSTRAINT [Admins_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Clients] (
    [client_id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(50) NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [email1] NVARCHAR(100) NOT NULL,
    [email2] NVARCHAR(100),
    [email3] NVARCHAR(100),
    [mobile_no] NVARCHAR(20),
    [company_name] NVARCHAR(150) NOT NULL,
    [sub_corporate] NVARCHAR(150),
    [sub_entity] NVARCHAR(150) NOT NULL,
    [gst_no] NVARCHAR(50),
    [address] NVARCHAR(max),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Clients_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL CONSTRAINT [Clients_updated_at_df] DEFAULT CURRENT_TIMESTAMP,
    [created_by_admin_id] INT NOT NULL,
    CONSTRAINT [Clients_pkey] PRIMARY KEY CLUSTERED ([client_id]),
    CONSTRAINT [Clients_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [Clients_company_name_sub_corporate_sub_entity_key] UNIQUE NONCLUSTERED ([company_name],[sub_corporate],[sub_entity])
);

-- CreateTable
CREATE TABLE [dbo].[Bookings] (
    [booking_internal_id] INT NOT NULL IDENTITY(1,1),
    [client_id] INT NOT NULL,
    [serial_no] INT,
    [date_of_booking] DATETIME2,
    [pnr_ticket_no] NVARCHAR(50) NOT NULL,
    [date_of_travel] DATETIME2,
    [passengerName] NVARCHAR(100),
    [sector] NVARCHAR(100) NOT NULL,
    [origin_stn] NVARCHAR(50),
    [destination_stn] NVARCHAR(50),
    [class] NVARCHAR(20),
    [quota] NVARCHAR(20),
    [no_of_pax] INT,
    [ticket_amount] MONEY,
    [s_charges] MONEY,
    [gst_18] MONEY,
    [total_amount] MONEY,
    [booking_id] NVARCHAR(50) NOT NULL,
    [vendee_corporate] NVARCHAR(150),
    [sub_corporate] NVARCHAR(150),
    [sub_entity] NVARCHAR(150),
    [ntt_bill_no] NVARCHAR(50),
    [invoice_no] NVARCHAR(50),
    [statement_period] NVARCHAR(50),
    [gst_no] NVARCHAR(50),
    [gst_state] NVARCHAR(50),
    [cgst_9] MONEY,
    [sgst_9] MONEY,
    [igst_18] MONEY,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Bookings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Bookings_pkey] PRIMARY KEY CLUSTERED ([booking_internal_id]),
    CONSTRAINT [Bookings_client_id_pnr_ticket_no_key] UNIQUE NONCLUSTERED ([client_id],[pnr_ticket_no])
);

-- CreateTable
CREATE TABLE [dbo].[Refunds] (
    [refund_internal_id] INT NOT NULL IDENTITY(1,1),
    [client_id] INT NOT NULL,
    [serial_no] INT,
    [refund_date] DATETIME2,
    [pnr_no] NVARCHAR(50) NOT NULL,
    [refund_amount] MONEY,
    [vendee_corporate] NVARCHAR(150),
    [sub_corporate] NVARCHAR(150),
    [sub_entity] NVARCHAR(150),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Refunds_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Refunds_pkey] PRIMARY KEY CLUSTERED ([refund_internal_id]),
    CONSTRAINT [Refunds_client_id_pnr_no_key] UNIQUE NONCLUSTERED ([client_id],[pnr_no])
);

-- CreateTable
CREATE TABLE [dbo].[Upload_Logs] (
    [log_id] INT NOT NULL IDENTITY(1,1),
    [admin_id] INT NOT NULL,
    [upload_type] NVARCHAR(20) NOT NULL,
    [file_name] NVARCHAR(255),
    [rows_inserted] INT,
    [upload_date] DATETIME2 NOT NULL CONSTRAINT [Upload_Logs_upload_date_df] DEFAULT CURRENT_TIMESTAMP,
    [notes] NVARCHAR(max),
    CONSTRAINT [Upload_Logs_pkey] PRIMARY KEY CLUSTERED ([log_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Clients_company_name_sub_corporate_sub_entity_idx] ON [dbo].[Clients]([company_name], [sub_corporate], [sub_entity]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Bookings_client_id_date_of_travel_idx] ON [dbo].[Bookings]([client_id], [date_of_travel]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Bookings_pnr_ticket_no_idx] ON [dbo].[Bookings]([pnr_ticket_no]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Refunds_client_id_refund_date_idx] ON [dbo].[Refunds]([client_id], [refund_date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Refunds_pnr_no_idx] ON [dbo].[Refunds]([pnr_no]);

-- AddForeignKey
ALTER TABLE [dbo].[Clients] ADD CONSTRAINT [Clients_created_by_admin_id_fkey] FOREIGN KEY ([created_by_admin_id]) REFERENCES [dbo].[Admins]([admin_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [Bookings_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[Clients]([client_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Refunds] ADD CONSTRAINT [Refunds_client_id_fkey] FOREIGN KEY ([client_id]) REFERENCES [dbo].[Clients]([client_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Upload_Logs] ADD CONSTRAINT [Upload_Logs_admin_id_fkey] FOREIGN KEY ([admin_id]) REFERENCES [dbo].[Admins]([admin_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
