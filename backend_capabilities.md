# AurumVault Backend System Capabilities

AurumVault is a robust, enterprise-grade backend infrastructure designed for luxury retail and jewelry management. Built on **Node.js (Express 5)** and **MongoDB**, it provides a secure and scalable foundation for managing high-value inventory, processing digital payments, and maintaining customer relationships.

---

## 1. Core Architecture & Infrastructure
- **Modern Stack**: Leverages the latest Express 5 framework for high-performance API handling.
- **Database**: Schemaless, scalable data storage using MongoDB with Mongoose ODM.
- **Media Management**: Integrated with **Cloudinary** for high-quality image and video hosting, ensuring fast delivery of luxury product visuals.
- **Automated Workflows**: Built-in cron job system for background maintenance (e.g., cleaning up expired transactions).
- **Audit Logging**: Dedicated system for tracking activity, errors, and background processes for accountability.

## 2. Secure Authentication & Role Management
- **JWT-Based Security**: Industry-standard JSON Web Token (JWT) authentication for secure stateless sessions.
- **Multi-Factor Verification**: 
  - Email verification via OTP (One-Time Password).
  - Secure password reset flow using time-sensitive OTPs.
- **Granular Access Control**: Three-tier role system:
  - **Buyer (User)**: Standard access for browsing and purchasing.
  - **Staff (Seller)**: Access for managing inventory and sales records.
  - **Administrator**: Full control over system configuration, users, and audit logs.

## 3. Advanced Inventory & Product Management
- **Rich Product Catalog**: Support for various jewelry categories (Rings, Necklaces, Watches, etc.) with metadata for gender and quality (Standard, Premium, Luxury).
- **Dynamic Pricing Engine**: Automated calculation of sale prices based on discount percentages.
- **Media-Rich Listings**: Support for multiple images and videos per product, handled via automated uploads and cleanup.
- **Automatic Cataloging**: Auto-generation of unique product codes for easy tracking.
- **Status Indicators**: "New Arrival" and "On Discount" flags for targeted marketing.

## 4. Payment Processing & Sales Lifecycle
- **M-Pesa Integration**: Seamless STK Push (Lipa na M-Pesa) integration for instant mobile payments in the Kenyan market.
- **Automated Callbacks**: Real-time payment verification via Safaricom's callback system, ensuring sale statuses are updated without manual intervention.
- **Hybrid Sales Support**: Support for both digital (M-Pesa) and manual (Cash) transactions.
- **Business Intelligence**: 
  - Paginated sales reporting with deep filtering (by status, seller, buyer, or date).
  - Real-time revenue aggregation and sales performance metrics.

## 5. Communication & Lead Management
- **Contact Infrastructure**: Integrated contact form handling for customer inquiries.
- **Quotation System**: Formal request-for-quote (RFQ) module for custom jewelry pieces or bulk orders.
- **Admin Dashboard Integration**: Centralized management interface for admins to respond to messages and review quotations.

## 6. Communication Channels
- **Email Delivery**: Multi-provider support using **Resend** and **Brevo** for transactional emails, notifications, and OTP delivery.
- **Reporting**: Advanced data aggregation for business health snapshots including successful revenue vs. pending liabilities.
