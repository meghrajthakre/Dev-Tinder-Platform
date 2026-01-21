const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require('../models/payment');
const userAuth = require("../middlewares/auth");
const membershipAmount = require("../utils/constants");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const User = require("../models/userSchema");

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

paymentRouter.post('/payment/webhook', async (req, res) => {
    try {
        console.log("🔔 Webhook received");

        const signature = req.get("X-Razorpay-Signature");
        console.log("Signature received:", !!signature);

        if (!signature) {
            console.log("❌ Signature missing");
            return res.status(400).json({ message: "Signature missing" });
        }

        // ✅ Signature verification (RAW body)
        const isValidSign = validateWebhookSignature(
            req.body,
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        console.log("Signature valid:", isValidSign);

        if (!isValidSign) {
            console.log("❌ Invalid webhook signature");
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        // Parse RAW body AFTER validation
        const payload = JSON.parse(req.body.toString());
        console.log("Webhook event:", payload.event);

        // Only process payment.captured
        if (payload.event !== "payment.captured") {
            console.log("ℹ️ Event ignored:", payload.event);
            return res.status(200).json({ message: "Event ignored" });
        }

        const paymentDetails = payload.payload.payment.entity;

        console.log("Order ID:", paymentDetails.order_id);
        console.log("Payment ID:", paymentDetails.id);
        console.log("Payment Status:", paymentDetails.status);

        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        });

        if (!payment) {
            console.log("❌ Payment record not found");
            return res.status(404).json({ message: "Payment not found" });
        }

        // Idempotency check
        if (payment.status === "captured") {
            console.log("ℹ️ Payment already processed");
            return res.status(200).json({ message: "Already processed" });
        }

        payment.status = "captured";
        payment.razorpayPaymentId = paymentDetails.id;
        await payment.save();

        console.log("✅ Payment marked as captured");

        const user = await User.findById(payment.userId);

        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const validityDate = new Date();
        validityDate.setFullYear(validityDate.getFullYear() + 1);

        user.isPremium = true;
        user.membershipType = payment.notes?.membershipType || "premium";
        user.membershipStartDate = new Date();
        user.membershipValidity = validityDate;

        await user.save();

        console.log("✅ User upgraded to premium:", user._id);

        return res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
        console.log("❌ Webhook processing error:", error.message);
        return res.status(500).json({ message: "Webhook failed" });
    }
});

module.exports = paymentRouter;