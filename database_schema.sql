# [PosseableDB]
USE [master]
GO

/****** Object:  Database [PosseableDB]    Script Date: 28/12/2025 17:49:38 ******/
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

# [posseable_user]
USE [PosseableDB]
GO

/****** Object:  User [posseable_user]    Script Date: 28/12/2025 17:49:38 ******/
CREATE USER [posseable_user] FOR LOGIN [posseable_user] WITH DEFAULT_SCHEMA=[dbo]
GO

ALTER ROLE [db_owner] ADD MEMBER [posseable_user]
GO

# [dbo].[activity]
/****** Object:  Table [dbo].[activity]    Script Date: 28/12/2025 17:49:38 ******/
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
	[activity_manager_id] [varchar](9) NULL,
	[safety_manager_id] [varchar](9) NULL,
	[sea_condition] [nvarchar](500) NULL,
	[weather_notes] [nvarchar](500) NULL,
	[summary_general] [nvarchar](max) NULL,
	[summary_preserve] [nvarchar](max) NULL,
	[summary_improve] [nvarchar](max) NULL,
 CONSTRAINT [PK_activity] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[activity_checklist]
/****** Object:  Table [dbo].[activity_checklist]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_checklist](
	[id] [uniqueidentifier] NOT NULL,
	[activity_id] [int] NOT NULL,
	[item_text] [nvarchar](500) NOT NULL,
	[is_completed] [bit] NOT NULL,
	[category] [nvarchar](50) NULL,
	[assigned_to_volunteer_id] [varchar](9) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[activity_equipment]
/****** Object:  Table [dbo].[activity_equipment]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[activity_equipment_request]
/****** Object:  Table [dbo].[activity_equipment_request]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_equipment_request](
	[id] [uniqueidentifier] NOT NULL,
	[activity_id] [int] NOT NULL,
	[item_id] [uniqueidentifier] NOT NULL,
	[quantity] [int] NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[notes] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[activity_surfer_assignment]
/****** Object:  Table [dbo].[activity_surfer_assignment]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[activity_surfer_assignment](
	[id] [uniqueidentifier] NOT NULL,
	[activity_id] [int] NOT NULL,
	[surfer_id] [varchar](9) NOT NULL,
	[volunteer_id] [varchar](9) NOT NULL,
	[role] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[activity_volunteer]
/****** Object:  Table [dbo].[activity_volunteer]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[app_page]
/****** Object:  Table [dbo].[app_page]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[app_role_group]
/****** Object:  Table [dbo].[app_role_group]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[app_role_group_permission]
/****** Object:  Table [dbo].[app_role_group_permission]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[app_user]
/****** Object:  Table [dbo].[app_user]    Script Date: 28/12/2025 17:49:38 ******/
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
	[is_active] [bit] NOT NULL,
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

# [dbo].[donor]
/****** Object:  Table [dbo].[donor]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment]
/****** Object:  Table [dbo].[equipment]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_category]
/****** Object:  Table [dbo].[equipment_category]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_family]
/****** Object:  Table [dbo].[equipment_family]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_item]
/****** Object:  Table [dbo].[equipment_item]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_item_media]
/****** Object:  Table [dbo].[equipment_item_media]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_stock]
/****** Object:  Table [dbo].[equipment_stock]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_stock_ledger]
/****** Object:  Table [dbo].[equipment_stock_ledger]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[equipment_supplier_event]
/****** Object:  Table [dbo].[equipment_supplier_event]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[finance_transaction]
/****** Object:  Table [dbo].[finance_transaction]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[finance_transaction_donor]
/****** Object:  Table [dbo].[finance_transaction_donor]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[finance_txn]
/****** Object:  Table [dbo].[finance_txn]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[group]
/****** Object:  Table [dbo].[group]    Script Date: 28/12/2025 17:49:38 ******/
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
	[start_date] [date] NULL,
	[end_date] [date] NULL,
	[created_by] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[inventory_document]
/****** Object:  Table [dbo].[inventory_document]    Script Date: 28/12/2025 17:49:38 ******/
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
	[created_by] [varchar](9) NOT NULL,
	[created_at] [datetime2](3) NOT NULL,
	[external_party] [nvarchar](200) NULL,
	[donor_national_id] [varchar](9) NULL,
	[supplier_document_type] [nvarchar](100) NULL,
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

# [dbo].[inventory_document_line]
/****** Object:  Table [dbo].[inventory_document_line]    Script Date: 28/12/2025 17:49:38 ******/
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
	[reference_note] [nvarchar](200) NULL,
	[extra_metadata] [nvarchar](max) NULL,
	[supplier_document_number] [nvarchar](100) NULL,
 CONSTRAINT [PK_inventory_document_line] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[inventory_import_batch]
/****** Object:  Table [dbo].[inventory_import_batch]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[note]
/****** Object:  Table [dbo].[note]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[note](
	[note_id] [uniqueidentifier] NOT NULL,
	[entity_type] [nvarchar](50) NOT NULL,
	[entity_id] [nvarchar](100) NOT NULL,
	[title] [nvarchar](200) NULL,
	[body] [nvarchar](max) NOT NULL,
	[status] [nvarchar](20) NULL,
	[priority] [nvarchar](20) NULL,
	[due_date] [datetime2](7) NULL,
	[created_by] [nvarchar](100) NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_by] [nvarchar](100) NULL,
	[updated_at] [datetime2](7) NULL,
 CONSTRAINT [PK_note] PRIMARY KEY CLUSTERED 
(
	[note_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[note_status_history]
/****** Object:  Table [dbo].[note_status_history]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[note_status_history](
	[id] [uniqueidentifier] NOT NULL,
	[note_id] [uniqueidentifier] NOT NULL,
	[old_status] [nvarchar](20) NULL,
	[new_status] [nvarchar](20) NOT NULL,
	[changed_by] [nvarchar](20) NULL,
	[changed_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[registration]
/****** Object:  Table [dbo].[registration]    Script Date: 28/12/2025 17:49:38 ******/
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
	[attendance_status] [nvarchar](50) NULL,
	[summary_feedback] [nvarchar](max) NULL,
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

