import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "../config/db.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import Coupon from "../models/coupon.model.js";
import Ticket from "../models/ticket.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const sampleCoupons = [
    {
        code: "CRAVELY50",
        title: "50% OFF up to ₹150",
        description: "Enjoy 50% discount on your favorite meals with minimum order ₹199",
        discountType: "percentage",
        discountValue: 50,
        maxDiscount: 150,
        minOrderAmount: 199,
        badge: "BESTSELLER"
    },
    {
        code: "WELCOME100",
        title: "Flat ₹100 OFF",
        description: "Flat ₹100 off on your first food order above ₹299",
        discountType: "flat",
        discountValue: 100,
        maxDiscount: 100,
        minOrderAmount: 299,
        badge: "WELCOME"
    },
    {
        code: "FESTIVE20",
        title: "20% OFF Unlimited Craving",
        description: "Celebrate with 20% off on all orders up to ₹120",
        discountType: "percentage",
        discountValue: 20,
        maxDiscount: 120,
        minOrderAmount: 149,
        badge: "FESTIVE"
    },
    {
        code: "FREEDEL",
        title: "Free Delivery Promo",
        description: "Zero delivery fee on orders over ₹150",
        discountType: "flat",
        discountValue: 30,
        maxDiscount: 30,
        minOrderAmount: 150,
        badge: "FREE DELIVERY"
    },
    {
        code: "SUPERBITE",
        title: "Flat ₹60 OFF Mega Meals",
        description: "Save ₹60 instantly on combos & family feasts",
        discountType: "flat",
        discountValue: 60,
        maxDiscount: 60,
        minOrderAmount: 249,
        badge: "MEGA COMBO"
    }
];

const sampleShops = [
    {
        name: "The Royal Biryani & Kebab Co.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
        city: "Greater Noida",
        state: "Uttar Pradesh",
        address: "Near Alpha 1 Commercial Belt, Greater Noida",
        rating: { average: 4.8, count: 184 },
        isApproved: true,
        items: [
            {
                name: "Hyderabadi Dum Biryani",
                image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
                category: "Main Course",
                price: 289,
                foodType: "non veg",
                rating: { average: 4.9, count: 240 }
            },
            {
                name: "Paneer Tikka Biryani",
                image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
                category: "Main Course",
                price: 249,
                foodType: "veg",
                rating: { average: 4.7, count: 120 }
            },
            {
                name: "Galouti Seekh Kebab (4 pcs)",
                image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
                category: "Snacks",
                price: 219,
                foodType: "non veg",
                rating: { average: 4.8, count: 95 }
            }
        ]
    },
    {
        name: "Fire & Crust Artisanal Pizzeria",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
        city: "Greater Noida",
        state: "Uttar Pradesh",
        address: "Pari Chowk Boulevard, Greater Noida",
        rating: { average: 4.7, count: 142 },
        isApproved: true,
        items: [
            {
                name: "Classic Margherita Basilico",
                image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
                category: "Pizza",
                price: 299,
                foodType: "veg",
                rating: { average: 4.8, count: 178 }
            },
            {
                name: "Spicy Pepperoni & Jalapeno Pizza",
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
                category: "Pizza",
                price: 389,
                foodType: "non veg",
                rating: { average: 4.9, count: 210 }
            },
            {
                name: "Truffle Garlic Cheese Bread",
                image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80",
                category: "Snacks",
                price: 159,
                foodType: "veg",
                rating: { average: 4.6, count: 88 }
            }
        ]
    },
    {
        name: "Urban Smash Burgers & Shakes",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
        city: "Greater Noida",
        state: "Uttar Pradesh",
        address: "Knowledge Park III Food Court, Greater Noida",
        rating: { average: 4.6, count: 210 },
        isApproved: true,
        items: [
            {
                name: "Double Cheddar Bacon Smash Burger",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                category: "Burgers",
                price: 239,
                foodType: "non veg",
                rating: { average: 4.8, count: 195 }
            },
            {
                name: "Crispy Peri Peri Paneer Burger",
                image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
                category: "Burgers",
                price: 189,
                foodType: "veg",
                rating: { average: 4.7, count: 140 }
            },
            {
                name: "Loaded Curly Fries with Queso",
                image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
                category: "Fast Food",
                price: 129,
                foodType: "veg",
                rating: { average: 4.5, count: 82 }
            }
        ]
    },
    {
        name: "Dragon Wok Pan-Asian Delights",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
        city: "Greater Noida",
        state: "Uttar Pradesh",
        address: "Grand Venice Mall, Sector 2, Greater Noida",
        rating: { average: 4.7, count: 98 },
        isApproved: true,
        items: [
            {
                name: "Hakka Chilli Garlic Noodles",
                image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
                category: "Chinese",
                price: 199,
                foodType: "veg",
                rating: { average: 4.6, count: 110 }
            },
            {
                name: "Crispy Kung Pao Chicken",
                image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
                category: "Chinese",
                price: 279,
                foodType: "non veg",
                rating: { average: 4.8, count: 135 }
            },
            {
                name: "Steamed Dim Sum Dumplings (6 pcs)",
                image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
                category: "Snacks",
                price: 189,
                foodType: "veg",
                rating: { average: 4.7, count: 76 }
            }
        ]
    },
    {
        name: "Velvet Crumb Sweet Patisserie",
        image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80",
        city: "Greater Noida",
        state: "Uttar Pradesh",
        address: "Gaur City Centre, Greater Noida West",
        rating: { average: 4.9, count: 165 },
        isApproved: true,
        items: [
            {
                name: "Belgian Molten Lava Cake",
                image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
                category: "Desserts",
                price: 149,
                foodType: "veg",
                rating: { average: 4.9, count: 260 }
            },
            {
                name: "Lotus Biscoff Cheesecake Slice",
                image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
                category: "Desserts",
                price: 199,
                foodType: "veg",
                rating: { average: 4.9, count: 180 }
            }
        ]
    }
];

