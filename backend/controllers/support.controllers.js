import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";

// CREATE TICKET
export const createTicket = async (req, res) => {
    try {
        const { subject, message, category, orderId, priority } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }

        const ticketCount = await Ticket.countDocuments();
        const ticketId = `CRV-${1000 + ticketCount + 1}`;

        const user = await User.findById(req.userId);

        const newTicket = await Ticket.create({
            ticketId,
            user: req.userId,
            order: orderId || null,
            category: category || "order_status",
            subject,
            message,
            priority: priority || "medium",
            responses: [
                {
                    sender: "user",
                    senderName: user ? user.fullName : "Customer",
                    message,
                    createdAt: new Date()
                }
            ]
        });

        await newTicket.populate("order", "totalAmount paymentMethod shopOrders");

        return res.status(201).json({
            message: "Support ticket created successfully",
            ticket: newTicket
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET USER'S TICKETS
export const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.userId })
            .populate("order", "totalAmount paymentMethod shopOrders createdAt")
            .sort({ createdAt: -1 });
        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET ALL TICKETS (Admin)
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate("user", "fullName email mobile")
            .populate("order", "totalAmount paymentMethod shopOrders createdAt")
            .sort({ createdAt: -1 });
        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET TICKET BY ID
export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id)
            .populate("user", "fullName email mobile")
            .populate("order", "totalAmount paymentMethod shopOrders createdAt");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json(ticket);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ADD RESPONSE TO TICKET
export const respondToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, senderRole } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Response message cannot be empty" });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const user = await User.findById(req.userId);
        const isAdmin = user && user.role === "superAdmin";

        ticket.responses.push({
            sender: isAdmin ? "admin" : "user",
            senderName: isAdmin ? "Cravely Support Specialist" : (user?.fullName || "Customer"),
            message,
            createdAt: new Date()
        });

        if (isAdmin && ticket.status === "open") {
            ticket.status = "in_progress";
        }

        await ticket.save();
        return res.status(200).json(ticket);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// UPDATE TICKET STATUS (Admin)
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.status = status;
        if (status === "resolved" || status === "closed") {
            ticket.resolvedAt = new Date();
        }
        await ticket.save();

        return res.status(200).json({ message: "Status updated successfully", ticket });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

