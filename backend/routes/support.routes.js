import express from "express";
import {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    respondToTicket,
    updateTicketStatus
} from "../controllers/support.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";

const supportRouter = express.Router();

supportRouter.post("/create", isAuth, createTicket);
supportRouter.get("/my-tickets", isAuth, getMyTickets);
supportRouter.get("/all", isAuth, isSuperAdmin, getAllTickets);
supportRouter.get("/:id", isAuth, getTicketById);
supportRouter.post("/:id/respond", isAuth, respondToTicket);
supportRouter.put("/:id/status", isAuth, isSuperAdmin, updateTicketStatus);

export default supportRouter;

