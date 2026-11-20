import express from "express";
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controllers/notification.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const notificationRouter = express.Router();

notificationRouter.get("/my", isAuth, getMyNotifications);
notificationRouter.put("/:id/read", isAuth, markNotificationAsRead);
notificationRouter.put("/read-all", isAuth, markAllNotificationsAsRead);

export default notificationRouter;

