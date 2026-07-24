# 🍔 SkyBite — Food Delivery Platform

SkyBite is a full-stack food delivery web app with three separate portals — **Customer**, **Shop Owner**, and **Delivery Boy** — all connected in real time via Socket.IO.

🌐 **Live Demo:** [skybite-food-delivery.onrender.com](https://skybite-food-delivery.onrender.com)

> **Stack:** React (Vite) · Node.js · Express · MongoDB · Socket.IO · Firebase · Razorpay · React Leaflet · Cloudinary · Geoapify

---

## 👤 Customer

**Auth**
- Sign up / login with email & password or Google OAuth (Firebase)
- Session persists for days using JWT
- Forgot password → reset link sent via Nodemailer / Resend

**Shop Discovery**
- On login, Geoapify auto-detects the user's city from coordinates
- Only shops registered in that city are fetched from MongoDB
- Real-time search bar to find shops and items instantly

**Cart & Checkout**
- Add items from multiple different shops in a single order
- At checkout, a React Leaflet map opens — drag the pin to set exact delivery location or jump to current location
- Two payment options: **Cash on Delivery** or **Online via Razorpay (test mode)**

**After Order**
- Order appears on My Orders page instantly via Socket.IO — no refresh needed
- Every owner status update triggers a real-time toast notification
- **Track Order** page shows the delivery boy's live location updating on the map

**OTP on Delivery**
- When delivery boy marks "Delivered", an OTP is sent to the customer's email
- Order is confirmed only after the delivery boy enters the correct OTP

---

## 🏪 Shop Owner

- Register a shop with name, photo, category, and veg / non-veg type — images stored on Cloudinary
- Add, edit, and delete menu items
- Incoming orders appear in real time on the My Orders dashboard via Socket.IO
- Update order status — customer sees the change instantly with a toast
- On marking "Out for Delivery", a list of available delivery boys within 10–15 km is shown

---

## 🛵 Delivery Boy

- Separate login portal
- Gets a real-time notification when a new order is out for delivery and they are free and within range
- On accepting — a live map opens showing route between their location and the customer
- GPS coordinates emit every few seconds — both delivery boy and customer see the position update live
- Must verify the customer's OTP to mark the order as delivered
- ₹50 earning added per delivery, visible on their dashboard in real time
- After OTP verification, delivery boy is marked available again for the next order

---

## 🛠 Tech Stack

| Purpose | Technology |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS |
| Routing | React Router v6 |
| Maps | React Leaflet |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | Firebase (Google OAuth) + JWT |
| Real-time | Socket.IO |
| Payments | Razorpay (Test Mode) |
| Email | Nodemailer / Resend |
| Image Storage | Cloudinary |
| Location | Geoapify API |
| Deployment | Render |

---

## ⚙️ How It All Flows

```
User logs in
  └── Geoapify detects city
      └── Shops from that city fetched from MongoDB
          └── User browses / searches
              └── Adds items to cart (cross-shop supported)
                  └── Checkout → sets pin on Leaflet map
                      └── Pays via COD or Razorpay
                          └── Order saved → Socket emits → Owner sees it live

Owner receives order
  └── Updates status → Customer gets real-time toast
      └── Marks "Out for Delivery"
          └── Available delivery boys (within 10–15 km) get Socket notification

Delivery boy accepts
  └── Live map opens (their location + customer location)
      └── GPS updates emit every few seconds
          └── Customer watches live on Track Order page
              └── Delivery boy arrives → "Mark Delivered" → OTP sent to customer
                  └── OTP verified → Order marked Delivered (real-time for all)
                      └── Delivery boy available again + ₹50 added to earnings
```

Built by [Akash Yadav](https://github.com/akashyadav-tech)

