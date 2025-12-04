require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve frontend (public folder)
app.use(express.static("public"));

// -------------------- DEBUG --------------------
console.log("🔑 Admin Password:", process.env.ADMIN_PASSWORD);

// -------------------- MONGODB CONNECTION --------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// -------------------- CONTACT SCHEMA --------------------
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);

// -------------------- NODEMAILER SETUP --------------------
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// -------------------- ROUTES --------------------

// Contact form submit
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const newMessage = new Contact({ name, email, message });
        await newMessage.save();

        // Send email to admin
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });

        res.status(200).json({ success: true, message: "Message sent!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin login
app.post("/api/admin/login", (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid password!" });
    }
});


// Fetch messages
app.get("/api/admin/messages", async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Delete a message
app.delete("/api/admin/messages/:id", async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("❌ Failed to delete message:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// Reply to a message via email
app.post("/api/admin/reply", async (req, res) => {
    const { email, replyMessage, subject } = req.body;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject || "Reply from Portfolio",
            text: replyMessage
        });

        res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("❌ Failed to send reply:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// -------------------- HOST FRONTEND ON RENDER --------------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