# [dbo].[role]
/****** Object:  Table [dbo].[role]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](500) NULL,
	[requires_certification] [bit] NOT NULL,
	[requires_renewal] [bit] NOT NULL,
	[color_hex] [varchar](7) NULL,
	[requires_training] [bit] NOT NULL,
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

# [dbo].[season_activity_series]
/****** Object:  Table [dbo].[season_activity_series]    Script Date: 28/12/2025 17:49:38 ******/
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
	[group_id] [uniqueidentifier] NULL,
	[schedule_type] [nvarchar](50) NULL,
	[default_day] [int] NULL,
	[default_start_time] [time](0) NULL,
	[default_end_time] [time](0) NULL,
	[frequency] [nvarchar](50) NULL,
	[occurrences_count] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[season_plan]
/****** Object:  Table [dbo].[season_plan]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[supplier]
/****** Object:  Table [dbo].[supplier]    Script Date: 28/12/2025 17:49:38 ******/
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
	[supplier_type] [nvarchar](50) NOT NULL,
	[services_offered] [nvarchar](400) NULL,
	[has_active_contract] [bit] NOT NULL,
 CONSTRAINT [PK_supplier] PRIMARY KEY CLUSTERED 
(
	[supplier_identifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[supplier_activity_log]
/****** Object:  Table [dbo].[supplier_activity_log]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[supplier_activity_log](
	[activity_id] [uniqueidentifier] NOT NULL,
	[supplier_identifier] [varchar](20) NOT NULL,
	[activity_type] [nvarchar](50) NOT NULL,
	[related_document_id] [nvarchar](100) NULL,
	[related_document_type] [nvarchar](50) NULL,
	[description] [nvarchar](max) NULL,
	[quantity] [int] NULL,
	[amount] [money] NULL,
	[occurred_at] [datetime2](7) NOT NULL,
	[created_by] [nvarchar](100) NULL,
 CONSTRAINT [PK_supplier_activity_log] PRIMARY KEY CLUSTERED 
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[supplier_contract]
/****** Object:  Table [dbo].[supplier_contract]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[supplier_contract](
	[contract_id] [uniqueidentifier] NOT NULL,
	[supplier_identifier] [varchar](20) NOT NULL,
	[contract_title] [nvarchar](200) NOT NULL,
	[contract_status] [nvarchar](20) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NULL,
	[renewal_terms] [nvarchar](400) NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
	[created_by] [nvarchar](100) NULL,
 CONSTRAINT [PK_supplier_contract] PRIMARY KEY CLUSTERED 
(
	[contract_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[surfer]
/****** Object:  Table [dbo].[surfer]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[surfer_emergency_contact]
/****** Object:  Table [dbo].[surfer_emergency_contact]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[surfer_emergency_contact](
	[contact_id] [uniqueidentifier] NOT NULL,
	[surfer_id] [varchar](9) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[relationship] [nvarchar](100) NULL,
	[phone] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[priority] [tinyint] NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_surfer_emergency_contact] PRIMARY KEY CLUSTERED 
(
	[contact_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[surfer_group]
/****** Object:  Table [dbo].[surfer_group]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[surfer_group](
	[id] [uniqueidentifier] NOT NULL,
	[surfer_id] [varchar](9) NOT NULL,
	[group_id] [uniqueidentifier] NOT NULL,
	[joined_at] [date] NULL,
	[left_at] [date] NULL,
	[role] [nvarchar](100) NULL,
	[notes] [nvarchar](max) NULL,
 CONSTRAINT [PK_surfer_group] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[volunteer]
/****** Object:  Table [dbo].[volunteer]    Script Date: 28/12/2025 17:49:38 ******/
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
	[classification] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_volunteer] PRIMARY KEY CLUSTERED 
(
	[national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[volunteer_role]
/****** Object:  Table [dbo].[volunteer_role]    Script Date: 28/12/2025 17:49:38 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[volunteer_role](
	[volunteer_national_id] [varchar](9) NOT NULL,
	[role_id] [int] NOT NULL,
	[assigned_at] [datetime2](7) NOT NULL,
	[valid_until] [date] NULL,
	[certificate_url] [nvarchar](500) NULL,
	[notes] [nvarchar](max) NULL,
	[certificate_data] [varbinary](max) NULL,
	[certificate_mime] [nvarchar](100) NULL,
	[certificate_name] [nvarchar](255) NULL,
	[training_date] [date] NULL,
 CONSTRAINT [PK_volunteer_role] PRIMARY KEY CLUSTERED 
(
	[volunteer_national_id] ASC,
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[warehouse]
/****** Object:  Table [dbo].[warehouse]    Script Date: 28/12/2025 17:49:38 ******/
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

# [dbo].[warehouse_document]
/****** Object:  Table [dbo].[warehouse_document]    Script Date: 28/12/2025 17:49:38 ******/
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

# [IX_activity_group]
/****** Object:  Index [IX_activity_group]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_activity_group] ON [dbo].[activity]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_activity_equipment_activity]
/****** Object:  Index [IX_activity_equipment_activity]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_activity_equipment_activity] ON [dbo].[activity_equipment]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_activity_volunteer_role]
/****** Object:  Index [IX_activity_volunteer_role]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_activity_volunteer_role] ON [dbo].[activity_volunteer]
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_activity_volunteer_volunteer]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_activity_volunteer_volunteer]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_activity_volunteer_volunteer] ON [dbo].[activity_volunteer]
(
	[volunteer_national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_equipment_item_manufacturer_sku]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_equipment_item_manufacturer_sku]    Script Date: 28/12/2025 17:49:38 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_equipment_item_manufacturer_sku] ON [dbo].[equipment_item]
(
	[manufacturer_sku] ASC
)
WHERE ([manufacturer_sku] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_transaction_activity_id]
/****** Object:  Index [IX_finance_transaction_activity_id]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_activity_id] ON [dbo].[finance_transaction]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_transaction_type_date]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_transaction_type_date]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_type_date] ON [dbo].[finance_transaction]
(
	[type] ASC,
	[transaction_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_transaction_donor_donor]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_transaction_donor_donor]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_donor_donor] ON [dbo].[finance_transaction_donor]
(
	[donor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_transaction_donor_transaction]
/****** Object:  Index [IX_finance_transaction_donor_transaction]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_transaction_donor_transaction] ON [dbo].[finance_transaction_donor]
(
	[finance_transaction_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_txn_activity]
/****** Object:  Index [IX_finance_txn_activity]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_activity] ON [dbo].[finance_txn]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_txn_date]
/****** Object:  Index [IX_finance_txn_date]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_date] ON [dbo].[finance_txn]
(
	[txn_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_txn_donor]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_txn_donor]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_donor] ON [dbo].[finance_txn]
(
	[donor_national_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_finance_txn_supplier]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_finance_txn_supplier]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_finance_txn_supplier] ON [dbo].[finance_txn]
(
	[supplier_identifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_group_season]
/****** Object:  Index [IX_group_season]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_group_season] ON [dbo].[group]
(
	[season_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_group_status]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_group_status]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_group_status] ON [dbo].[group]
(
	[status] ASC
)
WHERE ([is_active]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_inventory_document_action_date]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_inventory_document_action_date]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_action_date] ON [dbo].[inventory_document]
(
	[action_type] ASC,
	[document_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_inventory_document_line_document]
/****** Object:  Index [IX_inventory_document_line_document]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_line_document] ON [dbo].[inventory_document_line]
(
	[document_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_inventory_document_line_item]
/****** Object:  Index [IX_inventory_document_line_item]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_inventory_document_line_item] ON [dbo].[inventory_document_line]
(
	[item_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_note_entity]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_note_entity]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_note_entity] ON [dbo].[note]
(
	[entity_type] ASC,
	[entity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_note_status_history_note]
/****** Object:  Index [IX_note_status_history_note]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_note_status_history_note] ON [dbo].[note_status_history]
(
	[note_id] ASC,
	[changed_at] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_registration_activity]
/****** Object:  Index [IX_registration_activity]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_registration_activity] ON [dbo].[registration]
(
	[activity_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_registration_surfer]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_registration_surfer]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_registration_surfer] ON [dbo].[registration]
(
	[surfer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_season_activity_series_season]
/****** Object:  Index [IX_season_activity_series_season]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_season_activity_series_season] ON [dbo].[season_activity_series]
(
	[season_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [UX_season_activity_series_default_per_season]
/****** Object:  Index [UX_season_activity_series_default_per_season]    Script Date: 28/12/2025 17:49:38 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_season_activity_series_default_per_season] ON [dbo].[season_activity_series]
(
	[season_id] ASC
)
WHERE ([is_default]=(1))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [UX_season_activity_series_season_name]
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_season_activity_series_season_name]    Script Date: 28/12/2025 17:49:38 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_season_activity_series_season_name] ON [dbo].[season_activity_series]
(
	[season_id] ASC,
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_supplier_activity_log_supplier]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_supplier_activity_log_supplier]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_supplier_activity_log_supplier] ON [dbo].[supplier_activity_log]
(
	[supplier_identifier] ASC,
	[occurred_at] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_surfer_group]
/****** Object:  Index [IX_surfer_group]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_surfer_group] ON [dbo].[surfer]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_surfer_emergency_contact_surfer]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_surfer_emergency_contact_surfer]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_surfer_emergency_contact_surfer] ON [dbo].[surfer_emergency_contact]
(
	[surfer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_surfer_group_group]
/****** Object:  Index [IX_surfer_group_group]    Script Date: 28/12/2025 17:49:38 ******/
CREATE NONCLUSTERED INDEX [IX_surfer_group_group] ON [dbo].[surfer_group]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [UQ_surfer_group_surfer_group]
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_surfer_group_surfer_group]    Script Date: 28/12/2025 17:49:38 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UQ_surfer_group_surfer_group] ON [dbo].[surfer_group]
(
	[surfer_id] ASC,
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [DF__activity__status__5441852A]
ALTER TABLE [dbo].[activity] ADD  DEFAULT ('Planned') FOR [status]
GO

# [DF__activity__create__5535A963]
ALTER TABLE [dbo].[activity] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__activity_che__id__38EE7070]
ALTER TABLE [dbo].[activity_checklist] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__activity___is_co__39E294A9]
ALTER TABLE [dbo].[activity_checklist] ADD  DEFAULT ((0)) FOR [is_completed]
GO

