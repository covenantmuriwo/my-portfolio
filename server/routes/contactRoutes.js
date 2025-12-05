const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST route to handle contact form submissions
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // IMPORTANT: send success:true so frontend knows!
        res.status(201).json({ success: true, message: "Message received!" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
