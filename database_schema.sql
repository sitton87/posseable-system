USE [master]
GO
/****** Object:  Database [PosseableDB]    Script Date: 06/12/2025 22:29:43 ******/
CREATE DATABASE [PosseableDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'PosseableDB', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\PosseableDB.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'PosseableDB_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\PosseableDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [PosseableDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PosseableDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PosseableDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [PosseableDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [PosseableDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [PosseableDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [PosseableDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [PosseableDB] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [PosseableDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [PosseableDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [PosseableDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [PosseableDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [PosseableDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [PosseableDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [PosseableDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [PosseableDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [PosseableDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [PosseableDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [PosseableDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [PosseableDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [PosseableDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [PosseableDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [PosseableDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [PosseableDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [PosseableDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [PosseableDB] SET  MULTI_USER 
GO
ALTER DATABASE [PosseableDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [PosseableDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [PosseableDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [PosseableDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [PosseableDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [PosseableDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [PosseableDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [PosseableDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PosseableDB]
GO
/****** Object:  User [posseable_user]    Script Date: 06/12/2025 22:29:43 ******/
CREATE USER [posseable_user] FOR LOGIN [posseable_user] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [posseable_user]
GO
/****** Object:  Table [dbo].[activity]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[season_id] [int] NOT NULL,
	[kind] [nvarchar](50) NOT NULL,
	[activity_date] [date] NOT NULL,
	[start_time] [time](0) NULL,
	[end_time] [time](0) NULL,
	[location] [nvarchar](255) NULL,
	[capacity] [int] NULL,
	[status] [nvarchar](50) NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[group_id] [uniqueidentifier] NULL,
	[series_id] [int] NOT NULL,
 CONSTRAINT [PK_activity] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[activity_equipment]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_equipment](
	[activity_id] [int] NOT NULL,
	[equipment_id] [int] NOT NULL,
	[quantity] [int] NOT NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_activity_equipment] PRIMARY KEY CLUSTERED 
(
	[activity_id] ASC,
	[equipment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[activity_volunteer]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_volunteer](
	[activity_id] [int] NOT NULL,
	[volunteer_national_id] [varchar](9) NOT NULL,
	[role_id] [int] NULL,
	[is_lead] [bit] NOT NULL,
	[assigned_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_activity_volunteer] PRIMARY KEY CLUSTERED 
(
	[activity_id] ASC,
	[volunteer_national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[app_page]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[app_page](
	[page_key] [nvarchar](100) NOT NULL,
	[display_name] [nvarchar](150) NOT NULL,
	[route_path] [nvarchar](200) NOT NULL,
	[category] [nvarchar](100) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[page_key] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[app_role_group]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[app_role_group](
	[code] [nvarchar](50) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[is_default] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[app_role_group_permission]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[app_role_group_permission](
	[role_group_code] [nvarchar](50) NOT NULL,
	[page_key] [nvarchar](100) NOT NULL,
	[permission_level] [nvarchar](10) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
	[updated_by] [nvarchar](100) NULL,
 CONSTRAINT [PK_app_role_group_permission] PRIMARY KEY CLUSTERED 
(
	[role_group_code] ASC,
	[page_key] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[app_user]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[app_user](
	[national_id] [varchar](9) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password_hash] [nvarchar](255) NOT NULL,
	[must_reset] [bit] NOT NULL,
	[role] [nvarchar](20) NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[role_group_code] [nvarchar](50) NULL,
 CONSTRAINT [PK_app_user] PRIMARY KEY CLUSTERED 
(
	[national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[donor]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[donor](
	[national_id] [varchar](9) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[organization] [nvarchar](255) NULL,
	[notes] [nvarchar](max) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_donor] PRIMARY KEY CLUSTERED 
(
	[national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[category] [nvarchar](100) NULL,
	[size] [nvarchar](50) NULL,
	[condition] [nvarchar](50) NULL,
	[active] [bit] NOT NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_equipment] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_category]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_category](
	[family_code] [char](2) NOT NULL,
	[code] [char](2) NOT NULL,
	[name] [nvarchar](150) NOT NULL,
	[description] [nvarchar](255) NULL,
	[enforce_sku] [bit] NOT NULL,
	[require_image] [bit] NOT NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_equipment_category] PRIMARY KEY CLUSTERED 
(
	[family_code] ASC,
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_family]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_family](
	[code] [char](2) NOT NULL,
	[name] [nvarchar](150) NOT NULL,
	[description] [nvarchar](255) NULL,
	[equipment_type] [nvarchar](20) NOT NULL,
	[allow_item_images] [bit] NOT NULL,
	[allow_consumables] [bit] NOT NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_equipment_family] PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_item]    Script Date: 06/12/2025 22:29:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_item](
	[id] [uniqueidentifier] NOT NULL,
	[family_code] [char](2) NOT NULL,
	[category_code] [char](2) NOT NULL,
	[serial_number] [int] NOT NULL,
	[internal_sku]  AS (([family_code]+[category_code])+right(concat('000',CONVERT([varchar](3),[serial_number])),(3))) PERSISTED,
	[manufacturer_sku] [nvarchar](100) NULL,
	[name] [nvarchar](200) NOT NULL,
	[description] [nvarchar](max) NULL,
	[equipment_type] [nvarchar](20) NOT NULL,
	[condition] [nvarchar](20) NOT NULL,
	[is_consumable] [bit] NOT NULL,
	[is_sku_tracked] [bit] NOT NULL,
	[min_stock] [int] NULL,
	[max_stock] [int] NULL,
	[is_rental] [bit] NOT NULL,
	[rental_expiry] [date] NULL,
	[manufacturer_name] [nvarchar](150) NULL,
	[default_image_url] [nvarchar](500) NULL,
	[purchase_cost] [decimal](14, 2) NULL,
	[notes] [nvarchar](max) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
	[ownership_type] [nvarchar](20) NULL,
	[supplier_identifier] [varchar](20) NULL,
 CONSTRAINT [PK_equipment_item] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_equipment_item_internal_sku] UNIQUE NONCLUSTERED 
(
	[internal_sku] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_item_media]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_item_media](
	[id] [uniqueidentifier] NOT NULL,
	[item_id] [uniqueidentifier] NOT NULL,
	[file_url] [nvarchar](500) NOT NULL,
	[caption] [nvarchar](255) NULL,
	[is_primary] [bit] NOT NULL,
	[uploaded_by] [nvarchar](100) NULL,
	[uploaded_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_equipment_item_media] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_stock]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_stock](
	[item_id] [uniqueidentifier] NOT NULL,
	[warehouse_id] [uniqueidentifier] NOT NULL,
	[quantity] [decimal](14, 2) NOT NULL,
	[reserved_qty] [decimal](14, 2) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_equipment_stock] PRIMARY KEY CLUSTERED 
(
	[item_id] ASC,
	[warehouse_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_stock_ledger]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_stock_ledger](
	[id] [uniqueidentifier] NOT NULL,
	[item_id] [uniqueidentifier] NOT NULL,
	[warehouse_id] [uniqueidentifier] NOT NULL,
	[receipt_item_id] [uniqueidentifier] NULL,
	[movement_type] [nvarchar](20) NOT NULL,
	[quantity] [decimal](14, 2) NOT NULL,
	[movement_date] [datetime2](0) NOT NULL,
	[reference_doc] [nvarchar](50) NULL,
	[created_by] [nvarchar](100) NULL,
	[notes] [nvarchar](255) NULL,
 CONSTRAINT [PK_equipment_stock_ledger] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[equipment_supplier_event]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[equipment_supplier_event](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[equipment_id] [int] NOT NULL,
	[supplier_identifier] [varchar](20) NOT NULL,
	[event_type] [nvarchar](50) NOT NULL,
	[event_date] [date] NOT NULL,
	[quantity] [int] NULL,
	[cost] [decimal](18, 2) NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_equipment_supplier_event] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[finance_transaction]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[finance_transaction](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[transaction_date] [date] NOT NULL,
	[type] [nvarchar](20) NOT NULL,
	[category] [nvarchar](200) NOT NULL,
	[description] [nvarchar](400) NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[donor_id] [varchar](9) NULL,
	[supplier_id] [varchar](20) NULL,
	[notes] [nvarchar](max) NULL,
	[activity_id] [int] NULL,
	[created_at] [datetime2](7) NOT NULL,
	[paid_by] [nvarchar](200) NULL,
	[payment_details] [nvarchar](max) NULL,
	[has_invoice] [bit] NULL,
	[invoice_number] [nvarchar](100) NULL,
	[attachment_name] [nvarchar](255) NULL,
	[attachment_mime] [nvarchar](100) NULL,
	[attachment_data] [varbinary](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[finance_transaction_donor]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[finance_transaction_donor](
	[finance_transaction_id] [int] NOT NULL,
	[donor_id] [varchar](9) NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_finance_transaction_donor] PRIMARY KEY CLUSTERED 
(
	[finance_transaction_id] ASC,
	[donor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[finance_txn]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[finance_txn](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[txn_date] [date] NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[direction] [nvarchar](10) NOT NULL,
	[income_source] [nvarchar](100) NULL,
	[expense_category] [nvarchar](100) NULL,
	[donor_national_id] [varchar](9) NULL,
	[supplier_identifier] [varchar](20) NULL,
	[activity_id] [int] NULL,
	[registration_id] [int] NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_finance_txn] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[group]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[group](
	[id] [uniqueidentifier] NOT NULL,
	[name] [nvarchar](200) NOT NULL,
	[description] [nvarchar](1000) NULL,
	[season_id] [int] NOT NULL,
	[additional_seasons] [nvarchar](max) NULL,
	[min_participants] [int] NOT NULL,
	[max_participants] [int] NOT NULL,
	[current_participants] [int] NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[is_active] [bit] NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
	[start_season_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[inventory_document]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventory_document](
	[id] [uniqueidentifier] NOT NULL,
	[document_number] [bigint] IDENTITY(1,1) NOT NULL,
	[action_type] [nvarchar](40) NOT NULL,
	[document_date] [datetime2](3) NOT NULL,
	[source_warehouse_id] [uniqueidentifier] NULL,
	[target_warehouse_id] [uniqueidentifier] NULL,
	[activity_id] [int] NULL,
	[supplier_identifier] [varchar](20) NULL,
	[reference_number] [nvarchar](100) NULL,
	[notes] [nvarchar](max) NULL,
	[external_party] [nvarchar](200) NULL,
	[created_by] [varchar](9) NOT NULL,
	[created_at] [datetime2](3) NOT NULL,
 CONSTRAINT [PK_inventory_document] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_inventory_document_number] UNIQUE NONCLUSTERED 
(
	[document_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[inventory_document_line]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventory_document_line](
	[id] [uniqueidentifier] NOT NULL,
	[document_id] [uniqueidentifier] NOT NULL,
	[item_id] [uniqueidentifier] NOT NULL,
	[source_warehouse_id] [uniqueidentifier] NULL,
	[target_warehouse_id] [uniqueidentifier] NULL,
	[quantity] [decimal](18, 2) NOT NULL,
	[unit_cost] [decimal](18, 2) NULL,
	[supplier_document_number] [nvarchar](100) NULL,
	[reference_note] [nvarchar](200) NULL,
	[extra_metadata] [nvarchar](max) NULL,
 CONSTRAINT [PK_inventory_document_line] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[inventory_import_batch]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inventory_import_batch](
	[id] [uniqueidentifier] NOT NULL,
	[source_type] [nvarchar](20) NOT NULL,
	[template_version] [nvarchar](20) NULL,
	[source_file_name] [nvarchar](255) NULL,
	[uploaded_by] [nvarchar](100) NULL,
	[uploaded_at] [datetime2](0) NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[warning_count] [int] NOT NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_inventory_import_batch] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[registration]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[registration](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[activity_id] [int] NOT NULL,
	[surfer_id] [varchar](9) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_registration] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_registration_activity_surfer] UNIQUE NONCLUSTERED 
(
	[activity_id] ASC,
	[surfer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](500) NULL,
 CONSTRAINT [PK_role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_role_name] UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[season_activity_series]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[season_activity_series](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[season_id] [int] NOT NULL,
	[name] [nvarchar](200) NOT NULL,
	[description] [nvarchar](1000) NULL,
	[status] [nvarchar](50) NULL,
	[start_date] [date] NULL,
	[end_date] [date] NULL,
	[lead_national_id] [varchar](9) NULL,
	[notes] [nvarchar](max) NULL,
	[is_default] [bit] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[season_plan]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[season_plan](
	[id] [int] IDENTITY(1000,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[year] [int] NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_season_plan] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[supplier]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[supplier](
	[supplier_identifier] [varchar](20) NOT NULL,
	[identifier_type] [varchar](10) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[contact_name] [nvarchar](255) NULL,
	[phone] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[notes] [nvarchar](max) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_supplier] PRIMARY KEY CLUSTERED 
(
	[supplier_identifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[surfer]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[surfer](
	[national_id] [varchar](9) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[active] [bit] NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[residence] [nvarchar](200) NULL,
	[age] [int] NULL,
	[gender] [nvarchar](20) NULL,
	[date_of_birth] [date] NULL,
	[status] [nvarchar](50) NULL,
	[program] [nvarchar](200) NULL,
	[medical_approval] [bit] NULL,
	[medical_condition] [nvarchar](1000) NULL,
	[needs_wheelchair] [bit] NULL,
	[volunteers_needed] [int] NULL,
	[special_requirements] [nvarchar](max) NULL,
	[emergency_contact_name] [nvarchar](255) NULL,
	[emergency_contact_phone] [nvarchar](50) NULL,
	[group_id] [uniqueidentifier] NULL,
 CONSTRAINT [PK_surfer] PRIMARY KEY CLUSTERED 
(
	[national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[volunteer]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[volunteer](
	[national_id] [varchar](9) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[kind] [nvarchar](50) NULL,
	[active] [bit] NOT NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[street] [nvarchar](200) NULL,
	[house_number] [nvarchar](20) NULL,
	[city] [nvarchar](100) NULL,
	[join_date] [date] NULL,
	[training_date] [date] NULL,
	[total_activities] [int] NOT NULL,
	[profession] [nvarchar](200) NULL,
	[sea_connection_level] [tinyint] NULL,
	[volunteer_type] [nvarchar](50) NULL,
	[media_specialization] [nvarchar](100) NULL,
	[availability] [nvarchar](max) NULL,
	[personal_website] [nvarchar](500) NULL,
	[documents] [nvarchar](max) NULL,
 CONSTRAINT [PK_volunteer] PRIMARY KEY CLUSTERED 
(
	[national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[volunteer_role]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[volunteer_role](
	[volunteer_national_id] [varchar](9) NOT NULL,
	[role_id] [int] NOT NULL,
	[assigned_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_volunteer_role] PRIMARY KEY CLUSTERED 
(
	[volunteer_national_id] ASC,
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[warehouse]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[warehouse](
	[id] [uniqueidentifier] NOT NULL,
	[code] [nvarchar](10) NOT NULL,
	[name] [nvarchar](150) NOT NULL,
	[address_line] [nvarchar](255) NULL,
	[city] [nvarchar](100) NULL,
	[postal_code] [nvarchar](20) NULL,
	[manager_name] [nvarchar](150) NULL,
	[manager_phone] [nvarchar](50) NULL,
	[manager_email] [nvarchar](150) NULL,
	[contact_name] [nvarchar](150) NULL,
	[contact_phone] [nvarchar](50) NULL,
	[rent_cost] [decimal](14, 2) NULL,
	[rent_currency] [char](3) NULL,
	[rent_expiry] [date] NULL,
	[lease_notes] [nvarchar](max) NULL,
	[general_notes] [nvarchar](max) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](0) NOT NULL,
	[updated_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_warehouse] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_warehouse_code] UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[warehouse_document]    Script Date: 06/12/2025 22:29:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[warehouse_document](
	[id] [uniqueidentifier] NOT NULL,
	[warehouse_id] [uniqueidentifier] NOT NULL,
	[file_name] [nvarchar](255) NOT NULL,
	[file_url] [nvarchar](500) NOT NULL,
	[uploaded_by] [nvarchar](100) NULL,
	[uploaded_at] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_warehouse_document] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [IX_activity_group]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_activity_group] ON [dbo].[activity]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_activity_equipment_activity]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_activity_equipment_activity] ON [dbo].[activity_equipment]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_activity_volunteer_role]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_activity_volunteer_role] ON [dbo].[activity_volunteer]
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_activity_volunteer_volunteer]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_activity_volunteer_volunteer] ON [dbo].[activity_volunteer]
(
	[volunteer_national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_equipment_item_manufacturer_sku]    Script Date: 06/12/2025 22:29:44 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_equipment_item_manufacturer_sku] ON [dbo].[equipment_item]
(
	[manufacturer_sku] ASC
)
WHERE ([manufacturer_sku] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_finance_transaction_activity_id]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_activity_id] ON [dbo].[finance_transaction]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_transaction_type_date]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_type_date] ON [dbo].[finance_transaction]
(
	[type] ASC,
	[transaction_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_transaction_donor_donor]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_donor_donor] ON [dbo].[finance_transaction_donor]
(
	[donor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_finance_transaction_donor_transaction]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_donor_transaction] ON [dbo].[finance_transaction_donor]
(
	[finance_transaction_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_finance_txn_activity]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_activity] ON [dbo].[finance_txn]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_finance_txn_date]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_date] ON [dbo].[finance_txn]
(
	[txn_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_txn_donor]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_donor] ON [dbo].[finance_txn]
(
	[donor_national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_txn_supplier]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_supplier] ON [dbo].[finance_txn]
(
	[supplier_identifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_group_season]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_group_season] ON [dbo].[group]
(
	[season_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_group_status]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_group_status] ON [dbo].[group]
(
	[status] ASC
)
WHERE ([is_active]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_inventory_document_action_date]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_action_date] ON [dbo].[inventory_document]
(
	[action_type] ASC,
	[document_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_inventory_document_line_document]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_line_document] ON [dbo].[inventory_document_line]
(
	[document_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_inventory_document_line_item]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_line_item] ON [dbo].[inventory_document_line]
(
	[item_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_registration_activity]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_registration_activity] ON [dbo].[registration]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_registration_surfer]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_registration_surfer] ON [dbo].[registration]
(
	[surfer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_season_activity_series_season]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_season_activity_series_season] ON [dbo].[season_activity_series]
(
	[season_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UX_season_activity_series_default_per_season]    Script Date: 06/12/2025 22:29:44 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_season_activity_series_default_per_season] ON [dbo].[season_activity_series]
(
	[season_id] ASC
)
WHERE ([is_default]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_season_activity_series_season_name]    Script Date: 06/12/2025 22:29:44 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_season_activity_series_season_name] ON [dbo].[season_activity_series]
(
	[season_id] ASC,
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_surfer_group]    Script Date: 06/12/2025 22:29:44 ******/
CREATE NONCLUSTERED INDEX [IX_surfer_group] ON [dbo].[surfer]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[activity] ADD  DEFAULT ('Planned') FOR [status]
GO
ALTER TABLE [dbo].[activity] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[activity_equipment] ADD  DEFAULT ((1)) FOR [quantity]
GO
ALTER TABLE [dbo].[activity_volunteer] ADD  DEFAULT ((0)) FOR [is_lead]
GO
ALTER TABLE [dbo].[activity_volunteer] ADD  DEFAULT (sysdatetime()) FOR [assigned_at]
GO
ALTER TABLE [dbo].[app_page] ADD  CONSTRAINT [DF_app_page_is_active]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[app_page] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[app_role_group] ADD  CONSTRAINT [DF_app_role_group_is_default]  DEFAULT ((0)) FOR [is_default]
GO
ALTER TABLE [dbo].[app_role_group] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[app_role_group_permission] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[app_user] ADD  DEFAULT ((1)) FOR [must_reset]
GO
ALTER TABLE [dbo].[app_user] ADD  DEFAULT ('User') FOR [role]
GO
ALTER TABLE [dbo].[app_user] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[donor] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[donor] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[equipment] ADD  DEFAULT ((1)) FOR [active]
GO
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_enforce_sku]  DEFAULT ((0)) FOR [enforce_sku]
GO
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_req_img]  DEFAULT ((0)) FOR [require_image]
GO
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_is_active]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_allow_img]  DEFAULT ((0)) FOR [allow_item_images]
GO
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_allow_cons]  DEFAULT ((1)) FOR [allow_consumables]
GO
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_is_active]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_consumable]  DEFAULT ((0)) FOR [is_consumable]
GO
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_sku_tracked]  DEFAULT ((1)) FOR [is_sku_tracked]
GO
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_rental]  DEFAULT ((0)) FOR [is_rental]
GO
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_is_active]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT ((0)) FOR [is_primary]
GO
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT ((0)) FOR [quantity]
GO
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT ((0)) FOR [reserved_qty]
GO
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[equipment_stock_ledger] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[equipment_stock_ledger] ADD  DEFAULT (sysutcdatetime()) FOR [movement_date]
GO
ALTER TABLE [dbo].[finance_transaction] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[finance_transaction] ADD  CONSTRAINT [DF_finance_transaction_has_invoice]  DEFAULT ((0)) FOR [has_invoice]
GO
ALTER TABLE [dbo].[finance_transaction_donor] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[finance_txn] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT ((5)) FOR [min_participants]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT ((15)) FOR [max_participants]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT ((0)) FOR [current_participants]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT ('פעיל') FOR [status]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[group] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (newsequentialid()) FOR [id]
GO
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (sysutcdatetime()) FOR [document_date]
GO
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[inventory_document_line] ADD  DEFAULT (newsequentialid()) FOR [id]
GO
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT ((0)) FOR [warning_count]
GO
ALTER TABLE [dbo].[registration] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[registration] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[season_activity_series] ADD  CONSTRAINT [DF_season_activity_series_is_default]  DEFAULT ((0)) FOR [is_default]
GO
ALTER TABLE [dbo].[season_activity_series] ADD  CONSTRAINT [DF_season_activity_series_created_at]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[supplier] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[supplier] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[surfer] ADD  DEFAULT ((1)) FOR [active]
GO
ALTER TABLE [dbo].[surfer] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT ((1)) FOR [active]
GO
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT ((0)) FOR [total_activities]
GO
ALTER TABLE [dbo].[volunteer_role] ADD  DEFAULT (sysdatetime()) FOR [assigned_at]
GO
ALTER TABLE [dbo].[warehouse] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_is_active]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[warehouse_document] ADD  DEFAULT (newid()) FOR [id]
GO
ALTER TABLE [dbo].[warehouse_document] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[activity]  WITH CHECK ADD FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_group]
GO
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_season] FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_season]
GO
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_series] FOREIGN KEY([series_id])
REFERENCES [dbo].[season_activity_series] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_series]
GO
ALTER TABLE [dbo].[activity_equipment]  WITH CHECK ADD  CONSTRAINT [FK_activity_equipment_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[activity_equipment] CHECK CONSTRAINT [FK_activity_equipment_activity]
GO
ALTER TABLE [dbo].[activity_equipment]  WITH CHECK ADD  CONSTRAINT [FK_activity_equipment_equipment] FOREIGN KEY([equipment_id])
REFERENCES [dbo].[equipment] ([id])
GO
ALTER TABLE [dbo].[activity_equipment] CHECK CONSTRAINT [FK_activity_equipment_equipment]
GO
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_activity]
GO
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_role] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_role]
GO
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_volunteer] FOREIGN KEY([volunteer_national_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_volunteer]
GO
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD  CONSTRAINT [FK_app_role_group_permission_group] FOREIGN KEY([role_group_code])
REFERENCES [dbo].[app_role_group] ([code])
GO
ALTER TABLE [dbo].[app_role_group_permission] CHECK CONSTRAINT [FK_app_role_group_permission_group]
GO
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD  CONSTRAINT [FK_app_role_group_permission_page] FOREIGN KEY([page_key])
REFERENCES [dbo].[app_page] ([page_key])
GO
ALTER TABLE [dbo].[app_role_group_permission] CHECK CONSTRAINT [FK_app_role_group_permission_page]
GO
ALTER TABLE [dbo].[app_user]  WITH CHECK ADD  CONSTRAINT [FK_app_user_role_group] FOREIGN KEY([role_group_code])
REFERENCES [dbo].[app_role_group] ([code])
GO
ALTER TABLE [dbo].[app_user] CHECK CONSTRAINT [FK_app_user_role_group]
GO
ALTER TABLE [dbo].[equipment_category]  WITH CHECK ADD  CONSTRAINT [FK_equipment_category_family] FOREIGN KEY([family_code])
REFERENCES [dbo].[equipment_family] ([code])
GO
ALTER TABLE [dbo].[equipment_category] CHECK CONSTRAINT [FK_equipment_category_family]
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_category] FOREIGN KEY([family_code], [category_code])
REFERENCES [dbo].[equipment_category] ([family_code], [code])
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [FK_equipment_item_category]
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_family] FOREIGN KEY([family_code])
REFERENCES [dbo].[equipment_family] ([code])
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [FK_equipment_item_family]
GO
ALTER TABLE [dbo].[equipment_item_media]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_media] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[equipment_item_media] CHECK CONSTRAINT [FK_equipment_item_media]
GO
ALTER TABLE [dbo].[equipment_stock]  WITH CHECK ADD  CONSTRAINT [FK_equipment_stock_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[equipment_stock] CHECK CONSTRAINT [FK_equipment_stock_item]
GO
ALTER TABLE [dbo].[equipment_stock]  WITH CHECK ADD  CONSTRAINT [FK_equipment_stock_warehouse] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[equipment_stock] CHECK CONSTRAINT [FK_equipment_stock_warehouse]
GO
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD  CONSTRAINT [FK_esl_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[equipment_stock_ledger] CHECK CONSTRAINT [FK_esl_item]
GO
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD  CONSTRAINT [FK_esl_warehouse] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[equipment_stock_ledger] CHECK CONSTRAINT [FK_esl_warehouse]
GO
ALTER TABLE [dbo].[equipment_supplier_event]  WITH CHECK ADD  CONSTRAINT [FK_eq_event_equipment] FOREIGN KEY([equipment_id])
REFERENCES [dbo].[equipment] ([id])
GO
ALTER TABLE [dbo].[equipment_supplier_event] CHECK CONSTRAINT [FK_eq_event_equipment]
GO
ALTER TABLE [dbo].[equipment_supplier_event]  WITH CHECK ADD  CONSTRAINT [FK_eq_event_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[equipment_supplier_event] CHECK CONSTRAINT [FK_eq_event_supplier]
GO
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_activity]
GO
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor] FOREIGN KEY([donor_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_donor]
GO
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_supplier] FOREIGN KEY([supplier_id])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_supplier]
GO
ALTER TABLE [dbo].[finance_transaction_donor]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor_shares_donor] FOREIGN KEY([donor_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_transaction_donor] CHECK CONSTRAINT [FK_finance_transaction_donor_shares_donor]
GO
ALTER TABLE [dbo].[finance_transaction_donor]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor_shares_transaction] FOREIGN KEY([finance_transaction_id])
REFERENCES [dbo].[finance_transaction] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[finance_transaction_donor] CHECK CONSTRAINT [FK_finance_transaction_donor_shares_transaction]
GO
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_activity]
GO
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_donor] FOREIGN KEY([donor_national_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_donor]
GO
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_registration] FOREIGN KEY([registration_id])
REFERENCES [dbo].[registration] ([id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_registration]
GO
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_supplier]
GO
ALTER TABLE [dbo].[group]  WITH CHECK ADD FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
GO
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_activity]
GO
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_created_by] FOREIGN KEY([created_by])
REFERENCES [dbo].[app_user] ([national_id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_created_by]
GO
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_source_wh] FOREIGN KEY([source_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_source_wh]
GO
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_supplier]
GO
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_target_wh] FOREIGN KEY([target_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_target_wh]
GO
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_document] FOREIGN KEY([document_id])
REFERENCES [dbo].[inventory_document] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_document]
GO
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_item]
GO
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_source_wh] FOREIGN KEY([source_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_source_wh]
GO
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_target_wh] FOREIGN KEY([target_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_target_wh]
GO
ALTER TABLE [dbo].[registration]  WITH CHECK ADD  CONSTRAINT [FK_registration_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[registration] CHECK CONSTRAINT [FK_registration_activity]
GO
ALTER TABLE [dbo].[registration]  WITH CHECK ADD  CONSTRAINT [FK_registration_surfer] FOREIGN KEY([surfer_id])
REFERENCES [dbo].[surfer] ([national_id])
GO
ALTER TABLE [dbo].[registration] CHECK CONSTRAINT [FK_registration_surfer]
GO
ALTER TABLE [dbo].[season_activity_series]  WITH CHECK ADD  CONSTRAINT [FK_season_activity_series_season] FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[season_activity_series] CHECK CONSTRAINT [FK_season_activity_series_season]
GO
ALTER TABLE [dbo].[surfer]  WITH CHECK ADD FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[surfer]  WITH CHECK ADD  CONSTRAINT [FK_surfer_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[surfer] CHECK CONSTRAINT [FK_surfer_group]
GO
ALTER TABLE [dbo].[volunteer_role]  WITH CHECK ADD  CONSTRAINT [FK_volunteer_role_role] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[volunteer_role] CHECK CONSTRAINT [FK_volunteer_role_role]
GO
ALTER TABLE [dbo].[volunteer_role]  WITH CHECK ADD  CONSTRAINT [FK_volunteer_role_volunteer] FOREIGN KEY([volunteer_national_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO
ALTER TABLE [dbo].[volunteer_role] CHECK CONSTRAINT [FK_volunteer_role_volunteer]
GO
ALTER TABLE [dbo].[warehouse_document]  WITH CHECK ADD  CONSTRAINT [FK_warehouse_document] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[warehouse_document] CHECK CONSTRAINT [FK_warehouse_document]
GO
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD CHECK  (([permission_level]='write' OR [permission_level]='read' OR [permission_level]='none'))
GO
ALTER TABLE [dbo].[equipment_family]  WITH CHECK ADD CHECK  (([equipment_type]='support' OR [equipment_type]='sea'))
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([condition]='damaged' OR [condition]='used' OR [condition]='new'))
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([equipment_type]='support' OR [equipment_type]='sea'))
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([serial_number]>=(0) AND [serial_number]<=(999)))
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [CK_equipment_item_minmax] CHECK  (([is_sku_tracked]=(1) AND [min_stock] IS NULL AND [max_stock] IS NULL OR [is_sku_tracked]=(0)))
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [CK_equipment_item_minmax]
GO
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [CK_equipment_item_rental] CHECK  (([is_rental]=(0) AND [rental_expiry] IS NULL OR [is_rental]=(1)))
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [CK_equipment_item_rental]
GO
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD CHECK  (([movement_type]='delete' OR [movement_type]='adjustment' OR [movement_type]='receipt'))
GO
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD CHECK  (([direction]='OUT' OR [direction]='IN'))
GO
ALTER TABLE [dbo].[inventory_import_batch]  WITH CHECK ADD CHECK  (([source_type]='excel' OR [source_type]='manual'))
GO
ALTER TABLE [dbo].[inventory_import_batch]  WITH CHECK ADD CHECK  (([status]='failed' OR [status]='processed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[supplier]  WITH CHECK ADD CHECK  (([identifier_type]='HP' OR [identifier_type]='ID'))
GO
USE [master]
GO
ALTER DATABASE [PosseableDB] SET  READ_WRITE 
GO