# [DF__activity___quant__66603565]
ALTER TABLE [dbo].[activity_equipment] ADD  DEFAULT ((1)) FOR [quantity]
GO

# [DF__activity_equ__id__2C88998B]
ALTER TABLE [dbo].[activity_equipment_request] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__activity___quant__2D7CBDC4]
ALTER TABLE [dbo].[activity_equipment_request] ADD  DEFAULT ((1)) FOR [quantity]
GO

# [DF__activity___statu__2E70E1FD]
ALTER TABLE [dbo].[activity_equipment_request] ADD  DEFAULT ('REQUESTED') FOR [status]
GO

# [DF__activity_sur__id__3335971A]
ALTER TABLE [dbo].[activity_surfer_assignment] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__activity___is_le__5FB337D6]
ALTER TABLE [dbo].[activity_volunteer] ADD  DEFAULT ((0)) FOR [is_lead]
GO

# [DF__activity___assig__60A75C0F]
ALTER TABLE [dbo].[activity_volunteer] ADD  DEFAULT (sysdatetime()) FOR [assigned_at]
GO

# [DF_app_page_is_active]
ALTER TABLE [dbo].[app_page] ADD  CONSTRAINT [DF_app_page_is_active]  DEFAULT ((1)) FOR [is_active]
GO

# [DF__app_page__create__43D61337]
ALTER TABLE [dbo].[app_page] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF_app_role_group_is_default]
ALTER TABLE [dbo].[app_role_group] ADD  CONSTRAINT [DF_app_role_group_is_default]  DEFAULT ((0)) FOR [is_default]
GO

# [DF__app_role___creat__40058253]
ALTER TABLE [dbo].[app_role_group] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__app_role___updat__47A6A41B]
ALTER TABLE [dbo].[app_role_group_permission] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF__app_user__must_r__778AC167]
ALTER TABLE [dbo].[app_user] ADD  DEFAULT ((1)) FOR [must_reset]
GO

