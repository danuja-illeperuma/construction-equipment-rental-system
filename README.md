# 🏗️ Construction Equipment Rental & Management System (CERMS)

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.4%20Enterprise-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, full-stack multi-tier web application engineered for commercial heavy machinery hire, fleet logistics, automated availability scheduling, damage inspection, PayHere payment gateway settlement, and routine maintenance lifecycle management.

---

## 📑 Table of Contents
- [System Overview](#-system-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [5-Member Workload & Database Object Matrix](#-5-member-workload--database-object-matrix)
- [Technology Stack](#-technology-stack)
- [Database Schema & ACID Transactions](#-database-schema--acid-transactions)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Configuration](#1-database-configuration)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Directory Structure](#-project-directory-structure)
- [Authors & Team Allocation](#-authors--team-allocation)

---

## 🌟 System Overview

**CERMS** bridges heavy machinery plant hire companies, field contractors, and depot operations into a unified real-time management hub. Built with a high-performance **Spring Boot 3 (Java 21)** REST API backend using **Spring JDBC (`JdbcTemplate`)** and a responsive **React 18 + Vite** frontend styled with **Tailwind CSS**.

The database architecture is powered by **MySQL 8.4** hosted on cloud infrastructure, strictly enforcing automated database-level integrity through stored procedures, scalar functions, triggers, scheduled events, composite indexes, and atomic ACID transactions.

---

## ✨ Key Features

### 👤 Customer Portal
- **Browse & Filter Fleet**: Search heavy machinery with dynamic category filters, yard locations, and flexible rates (Hourly, Daily, Monthly).
- **Online Booking Engine**: Select rental timeframes, calculate rental amounts, and verify equipment availability in real-time.
- **PayHere Payment Integration**: Secure digital checkout with instant payment receipt generation and booking confirmation.
- **Rental Tracking**: View active rentals, inspection status, return dates, and past rental history.

### 🛠️ Depot Staff & Operations Portal
- **Machinery Dispatch & Handover**: Verify customer bookings, check yard availability, and dispatch equipment.
- **Equipment Return Processing**: Log machinery returns, record operational condition (`GOOD`, `MINOR_DAMAGE`, `MAJOR_DAMAGE`), and automatically calculate late penalty charges.
- **Fleet Maintenance Scheduling**: Schedule preventive maintenance or breakdown repairs, monitor active workshop jobs, and transition machines back to available inventory.
- **Today's Due Maintenance Tracking**: Real-time operational dashboard for machines due for service today vs. work currently in progress.

### 🛡️ Executive & Admin Portal
- **Fleet Inventory Control**: Full CRUD operations for machinery assets, category classification, specifications, and photo uploads via Cloudinary.
- **Role-Based Access Control (RBAC)**: Secure JWT stateless authentication separating `ADMIN`, `STAFF`, and `CUSTOMER` roles.
- **Audit Trails & Security**: Comprehensive audit logging of user status changes, payments, and system events.
- **Financial & Operational Analytics**: Interactive dashboards with Recharts for revenue metrics, fleet utilization, and maintenance expenditures.

---

## 🏛️ System Architecture
