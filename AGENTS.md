<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Admin Panel Requirements Documentation

## Overview

Build a modern, scalable, and secure admin panel where **every website section is configurable from the admin panel**. The admin should never need to modify code for content, products, banners, navigation, or settings.

The system should follow a modular architecture so that future features can be added without major code changes.

---

# Technology Stack

## Frontend

* Next.js (App Router)
* JavaScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Axios
* TanStack Query

## Backend

* Node.js
* Express.js
* JavaScript
* REST API
* Mongoose ODM

## Database

* MongoDB Atlas

## Authentication

* Firebase Authentication
* Firebase Admin SDK

## Image Storage

* Cloudinary (Preferred)
* Local storage for development only

---

# Architecture

```text
Next.js Admin Panel
        │
        ▼
 Firebase Authentication
        │
        ▼
 Firebase ID Token
        │
        ▼
 Express.js Backend
        │
        ▼
 Firebase Admin SDK (Verify Token)
        │
        ▼
 MongoDB (Business Data)
        │
        ▼
 Cloudinary (Images)
```

---

# Database Decision

## MongoDB (Primary Database)

MongoDB will store all business data.

Collections include:

* Products
* Categories
* Collections
* Orders
* Customers
* Coupons
* Homepage Sections
* CMS Pages
* Navigation
* Settings
* Admin Users
* Reports
* Notifications

### Why MongoDB?

* Excellent for e-commerce applications
* Flexible schema
* Powerful filtering
* Aggregation support
* Better reporting
* Fast indexing
* Easy pagination
* Highly scalable
* Excellent Mongoose ecosystem

---

# Authentication

## Firebase Authentication

Use Firebase Authentication only for admin login.

Supported Login Methods

* Email & Password
* Google Login (Optional)

Authentication Flow

1. Admin logs in using Firebase Authentication.
2. Firebase returns an ID Token.
3. Frontend sends the token with every API request.
4. Backend verifies the token using Firebase Admin SDK.
5. Backend checks the admin's role in MongoDB.
6. If authorized, the request is processed.

Benefits

* Secure authentication managed by Google
* Built-in password reset
* Email verification
* No password hashing required
* Generous free tier
* Easy user management

---

# Image Storage

Use **Cloudinary** for storing:

* Product Images
* Banner Images
* Collection Images
* Category Images
* CMS Images

Benefits

* Automatic image optimization
* CDN delivery
* Image resizing
* Compression
* Fast loading
* Easy integration

Local storage should only be used during development.

---

# User Roles

Support Role-Based Access Control (RBAC).

Roles

* Super Admin
* Admin
* Product Manager
* Order Manager
* Customer Support

Permissions should be stored in MongoDB.

---

# 1. Dashboard

## Statistics

* Total Orders
* Pending Orders
* Completed Orders
* Cancelled Orders
* Total Revenue
* Today's Revenue
* Total Customers
* Returning Customers
* Total Products
* Low Stock Products
* Out of Stock Products

## Charts

* Monthly Sales
* Monthly Revenue
* Orders by Status
* Top Selling Products
* Category Sales

---

# 2. Homepage Management

Every homepage section should be editable.

## Hero Banner

Support multiple banners.

Fields

* Desktop Banner
* Mobile Banner
* Heading
* Sub Heading
* Button Text
* Button Link
* Background Color
* Text Color
* Display Order
* Enable / Disable

---

## Announcement Bar

Fields

* Message
* Background Color
* Text Color
* Scrolling Text
* Enable / Disable

---

## Categories Section

* Add Category
* Edit Category
* Delete Category
* Upload Image
* Display Order
* Show / Hide

---

## Featured Collections

Admin manually selects products.

Examples

* Summer Collection
* Winter Collection
* New Arrival
* Trending
* Best Seller

---

## Promotional Banner

Fields

* Desktop Image
* Mobile Image
* Heading
* Sub Heading
* Button Text
* Button Link
* Display Order
* Enable / Disable

---

## Instagram Section

Support

* Manual Upload
* Instagram API

---

## Newsletter

Fields

* Heading
* Description
* Success Message

---

# 3. Product Management

## Basic Information

* Product Name
* SKU
* Slug
* Category
* Brand
* Collection
* Gender
* Tags

## Pricing

* MRP
* Selling Price
* Cost Price
* Discount
* Tax
* Currency

## Inventory

* Stock
* Low Stock Limit
* Barcode
* Weight

## Images

Unlimited Upload

Types

* Front
* Back
* Side
* Close-up
* Lifestyle
* Product Video

Features

* Drag & Drop Sorting
* Set Primary Image
* Delete Images

## Variants

Colors

* Black
* White
* Olive
* Brown

Sizes

* XS
* S
* M
* L
* XL
* XXL

Each Variant

* SKU
* Price
* Stock
* Image

## Description

Rich Text Editor

Supports