export const seedDatabase = async () => {
    try {
        console.log("🌱 Starting Database Seeding...");
        await connectDb();

        // 1. Seed Coupons
        for (const couponData of sampleCoupons) {
            await Coupon.findOneAndUpdate(
                { code: couponData.code },
                { $set: couponData },
                { upsert: true, new: true }
            );
        }
        console.log("✅ Coupons seeded successfully!");

        // 2. Find or use owner
        let owner = await User.findOne({ role: "owner" });
        if (!owner) {
            owner = await User.findOne({ role: "superAdmin" });
        }

        if (!owner) {
            console.log("⚠️ No owner found to assign shops.");
            return;
        }

        // 3. Seed Shops & Items
        for (const sData of sampleShops) {
            let shop = await Shop.findOne({ name: sData.name });
            if (!shop) {
                shop = await Shop.create({
                    name: sData.name,
                    image: sData.image,
                    city: sData.city,
                    state: sData.state,
                    address: sData.address,
                    owner: owner._id,
                    rating: sData.rating,
                    isApproved: true
                });
                console.log(`🏪 Created shop: ${shop.name}`);
            }

            const itemIds = [];
            for (const itemData of sData.items) {
                let item = await Item.findOne({ name: itemData.name, shop: shop._id });
                if (!item) {
                    item = await Item.create({
                        ...itemData,
                        shop: shop._id
                    });
                    console.log(`  🍕 Created item: ${item.name}`);
                }
                itemIds.push(item._id);
            }

            shop.items = Array.from(new Set([...(shop.items || []), ...itemIds]));
            await shop.save();
        }

        // 4. Seed Support Sample Ticket if none exists
        const ticketCount = await Ticket.countDocuments();
        if (ticketCount === 0) {
            const customer = await User.findOne({ role: "user" });
            if (customer) {
                await Ticket.create({
                    ticketId: "CRV-1001",
                    user: customer._id,
                    category: "order_status",
                    subject: "Delivery timing inquiry for recent order",
                    message: "Hi, I just placed an order and wanted to know the estimated delivery timeframe.",
                    status: "resolved",
                    priority: "medium",
                    responses: [
                        {
                            sender: "user",
                            senderName: customer.fullName,
                            message: "Hi, I just placed an order and wanted to know the estimated delivery timeframe.",
                            createdAt: new Date(Date.now() - 3600000)
                        },
                        {
                            sender: "admin",
                            senderName: "Cravely Support Team",
                            message: "Hello! Most deliveries are completed in 30-40 minutes. You can track real-time updates directly on your Track Order page.",
                            createdAt: new Date(Date.now() - 1800000)
                        }
                    ],
                    resolvedAt: new Date()
                });
                console.log("✅ Sample support ticket seeded.");
            }
        }

        console.log("🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seed error:", error);
    }
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedDatabase().then(() => process.exit(0));
}

