const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require('../models/payment');
const userAuth = require("../middlewares/auth");
const membershipAmount = require("../utils/constants");

// Define payment-related routes here
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user

    try {
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                firstName,
                lastName,
                email,
                membershipType: membershipType
            }
        })
        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes
        });
        const savedPayment = await payment.save()

        res.status(201).json({ ...savedPayment.toJSON(), key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: "Failed to create payment" });
    }


});

module.exports = paymentRouter;