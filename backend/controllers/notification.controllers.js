import Notification from "../models/notification.model.js";

// GET USER NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({
            user: req.userId,
            isRead: false
        });

        return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// MARK NOTIFICATION AS READ
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndUpdate(
            { _id: id, user: req.userId },
            { isRead: true }
        );
        return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// MARK ALL AS READ
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.userId, isRead: false },
            { isRead: true }
        );
        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// HELPER: Send notification to user
export const sendNotification = async (userId, title, message, type = "system", link = "") => {
    try {
        const notif = await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });
        return notif;
    } catch (err) {
        console.log("Error sending notification:", err.message);
    }
};

