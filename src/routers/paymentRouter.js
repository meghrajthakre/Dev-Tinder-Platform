const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");

// Define payment-related routes here
paymentRouter.post("/payment/create", async (req, res) => {
    try {
        const order = await razorpayInstance.orders.create({
            amount: 50000,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                key1: "value3",
                key2: "value2",
                membershipType: "premium"
            }
        })
        res.status(201).json({ order });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: "Failed to create payment" });
    }


});

module.exports = paymentRouter;