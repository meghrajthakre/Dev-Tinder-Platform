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

        const signature = req.get("X-Razorpay-Signature");

        if (!signature) {
            return res.status(400).json({ message: "Signature missing" });
        }

        // ✅ Signature verification (RAW body)
        const isValidSign = validateWebhookSignature(
            req.body,
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );


        if (!isValidSign) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        // Parse RAW body AFTER validation
        const payload = JSON.parse(req.body.toString());

        // Only process payment.captured
        if (payload.event !== "payment.captured") {
            return res.status(200).json({ message: "Event ignored" });
        }

        const paymentDetails = payload.payload.payment.entity;

        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Idempotency check
        if (payment.status === "captured") {
            return res.status(200).json({ message: "Already processed" });
        }

        payment.status = "captured";
        payment.razorpayPaymentId = paymentDetails.id;
        await payment.save();


        const user = await User.findById(payment.userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const validityDate = new Date();
        validityDate.setFullYear(validityDate.getFullYear() + 1);

        user.isPremium = true;
        user.membershipType = payment.notes?.membershipType || "premium";
        user.membershipStartDate = new Date();
        user.membershipValidity = validityDate;
        user.verified = true ;
        await user.save();

        return res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
        console.log("❌ Webhook processing error:", error.message);
        return res.status(500).json({ message: "Webhook failed" });
    }
});

paymentRouter.post('/payment/verify', userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                isPremium: false 
            });
        }

        // Check if user has premium membership
        if (!user.isPremium) {
            return res.status(200).json({ 
                message: "No active premium membership",
                isPremium: false 
            });
        }

        // Check if membership is still valid
        const currentDate = new Date();
        const validityDate = new Date(user.membershipValidity);

        if (currentDate > validityDate) {
            // Membership expired - revoke access
            user.isPremium = false;
            await user.save();

            return res.status(200).json({ 
                message: "Premium membership has expired",
                isPremium: false,
                expiredOn: validityDate
            });
        }

        // Calculate days remaining
        const daysRemaining = Math.ceil((validityDate - currentDate) / (1000 * 60 * 60 * 24));

        // Membership is valid
        return res.status(200).json({ 
            message: "Premium membership is active",
            isPremium: true,
            membershipType: user.membershipType,
            startDate: user.membershipStartDate,
            validUntil: user.membershipValidity,
            daysRemaining: daysRemaining,
            expiringSoon: daysRemaining <= 7 // Warn if expiring within 7 days
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ 
            error: "Failed to verify payment status",
            isPremium: false 
        });
    }
});

module.exports = paymentRouter;