# 🍕 **Cravely — Food Delivery Platform**

<div align="center">

![Cravely Banner](https://img.shields.io/badge/Cravely-Food%20Delivery-red?style=for-the-badge&logo=foodpanda)
![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**A full-stack food delivery platform connecting Customers, Restaurant Owners, Delivery Boys, and Super Admins in real-time.**

[🌐 Live Demo](https://cravely-food-delivery-website.vercel.app) → [📡 API](https://cravely-backend-dmak.onrender.com)

</div>

---

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Real-time Features](#-real-time-features)
- [Key Features Summary](#-key-features-summary)
- [System Flow](#-system-flow)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 **Overview**

**Cravely** is a full-stack food delivery platform that connects **Customers**, **Restaurant Owners**, **Delivery Boys**, and **Super Admins** in one seamless ecosystem. Built with modern technologies, it offers real-time order tracking, secure payments, and role-based access control.

### 🌐 **Live URLs**

| Service | URL |
|---------|-----|
| **Frontend** | https://cravely-food-delivery-website.vercel.app |
| **Backend API** | https://cravely-backend-dmak.onrender.com |

---

## ✨ **Features**

### 🛒 **Customer Features**

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication** | Signup/Login with Email, Google OAuth, or OTP |
| 2 | **Email Verification** | Verify email before accessing account |
| 3 | **Location Detection** | Auto-detect city using Geoapify API |
| 4 | **Restaurant Discovery** | Browse restaurants by city and category |
| 5 | **Real-time Search** | Search restaurants and food items instantly |
| 6 | **Cart Management** | Add/remove items, update quantities in real-time |
| 7 | **Cross-Shop Cart** | Order from multiple restaurants in single checkout |
| 8 | **Delivery Fee Logic** | ₹30 fee if order < ₹199, Free if ≥ ₹199 |
| 9 | **Interactive Map** | Set delivery location by dragging pin |
| 10 | **Current Location** | One-click jump to GPS location |
| 11 | **Saved Addresses** | Add, edit, delete, and set default addresses |
| 12 | **Payment Options** | Cash on Delivery (COD) and Online via Razorpay |
| 13 | **Razorpay Integration** | Secure online payments with signature verification |
| 14 | **Real-time Order Updates** | Socket.IO notifications for status changes |
| 15 | **Order History** | View all orders with filters (status, date, payment) |
| 16 | **Live Tracking** | Track delivery boy on interactive map |
| 17 | **Order Cancellation** | Cancel orders with reason selection |
| 18 | **Refund Status** | Track refund status for cancelled online orders |
| 19 | **Order Again** | One-click reorder from past orders |
| 20 | **Item Rating** | Rate food items (1-5 stars) |
| 21 | **Restaurant Review** | Review and rate restaurant experience |
| 22 | **Delivery Boy Rating** | Rate delivery boy's service and behavior |
| 23 | **Review Replies** | Restaurant owners can reply to reviews |
| 24 | **Like Reviews** | Like/dislike other customer reviews |
| 25 | **Verified Reviews** | Only verified orders can leave reviews |
| 26 | **Wishlist** | Save favorite items with localStorage persistence |
| 27 | **Email Notifications** | Order confirmation, delivery OTP, updates |
| 28 | **Invoice Generation** | Download PDF invoices |
| 29 | **Profile Management** | Update profile, change password, upload photo |
| 30 | **Multi-tab Sessions** | Different users in different browser tabs |

### 👨‍🍳 **Restaurant Owner Features**

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Shop Registration** | Create shop with name, image, address, city, state |
| 2 | **Shop Editing** | Update shop details and image |
| 3 | **Shop Approval** | Admin approval required for shop activation |
| 4 | **Owner Dashboard** | View total items, orders, revenue, pending orders |
| 5 | **Pending Approval Banner** | Displayed until admin approves shop |
| 6 | **Add Food Item** | Name, price, category, image, food type (Veg/Non-Veg) |
| 7 | **Edit Item** | Update all item details |
| 8 | **Delete Item** | Remove items from menu |
| 9 | **Item Categories** | Pizza, Burgers, Desserts, Chinese, North Indian, etc. |
| 10 | **Item Ratings** | Customer ratings displayed on each item |
| 11 | **Real-time Orders** | New orders appear instantly via Socket.IO |
| 12 | **Order Dashboard** | View all orders with status filters |
| 13 | **Order Status Updates** | Pending → Preparing → Out for Delivery → Delivered |
| 14 | **Delivery Broadcast** | Broadcast to delivery boys within 15km radius |
| 15 | **Delivery Boy List** | View available nearby delivery boys |
| 16 | **Assign Delivery Boy** | Select and assign delivery boy to order |
| 17 | **Order History** | View all past orders with filters |
| 18 | **Customer Details** | View customer name, phone, address for each order |
| 19 | **Revenue Tracking** | Track earnings from orders |
| 20 | **Today's Orders** | View orders placed today |

### 🛵 **Delivery Boy Features**

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dedicated Login** | Separate login portal for delivery boys |
| 2 | **Admin Approval** | Requires admin approval before accepting orders |
| 3 | **Online/Offline Status** | Toggle availability for deliveries |
| 4 | **Real-time Notifications** | Socket.IO notification for new delivery assignments |
| 5 | **Available Orders** | List of broadcasted orders within 15km radius |
| 6 | **Accept Order** | Accept available delivery assignment |
| 7 | **Reject Order** | Reject and remain available for other orders |
| 8 | **Assignment Status** | Broadcasted → Assigned → Completed |
| 9 | **Live Location Update** | GPS coordinates emit every few seconds |
| 10 | **Customer Map View** | Customer sees live location on Track Order page |
| 11 | **Route Display** | Polyline showing path to customer |
| 12 | **Distance Calculation** | Show distance remaining to customer |
| 13 | **Request OTP** | Click "Mark as Delivered" to send OTP to customer |
| 14 | **Customer Receives OTP** | OTP sent to customer's email |
| 15 | **Enter OTP** | Delivery boy enters OTP from customer |
| 16 | **Verify OTP** | OTP verified → Order marked delivered |
| 17 | **OTP Expiry** | 5 minutes validity |
| 18 | **Resend OTP** | Option to resend if expired |
| 19 | **Today's Earnings** | ₹50 added per delivery |
| 20 | **Total Deliveries** | Count of deliveries done today |
| 21 | **Delivery Chart** | Bar chart showing hourly deliveries |
| 22 | **Rating Display** | Average rating from customers |
| 23 | **Completion Rate** | Percentage of completed deliveries |
| 24 | **Delivery History** | View past deliveries with details |

### 👑 **Super Admin Features**

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Platform Dashboard** | Total users, shops, orders, revenue |
| 2 | **User Statistics** | Total users, owners, delivery boys |
| 3 | **Order Statistics** | Total, pending, delivered orders |
| 4 | **Revenue Chart** | Daily revenue breakdown |
| 5 | **Quick Actions** | Navigate to users, shops, orders, revenue pages |
| 6 | **Animated Cards** | 3D animated stats cards |
| 7 | **View All Users** | List all users with roles |
| 8 | **Search Users** | Search by name, email, or mobile |
| 9 | **Filter Users** | Filter by role (User, Owner, Delivery Boy, Super Admin) |
| 10 | **Block User** | Block/unblock users |
| 11 | **Delete User** | Permanently delete user accounts |
| 12 | **User Details** | View user profile information |
| 13 | **View All Shops** | List all registered shops |
| 14 | **Approve Shop** | Approve pending restaurants |
| 15 | **Reject Shop** | Reject inappropriate shop registrations |
| 16 | **Search Shops** | Search by name or address |
| 17 | **Filter Shops** | Filter by approval status |
| 18 | **Shop Details** | View shop information, owner, rating |
| 19 | **View All Orders** | Complete order history across platform |
| 20 | **Filter Orders** | Filter by status (Pending, Preparing, etc.) |
| 21 | **Order Details** | View complete order information |
| 22 | **Refund Management** | Process refunds for cancelled online orders |
| 23 | **Update Refund Status** | Pending → Processing → Completed → Failed |
| 24 | **Order Pagination** | 10 orders per page |
| 25 | **View All Delivery Boys** | List with approval status |
| 26 | **Approve Delivery Boy** | Approve pending delivery boy accounts |
| 27 | **Reject Delivery Boy** | Reject applications |
| 28 | **Online/Offline Status** | See current availability |
| 29 | **Delivery Boy Details** | View ratings, total deliveries |
| 30 | **Revenue Dashboard** | Total revenue, orders, average order value |
| 31 | **Daily Revenue Chart** | Bar chart of daily earnings |
| 32 | **Period Filter** | Filter by week, month, or year |
| 33 | **Download Reports** | Export revenue data |

---

## 👥 **User Roles**

| Role | Description | Access |
|------|-------------|--------|
| **Customer** | End user who orders food | Browse, Order, Track, Review |
| **Restaurant Owner** | Manages restaurant | Create shop, Manage menu, Orders |
| **Delivery Boy** | Delivers orders to customers | Accept orders, Live tracking, Earnings |
| **Super Admin** | Platform administrator | Manage users, shops, orders, revenue |

---

## 🛠️ **Tech Stack**

🎨 Frontend Technologies

Technology	            Purpose

React	                UI Framework
Vite	                Build Tool
React Router	        Navigation
Redux Toolkit	        State Management
Tailwind CSS	        Styling
Framer Motion	        Animations
React Icons	            Icons
React Leaflet	        Maps
Recharts	            Charts
Axios	                HTTP Client
Socket.io-client	    Real-time Communication
Firebase	            Google Authentication
Razorpay	            Payment Gateway
React Toastify	        Notifications
html2canvas	            PDF Generation
jsPDF	                PDF Generation

⚙️ Backend Technologies

Technology	            Purpose

Node.js	                Runtime Environment
Express	                Web Framework
MongoDB	                Database
Socket.io	            Real-time Communication
JWT	                    Authentication
bcryptjs	            Password Hashing
Nodemailer	            Email Services
Cloudinary	            Image Upload & Hosting
Razorpay	            Payment Gateway
Multer	                File Upload
CORS	                Cross-Origin Resource Sharing

☁️ Services & APIs

Service	                Purpose

MongoDB Atlas	        Cloud Database
Cloudinary	            Image Hosting
Razorpay	            Payment Gateway
Firebase	            Google Authentication
Gmail SMTP	            Email Notifications
Geoapify	            Location & Geocoding
Render	                Backend Hosting
Vercel	                Frontend Hosting

---

### ⚙️ System Flow

User logs in
  → Geoapify detects city from GPS
  → Shops from that city fetched from MongoDB
  → User browses / searches
  → Adds items to cart (cross-shop supported)
  → Checkout → sets pin on Leaflet map
  → Pays via COD or Razorpay (test mode)
  → Order saved → Socket emits → Owner sees it live
  → Email confirmation sent to customer

Owner receives order
  → Updates status → Customer gets real-time toast
  → Status: Pending → Preparing → Out for Delivery → Delivered
  → Marks "Out for Delivery"
  → Available delivery boys (within 15km) get Socket notification

Delivery boy accepts
  → Live map opens (their location + customer location)
  → GPS updates emit every few seconds
  → Customer watches live on Track Order page
  → Delivery boy arrives → "Mark as Delivered"
  → OTP sent to customer email
  → OTP verified → Order marked Delivered (real-time)
  → Delivery boy available again + ₹50 added to earnings

Customer can:
  → Rate food items
  → Rate restaurant
  → Rate delivery boy
  → Save items to wishlist
  → Order again with one click


### 🙏 Acknowledgments

MongoDB Atlas for database

Cloudinary for image hosting

Razorpay for payments

Firebase for Google Auth

Vercel for frontend hosting

Render for backend hosting

Geoapify for location services

Made with ❤️ by Team Cravely