# [DF__app_user__role__787EE5A0]
ALTER TABLE [dbo].[app_user] ADD  DEFAULT ('User') FOR [role]
GO

# [DF__app_user__create__797309D9]
ALTER TABLE [dbo].[app_user] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__app_user__is_act__29AC2CE0]
ALTER TABLE [dbo].[app_user] ADD  DEFAULT ((1)) FOR [is_active]
GO

# [DF__donor__is_active__3F466844]
ALTER TABLE [dbo].[donor] ADD  DEFAULT ((1)) FOR [is_active]
GO

# [DF__donor__created_a__403A8C7D]
ALTER TABLE [dbo].[donor] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__equipment__activ__5165187F]
ALTER TABLE [dbo].[equipment] ADD  DEFAULT ((1)) FOR [active]
GO

# [DF_equipment_category_enforce_sku]
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_enforce_sku]  DEFAULT ((0)) FOR [enforce_sku]
GO

# [DF_equipment_category_req_img]
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_req_img]  DEFAULT ((0)) FOR [require_image]
GO

# [DF_equipment_category_is_active]
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_is_active]  DEFAULT ((1)) FOR [is_active]
GO

# [DF_equipment_category_created]
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF_equipment_category_updated]
ALTER TABLE [dbo].[equipment_category] ADD  CONSTRAINT [DF_equipment_category_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF_equipment_family_allow_img]
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_allow_img]  DEFAULT ((0)) FOR [allow_item_images]
GO

# [DF_equipment_family_allow_cons]
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_allow_cons]  DEFAULT ((1)) FOR [allow_consumables]
GO

# [DF_equipment_family_is_active]
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_is_active]  DEFAULT ((1)) FOR [is_active]
GO

# [DF_equipment_family_created]
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF_equipment_family_updated]
ALTER TABLE [dbo].[equipment_family] ADD  CONSTRAINT [DF_equipment_family_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF__equipment_it__id__690797E6]
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF_equipment_item_consumable]
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_consumable]  DEFAULT ((0)) FOR [is_consumable]
GO

# [DF_equipment_item_sku_tracked]
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_sku_tracked]  DEFAULT ((1)) FOR [is_sku_tracked]
GO

# [DF_equipment_item_rental]
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_rental]  DEFAULT ((0)) FOR [is_rental]
GO

# [DF_equipment_item_is_active]
ALTER TABLE [dbo].[equipment_item] ADD  CONSTRAINT [DF_equipment_item_is_active]  DEFAULT ((1)) FOR [is_active]
GO

# [DF__equipment__creat__70A8B9AE]
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__equipment__updat__719CDDE7]
ALTER TABLE [dbo].[equipment_item] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF__equipment_it__id__7D0E9093]
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__equipment__is_pr__7E02B4CC]
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT ((0)) FOR [is_primary]
GO

# [DF__equipment__uploa__7EF6D905]
ALTER TABLE [dbo].[equipment_item_media] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO

# [DF__equipment__quant__02C769E9]
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT ((0)) FOR [quantity]
GO

# [DF__equipment__reser__03BB8E22]
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT ((0)) FOR [reserved_qty]
GO

# [DF__equipment__updat__04AFB25B]
ALTER TABLE [dbo].[equipment_stock] ADD  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF__equipment_st__id__09746778]
ALTER TABLE [dbo].[equipment_stock_ledger] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__equipment__movem__0B5CAFEA]
ALTER TABLE [dbo].[equipment_stock_ledger] ADD  DEFAULT (sysutcdatetime()) FOR [movement_date]
GO

# [DF__finance_t__creat__2A164134]
ALTER TABLE [dbo].[finance_transaction] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF_finance_transaction_has_invoice]
ALTER TABLE [dbo].[finance_transaction] ADD  CONSTRAINT [DF_finance_transaction_has_invoice]  DEFAULT ((0)) FOR [has_invoice]
GO

# [DF__finance_t__creat__3493CFA7]
ALTER TABLE [dbo].[finance_transaction_donor] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__finance_t__creat__6FE99F9F]
ALTER TABLE [dbo].[finance_txn] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__group__id__10566F31]
ALTER TABLE [dbo].[group] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__group__min_parti__123EB7A3]
ALTER TABLE [dbo].[group] ADD  DEFAULT ((5)) FOR [min_participants]
GO

# [DF__group__max_parti__1332DBDC]
ALTER TABLE [dbo].[group] ADD  DEFAULT ((15)) FOR [max_participants]
GO

# [DF__group__current_p__14270015]
ALTER TABLE [dbo].[group] ADD  DEFAULT ((0)) FOR [current_participants]
GO

# [DF__group__status__151B244E]
ALTER TABLE [dbo].[group] ADD  DEFAULT ('פעיל') FOR [status]
GO

# [DF__group__is_active__160F4887]
ALTER TABLE [dbo].[group] ADD  DEFAULT ((1)) FOR [is_active]
GO

# [DF__group__created_a__17036CC0]
ALTER TABLE [dbo].[group] ADD  DEFAULT (getdate()) FOR [created_at]
GO

# [DF__group__updated_a__17F790F9]
ALTER TABLE [dbo].[group] ADD  DEFAULT (getdate()) FOR [updated_at]
GO

# [DF__inventory_do__id__50FB042B]
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (newsequentialid()) FOR [id]
GO

# [DF__inventory__docum__51EF2864]
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (sysutcdatetime()) FOR [document_date]
GO

# [DF__inventory__creat__52E34C9D]
ALTER TABLE [dbo].[inventory_document] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__inventory_do__id__5A846E65]
ALTER TABLE [dbo].[inventory_document_line] ADD  DEFAULT (newsequentialid()) FOR [id]
GO

# [DF__inventory_im__id__10216507]
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__inventory__uploa__1209AD79]
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO

# [DF__inventory__warni__13F1F5EB]
ALTER TABLE [dbo].[inventory_import_batch] ADD  DEFAULT ((0)) FOR [warning_count]
GO

# [DF_note_id]
ALTER TABLE [dbo].[note] ADD  CONSTRAINT [DF_note_id]  DEFAULT (newid()) FOR [note_id]
GO