* Paragraphs
* Headings
* Lists
* Tables
* Images
* Videos

## Size Chart

Dynamic Table

Unlimited Columns

## SEO

* SEO Title
* Meta Description
* Meta Keywords
* Canonical URL
* SEO Slug

## Shipping

* Weight
* Height
* Width
* Length
* Package Type

## Related Products

* Manual
* Automatic

## Product Labels

* New
* Sale
* Trending
* Bestseller
* Limited Edition

---

# 4. Categories

Fields

* Name
* Slug
* Description
* Banner
* Thumbnail
* Parent Category
* Display Order

SEO

* SEO Title
* Meta Description
* Meta Keywords

---

# 5. Collections

Fields

* Collection Name
* Banner
* Description
* Products
* Display Order
* Enable / Disable

---

# 6. Orders

## Order Details

* Order Number
* Customer
* Products
* Payment Information
* Shipping Address
* Coupon Applied
* Internal Notes

## Order Status

* Pending
* Confirmed
* Packed
* Shipped
* Delivered
* Cancelled
* Returned
* Refunded

## Actions

* Update Status

---

# 7. Customers

Fields

* Email
* Address
* Wishlist
* Order History

---

# 8. Coupons

Types

* Percentage Discount
* Flat Discount
* Buy X Get Y
* Free Shipping

Conditions

* Minimum Purchase
* Maximum Discount
* Expiry Date
* Usage Limit
* Per User Limit

---

# 9. Media Library

Supports

* Images
* Videos
* Documents

Features

* Folder Support
* Search
* Filters
* Bulk Upload
* Bulk Delete

---

# 10. Website Settings

* Website Name
* Logo
* Favicon
* Contact Email
* Phone Number
* Address
* WhatsApp Number
* Social Media Links

---

# 11. Navigation Management

Manage

* Header Menu
* Footer Menu
* Mega Menu

Features

* Drag & Drop Sorting
* Nested Menus
* Internal Links
* External Links

---

# 12. Footer Management

Editable

* About Text
* Quick Links
* Customer Support Links
* Social Icons
* Payment Icons
* Copyright

---

# 13. CMS Pages

Manage

* About Us
* Contact Us
* FAQ
* Privacy Policy
* Shipping Policy
* Return Policy
* Terms & Conditions

Rich Text Editor

---

# 14. SEO Settings

* Website Title
* Meta Description
* Meta Keywords
* Robots.txt
* Sitemap.xml
* Google Analytics
* Google Tag Manager
* Facebook Pixel

---

# 15. User Management

Roles

* Super Admin
* Admin
* Product Manager
* Order Manager
* Customer Support

Features

* Create User
* Edit User
* Delete User
* Disable User
* Assign Roles
* Reset Password

---

# 16. Reports

Generate

* Sales
* Revenue
* Orders
* Customers
* Inventory
* Coupons

Export

* Excel
* CSV
* PDF

---

# 17. Notifications

Admin

* New Order
* Low Stock
* Failed Payment
* Cancelled Order

Customer

* Order Confirmation
* Shipping Updates
* Delivery Updates

Channels

* Email
* WhatsApp

---

# 18. Security

* Firebase Authentication
* Firebase Admin SDK Token Verification
* Role-Based Access Control (RBAC)
* Activity Logs
* Session Management

---

# 19. Backup & Restore

* Database Backup
* Media Backup
* Manual Backup
* Scheduled Backup
* Restore Backup

---

# General Requirements

## Search

Support searching for

* Products
* Categories
* Orders
* Customers
* Coupons

## Filters

Support filtering by

* Date
* Category
* Collection
* Brand
* Stock
* Status
* Price

## Bulk Actions

* Delete
* Enable
* Disable
* Export
* Update Status

## Pagination

Support

* Pagination
* Search
* Filters
* Sorting

---

# Future Features

The architecture should support future additions without major refactoring.

* AI Size Recommendation
* AI Product Recommendation
* AI Chatbot
* Wishlist
* Reviews & Ratings
* Loyalty Points
* Gift Cards
* Referral System
* Abandoned Cart Recovery
* Multi-language Support
* Multi-currency Support
* Multi-Warehouse Inventory
* Mobile App APIs
* Push Notifications
* Webhooks
* Third-party Integrations

---

# Development Guidelines

* Build modular REST APIs.
* Use Express.js with Mongoose.
* Use MongoDB Atlas as the primary database.
* Use Firebase Authentication for admin login.
* Verify every API request using Firebase Admin SDK.
* Store images in Cloudinary.
* Validate all API requests.
* Use centralized error handling.
* Use pagination for all listing APIs.
* Implement soft delete where appropriate.
* Separate controllers, services, models, and routes.
* Store all homepage content in MongoDB.
* Design schemas for future scalability.
* Keep code clean, reusable, and maintainable.
* Use environment variables for all secrets.
* Version APIs using `/api/v1`.