# [DF__note__created_at__6ABAD62E]
ALTER TABLE [dbo].[note] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__note_status___id__2116E6DF]
ALTER TABLE [dbo].[note_status_history] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__note_stat__chang__220B0B18]
ALTER TABLE [dbo].[note_status_history] ADD  DEFAULT (sysutcdatetime()) FOR [changed_at]
GO

# [DF__registrat__statu__59FA5E80]
ALTER TABLE [dbo].[registration] ADD  DEFAULT ('Pending') FOR [status]
GO

# [DF__registrat__creat__5AEE82B9]
ALTER TABLE [dbo].[registration] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__role__requires_c__25DB9BFC]
ALTER TABLE [dbo].[role] ADD  DEFAULT ((0)) FOR [requires_certification]
GO

# [DF__role__requires_r__26CFC035]
ALTER TABLE [dbo].[role] ADD  DEFAULT ((0)) FOR [requires_renewal]
GO

# [DF__role__color_hex__27C3E46E]
ALTER TABLE [dbo].[role] ADD  DEFAULT ('#3b82f6') FOR [color_hex]
GO

# [DF__role__requires_t__28B808A7]
ALTER TABLE [dbo].[role] ADD  DEFAULT ((0)) FOR [requires_training]
GO

# [DF_season_activity_series_is_default]
ALTER TABLE [dbo].[season_activity_series] ADD  CONSTRAINT [DF_season_activity_series_is_default]  DEFAULT ((0)) FOR [is_default]
GO

# [DF_season_activity_series_created_at]
ALTER TABLE [dbo].[season_activity_series] ADD  CONSTRAINT [DF_season_activity_series_created_at]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__supplier__is_act__440B1D61]
ALTER TABLE [dbo].[supplier] ADD  DEFAULT ((1)) FOR [is_active]
GO

# [DF__supplier__create__44FF419A]
ALTER TABLE [dbo].[supplier] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__supplier__suppli__5F492382]
ALTER TABLE [dbo].[supplier] ADD  DEFAULT ('goods') FOR [supplier_type]
GO

# [DF__supplier__has_ac__603D47BB]
ALTER TABLE [dbo].[supplier] ADD  DEFAULT ((0)) FOR [has_active_contract]
GO

# [DF_supplier_activity_log_id]
ALTER TABLE [dbo].[supplier_activity_log] ADD  CONSTRAINT [DF_supplier_activity_log_id]  DEFAULT (newid()) FOR [activity_id]
GO

# [DF__supplier___occur__7908F585]
ALTER TABLE [dbo].[supplier_activity_log] ADD  DEFAULT (sysutcdatetime()) FOR [occurred_at]
GO

# [DF_supplier_contract_id]
ALTER TABLE [dbo].[supplier_contract] ADD  CONSTRAINT [DF_supplier_contract_id]  DEFAULT (newid()) FOR [contract_id]
GO

# [DF__supplier___contr__73501C2F]
ALTER TABLE [dbo].[supplier_contract] ADD  DEFAULT ('active') FOR [contract_status]
GO

# [DF__supplier___creat__74444068]
ALTER TABLE [dbo].[supplier_contract] ADD  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF__surfer__active__3B75D760]
ALTER TABLE [dbo].[surfer] ADD  DEFAULT ((1)) FOR [active]
GO

# [DF__surfer__created___3C69FB99]
ALTER TABLE [dbo].[surfer] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF_surfer_emergency_contact_created_at]
ALTER TABLE [dbo].[surfer_emergency_contact] ADD  CONSTRAINT [DF_surfer_emergency_contact_created_at]  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__volunteer__activ__37A5467C]
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT ((1)) FOR [active]
GO

# [DF__volunteer__creat__38996AB5]
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO

# [DF__volunteer__total__2739D489]
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT ((0)) FOR [total_activities]
GO

# [DF__volunteer__class__23F3538A]
ALTER TABLE [dbo].[volunteer] ADD  DEFAULT ('volunteer') FOR [classification]
GO

# [DF__volunteer__assig__4AB81AF0]
ALTER TABLE [dbo].[volunteer_role] ADD  DEFAULT (sysdatetime()) FOR [assigned_at]
GO

# [DF__warehouse__id__5D95E53A]
ALTER TABLE [dbo].[warehouse] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF_warehouse_is_active]
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_is_active]  DEFAULT ((1)) FOR [is_active]
GO

# [DF_warehouse_created]
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_created]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

# [DF_warehouse_updated]
ALTER TABLE [dbo].[warehouse] ADD  CONSTRAINT [DF_warehouse_updated]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO

# [DF__warehouse_do__id__634EBE90]
ALTER TABLE [dbo].[warehouse_document] ADD  DEFAULT (newid()) FOR [id]
GO

# [DF__warehouse__uploa__6442E2C9]
ALTER TABLE [dbo].[warehouse_document] ADD  DEFAULT (sysutcdatetime()) FOR [uploaded_at]
GO

# [FK__activity__group___19DFD96B]
ALTER TABLE [dbo].[activity]  WITH CHECK ADD FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO

# [FK_activity_group]
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_group]
GO

# [FK_activity_season]
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_season] FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_season]
GO

# [FK_activity_series]
ALTER TABLE [dbo].[activity]  WITH CHECK ADD  CONSTRAINT [FK_activity_series] FOREIGN KEY([series_id])
REFERENCES [dbo].[season_activity_series] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[activity] CHECK CONSTRAINT [FK_activity_series]
GO

# [FK__activity___activ__3AD6B8E2]
ALTER TABLE [dbo].[activity_checklist]  WITH CHECK ADD FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
ON DELETE CASCADE
GO

# [FK_activity_checklist_volunteer]
ALTER TABLE [dbo].[activity_checklist]  WITH CHECK ADD  CONSTRAINT [FK_activity_checklist_volunteer] FOREIGN KEY([assigned_to_volunteer_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO
ALTER TABLE [dbo].[activity_checklist] CHECK CONSTRAINT [FK_activity_checklist_volunteer]
GO

# [FK_activity_equipment_activity]
ALTER TABLE [dbo].[activity_equipment]  WITH CHECK ADD  CONSTRAINT [FK_activity_equipment_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[activity_equipment] CHECK CONSTRAINT [FK_activity_equipment_activity]
GO

# [FK_activity_equipment_equipment]
ALTER TABLE [dbo].[activity_equipment]  WITH CHECK ADD  CONSTRAINT [FK_activity_equipment_equipment] FOREIGN KEY([equipment_id])
REFERENCES [dbo].[equipment] ([id])
GO
ALTER TABLE [dbo].[activity_equipment] CHECK CONSTRAINT [FK_activity_equipment_equipment]
GO

# [FK__activity___activ__2F650636]
ALTER TABLE [dbo].[activity_equipment_request]  WITH CHECK ADD FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
ON DELETE CASCADE
GO

# [FK__activity___item___30592A6F]
ALTER TABLE [dbo].[activity_equipment_request]  WITH CHECK ADD FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO

# [FK__activity___activ__3429BB53]
ALTER TABLE [dbo].[activity_surfer_assignment]  WITH CHECK ADD FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
ON DELETE CASCADE
GO

# [FK__activity___surfe__351DDF8C]
ALTER TABLE [dbo].[activity_surfer_assignment]  WITH CHECK ADD FOREIGN KEY([surfer_id])
REFERENCES [dbo].[surfer] ([national_id])
GO

# [FK__activity___volun__361203C5]
ALTER TABLE [dbo].[activity_surfer_assignment]  WITH CHECK ADD FOREIGN KEY([volunteer_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO

# [FK_activity_volunteer_activity]
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_activity]
GO

# [FK_activity_volunteer_role]
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_role] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_role]
GO

# [FK_activity_volunteer_volunteer]
ALTER TABLE [dbo].[activity_volunteer]  WITH CHECK ADD  CONSTRAINT [FK_activity_volunteer_volunteer] FOREIGN KEY([volunteer_national_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO
ALTER TABLE [dbo].[activity_volunteer] CHECK CONSTRAINT [FK_activity_volunteer_volunteer]
GO

# [FK_app_role_group_permission_group]
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD  CONSTRAINT [FK_app_role_group_permission_group] FOREIGN KEY([role_group_code])
REFERENCES [dbo].[app_role_group] ([code])
GO
ALTER TABLE [dbo].[app_role_group_permission] CHECK CONSTRAINT [FK_app_role_group_permission_group]
GO

# [FK_app_role_group_permission_page]
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD  CONSTRAINT [FK_app_role_group_permission_page] FOREIGN KEY([page_key])
REFERENCES [dbo].[app_page] ([page_key])
GO
ALTER TABLE [dbo].[app_role_group_permission] CHECK CONSTRAINT [FK_app_role_group_permission_page]
GO

# [FK_app_user_role_group]
ALTER TABLE [dbo].[app_user]  WITH CHECK ADD  CONSTRAINT [FK_app_user_role_group] FOREIGN KEY([role_group_code])
REFERENCES [dbo].[app_role_group] ([code])
GO
ALTER TABLE [dbo].[app_user] CHECK CONSTRAINT [FK_app_user_role_group]
GO

# [FK_equipment_category_family]
ALTER TABLE [dbo].[equipment_category]  WITH CHECK ADD  CONSTRAINT [FK_equipment_category_family] FOREIGN KEY([family_code])
REFERENCES [dbo].[equipment_family] ([code])
GO
ALTER TABLE [dbo].[equipment_category] CHECK CONSTRAINT [FK_equipment_category_family]
GO

# [FK_equipment_item_category]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_category] FOREIGN KEY([family_code], [category_code])
REFERENCES [dbo].[equipment_category] ([family_code], [code])
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [FK_equipment_item_category]
GO

# [FK_equipment_item_family]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_family] FOREIGN KEY([family_code])
REFERENCES [dbo].[equipment_family] ([code])
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [FK_equipment_item_family]
GO

# [FK_equipment_item_media]
ALTER TABLE [dbo].[equipment_item_media]  WITH CHECK ADD  CONSTRAINT [FK_equipment_item_media] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[equipment_item_media] CHECK CONSTRAINT [FK_equipment_item_media]
GO

# [FK_equipment_stock_item]
ALTER TABLE [dbo].[equipment_stock]  WITH CHECK ADD  CONSTRAINT [FK_equipment_stock_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[equipment_stock] CHECK CONSTRAINT [FK_equipment_stock_item]
GO

# [FK_equipment_stock_warehouse]
ALTER TABLE [dbo].[equipment_stock]  WITH CHECK ADD  CONSTRAINT [FK_equipment_stock_warehouse] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[equipment_stock] CHECK CONSTRAINT [FK_equipment_stock_warehouse]
GO

# [FK_esl_item]
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD  CONSTRAINT [FK_esl_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[equipment_stock_ledger] CHECK CONSTRAINT [FK_esl_item]
GO

# [FK_esl_warehouse]
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD  CONSTRAINT [FK_esl_warehouse] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[equipment_stock_ledger] CHECK CONSTRAINT [FK_esl_warehouse]
GO

# [FK_eq_event_equipment]
ALTER TABLE [dbo].[equipment_supplier_event]  WITH CHECK ADD  CONSTRAINT [FK_eq_event_equipment] FOREIGN KEY([equipment_id])
REFERENCES [dbo].[equipment] ([id])
GO
ALTER TABLE [dbo].[equipment_supplier_event] CHECK CONSTRAINT [FK_eq_event_equipment]
GO

# [FK_eq_event_supplier]
ALTER TABLE [dbo].[equipment_supplier_event]  WITH CHECK ADD  CONSTRAINT [FK_eq_event_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[equipment_supplier_event] CHECK CONSTRAINT [FK_eq_event_supplier]
GO

# [FK_finance_transaction_activity]
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_activity]
GO

# [FK_finance_transaction_donor]
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor] FOREIGN KEY([donor_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_donor]
GO

# [FK_finance_transaction_supplier]
ALTER TABLE [dbo].[finance_transaction]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_supplier] FOREIGN KEY([supplier_id])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[finance_transaction] CHECK CONSTRAINT [FK_finance_transaction_supplier]
GO

# [FK_finance_transaction_donor_shares_donor]
ALTER TABLE [dbo].[finance_transaction_donor]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor_shares_donor] FOREIGN KEY([donor_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_transaction_donor] CHECK CONSTRAINT [FK_finance_transaction_donor_shares_donor]
GO

# [FK_finance_transaction_donor_shares_transaction]
ALTER TABLE [dbo].[finance_transaction_donor]  WITH CHECK ADD  CONSTRAINT [FK_finance_transaction_donor_shares_transaction] FOREIGN KEY([finance_transaction_id])
REFERENCES [dbo].[finance_transaction] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[finance_transaction_donor] CHECK CONSTRAINT [FK_finance_transaction_donor_shares_transaction]
GO

# [FK_finance_activity]
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_activity]
GO

# [FK_finance_donor]
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_donor] FOREIGN KEY([donor_national_id])
REFERENCES [dbo].[donor] ([national_id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_donor]
GO

# [FK_finance_registration]
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_registration] FOREIGN KEY([registration_id])
REFERENCES [dbo].[registration] ([id])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_registration]
GO

# [FK_finance_supplier]
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD  CONSTRAINT [FK_finance_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[finance_txn] CHECK CONSTRAINT [FK_finance_supplier]
GO

# [FK__group__season_id__114A936A]
ALTER TABLE [dbo].[group]  WITH CHECK ADD FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
GO

# [FK_inventory_document_activity]
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_activity]
GO

# [FK_inventory_document_created_by]
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_created_by] FOREIGN KEY([created_by])
REFERENCES [dbo].[app_user] ([national_id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_created_by]
GO

# [FK_inventory_document_source_wh]
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_source_wh] FOREIGN KEY([source_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_source_wh]
GO

# [FK_inventory_document_supplier]
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_supplier]
GO

# [FK_inventory_document_target_wh]
ALTER TABLE [dbo].[inventory_document]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_target_wh] FOREIGN KEY([target_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document] CHECK CONSTRAINT [FK_inventory_document_target_wh]
GO

# [FK_inventory_document_line_document]
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_document] FOREIGN KEY([document_id])
REFERENCES [dbo].[inventory_document] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_document]
GO

# [FK_inventory_document_line_item]
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_item] FOREIGN KEY([item_id])
REFERENCES [dbo].[equipment_item] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_item]
GO

# [FK_inventory_document_line_source_wh]
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_source_wh] FOREIGN KEY([source_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_source_wh]
GO

# [FK_inventory_document_line_target_wh]
ALTER TABLE [dbo].[inventory_document_line]  WITH CHECK ADD  CONSTRAINT [FK_inventory_document_line_target_wh] FOREIGN KEY([target_warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
GO
ALTER TABLE [dbo].[inventory_document_line] CHECK CONSTRAINT [FK_inventory_document_line_target_wh]
GO

# [FK_note_status_history_note]
ALTER TABLE [dbo].[note_status_history]  WITH CHECK ADD  CONSTRAINT [FK_note_status_history_note] FOREIGN KEY([note_id])
REFERENCES [dbo].[note] ([note_id])
GO
ALTER TABLE [dbo].[note_status_history] CHECK CONSTRAINT [FK_note_status_history_note]
GO

# [FK_registration_activity]
ALTER TABLE [dbo].[registration]  WITH CHECK ADD  CONSTRAINT [FK_registration_activity] FOREIGN KEY([activity_id])
REFERENCES [dbo].[activity] ([id])
GO
ALTER TABLE [dbo].[registration] CHECK CONSTRAINT [FK_registration_activity]
GO

# [FK_registration_surfer]
ALTER TABLE [dbo].[registration]  WITH CHECK ADD  CONSTRAINT [FK_registration_surfer] FOREIGN KEY([surfer_id])
REFERENCES [dbo].[surfer] ([national_id])
GO
ALTER TABLE [dbo].[registration] CHECK CONSTRAINT [FK_registration_surfer]
GO

# [FK_season_activity_series_group]
ALTER TABLE [dbo].[season_activity_series]  WITH CHECK ADD  CONSTRAINT [FK_season_activity_series_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[season_activity_series] CHECK CONSTRAINT [FK_season_activity_series_group]
GO

# [FK_season_activity_series_season]
ALTER TABLE [dbo].[season_activity_series]  WITH CHECK ADD  CONSTRAINT [FK_season_activity_series_season] FOREIGN KEY([season_id])
REFERENCES [dbo].[season_plan] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[season_activity_series] CHECK CONSTRAINT [FK_season_activity_series_season]
GO

# [FK_supplier_activity_log_supplier]
ALTER TABLE [dbo].[supplier_activity_log]  WITH CHECK ADD  CONSTRAINT [FK_supplier_activity_log_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[supplier_activity_log] CHECK CONSTRAINT [FK_supplier_activity_log_supplier]
GO

# [FK_supplier_contract_supplier]
ALTER TABLE [dbo].[supplier_contract]  WITH CHECK ADD  CONSTRAINT [FK_supplier_contract_supplier] FOREIGN KEY([supplier_identifier])
REFERENCES [dbo].[supplier] ([supplier_identifier])
GO
ALTER TABLE [dbo].[supplier_contract] CHECK CONSTRAINT [FK_supplier_contract_supplier]
GO

# [FK__surfer__group_id__18EBB532]
ALTER TABLE [dbo].[surfer]  WITH CHECK ADD FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO

# [FK_surfer_group]
ALTER TABLE [dbo].[surfer]  WITH CHECK ADD  CONSTRAINT [FK_surfer_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
GO
ALTER TABLE [dbo].[surfer] CHECK CONSTRAINT [FK_surfer_group]
GO

# [FK_surfer_emergency_contact_surfer]
ALTER TABLE [dbo].[surfer_emergency_contact]  WITH CHECK ADD  CONSTRAINT [FK_surfer_emergency_contact_surfer] FOREIGN KEY([surfer_id])
REFERENCES [dbo].[surfer] ([national_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[surfer_emergency_contact] CHECK CONSTRAINT [FK_surfer_emergency_contact_surfer]
GO

# [FK_surfer_group_group]
ALTER TABLE [dbo].[surfer_group]  WITH CHECK ADD  CONSTRAINT [FK_surfer_group_group] FOREIGN KEY([group_id])
REFERENCES [dbo].[group] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[surfer_group] CHECK CONSTRAINT [FK_surfer_group_group]
GO

# [FK_surfer_group_surfer]
ALTER TABLE [dbo].[surfer_group]  WITH CHECK ADD  CONSTRAINT [FK_surfer_group_surfer] FOREIGN KEY([surfer_id])
REFERENCES [dbo].[surfer] ([national_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[surfer_group] CHECK CONSTRAINT [FK_surfer_group_surfer]
GO

# [FK_volunteer_role_role]
ALTER TABLE [dbo].[volunteer_role]  WITH CHECK ADD  CONSTRAINT [FK_volunteer_role_role] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[volunteer_role] CHECK CONSTRAINT [FK_volunteer_role_role]
GO

# [FK_volunteer_role_volunteer]
ALTER TABLE [dbo].[volunteer_role]  WITH CHECK ADD  CONSTRAINT [FK_volunteer_role_volunteer] FOREIGN KEY([volunteer_national_id])
REFERENCES [dbo].[volunteer] ([national_id])
GO
ALTER TABLE [dbo].[volunteer_role] CHECK CONSTRAINT [FK_volunteer_role_volunteer]
GO

# [FK_warehouse_document]
ALTER TABLE [dbo].[warehouse_document]  WITH CHECK ADD  CONSTRAINT [FK_warehouse_document] FOREIGN KEY([warehouse_id])
REFERENCES [dbo].[warehouse] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[warehouse_document] CHECK CONSTRAINT [FK_warehouse_document]
GO

# [CK__app_role___permi__46B27FE2]
ALTER TABLE [dbo].[app_role_group_permission]  WITH CHECK ADD CHECK  (([permission_level]='write' OR [permission_level]='read' OR [permission_level]='none'))
GO

# [CK__equipment__equip__4D5F7D71]
ALTER TABLE [dbo].[equipment_family]  WITH CHECK ADD CHECK  (([equipment_type]='support' OR [equipment_type]='sea'))
GO

# [CK__equipment__condi__6BE40491]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([condition]='damaged' OR [condition]='used' OR [condition]='new'))
GO

# [CK__equipment__equip__6AEFE058]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([equipment_type]='support' OR [equipment_type]='sea'))
GO

# [CK__equipment__seria__69FBBC1F]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD CHECK  (([serial_number]>=(0) AND [serial_number]<=(999)))
GO

# [CK_equipment_item_minmax]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [CK_equipment_item_minmax] CHECK  (([is_sku_tracked]=(1) AND [min_stock] IS NULL AND [max_stock] IS NULL OR [is_sku_tracked]=(0)))
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [CK_equipment_item_minmax]
GO

# [CK_equipment_item_rental]
ALTER TABLE [dbo].[equipment_item]  WITH CHECK ADD  CONSTRAINT [CK_equipment_item_rental] CHECK  (([is_rental]=(0) AND [rental_expiry] IS NULL OR [is_rental]=(1)))
GO
ALTER TABLE [dbo].[equipment_item] CHECK CONSTRAINT [CK_equipment_item_rental]
GO

# [CK__equipment__movem__0A688BB1]
ALTER TABLE [dbo].[equipment_stock_ledger]  WITH CHECK ADD CHECK  (([movement_type]='delete' OR [movement_type]='adjustment' OR [movement_type]='receipt'))
GO

# [CK__finance_t__direc__6EF57B66]
ALTER TABLE [dbo].[finance_txn]  WITH CHECK ADD CHECK  (([direction]='OUT' OR [direction]='IN'))
GO

# [CK__inventory__sourc__11158940]
ALTER TABLE [dbo].[inventory_import_batch]  WITH CHECK ADD CHECK  (([source_type]='excel' OR [source_type]='manual'))
GO

# [CK__inventory__statu__12FDD1B2]
ALTER TABLE [dbo].[inventory_import_batch]  WITH CHECK ADD CHECK  (([status]='failed' OR [status]='processed' OR [status]='pending'))
GO

# [CK_season_activity_series_frequency]
ALTER TABLE [dbo].[season_activity_series]  WITH CHECK ADD  CONSTRAINT [CK_season_activity_series_frequency] CHECK  (([frequency]='Monthly' OR [frequency]='Daily' OR [frequency]='Weekly'))
GO
ALTER TABLE [dbo].[season_activity_series] CHECK CONSTRAINT [CK_season_activity_series_frequency]
GO

# [CK_season_activity_series_schedule_type]
ALTER TABLE [dbo].[season_activity_series]  WITH CHECK ADD  CONSTRAINT [CK_season_activity_series_schedule_type] CHECK  (([schedule_type]='Manual' OR [schedule_type]='Fixed'))
GO
ALTER TABLE [dbo].[season_activity_series] CHECK CONSTRAINT [CK_season_activity_series_schedule_type]
GO

# [CK_supplier_identifier_type]
ALTER TABLE [dbo].[supplier]  WITH NOCHECK ADD  CONSTRAINT [CK_supplier_identifier_type] CHECK  (([identifier_type]='OTHER' OR [identifier_type]='ID' OR [identifier_type]='OSEK' OR [identifier_type]='HP'))
GO
ALTER TABLE [dbo].[supplier] CHECK CONSTRAINT [CK_supplier_identifier_type]
GO

# [CK_volunteer_classification]
ALTER TABLE [dbo].[volunteer]  WITH CHECK ADD  CONSTRAINT [CK_volunteer_classification] CHECK  (([classification]='management' OR [classification]='staff' OR [classification]='volunteer'))
GO
ALTER TABLE [dbo].[volunteer] CHECK CONSTRAINT [CK_volunteer_classification]
GO

# [MS_Description]
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Defines if this role requires a formal certificate upload' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'role', @level2type=N'COLUMN',@level2name=N'requires_certification'
GO

# [MS_Description]
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Saves the type of person: volunteer, staff, or management' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'volunteer', @level2type=N'COLUMN',@level2name=N'classification'
GO

# [PosseableDB]
USE [master]
GO

ALTER DATABASE [PosseableDB] SET  READ_WRITE 
GO
