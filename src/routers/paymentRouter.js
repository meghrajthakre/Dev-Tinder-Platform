const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require('../models/payment');
const userAuth = require("../middlewares/auth");
const membershipAmount = require("../utils/constants");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const Payment = require("../models/payment");
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
        // Extract webhook signature from request headers
        const webhookSignature = req.get('X-Razorpay-Signature'); // Fixed: get() is a method, not array access

        // Validate webhook signature to ensure request is from Razorpay
        const isValidSign = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        // Reject invalid signatures to prevent unauthorized access
        if (!isValidSign) {
            return res.status(400).json({ message: "Webhook signature invalid" });
        }
        
        const event = req.body.event;
        if (event !== "payment.captured") {
            return res.status(200).json({ message: "Event ignored" });
        }


        // Extract payment details from webhook payload
        const paymentDetails = req.body.payload.payment.entity;

        // Find payment record in database
        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id
        });

        // Handle case where payment record doesn't exist
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        // Update payment status from Razorpay webhook
        payment.status = paymentDetails.status;
        await payment.save();

        // Only update user to premium if payment was successful
        if (paymentDetails.status === 'captured' || paymentDetails.status === 'authorized') {
            const user = await User.findOne({ _id: payment.userId });

            // Handle case where user doesn't exist
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // Calculate 1 year validity from today
            const validityDate = new Date();
            validityDate.setFullYear(validityDate.getFullYear() + 1);

            // Grant premium membership to user
            user.isPremium = true;
            user.membershipType = payment.notes?.membershipType;
            user.membershipValidity = validityDate;
            user.membershipStartDate = new Date()
            await user.save();
        }

        // Respond with 200 to acknowledge webhook receipt (important for Razorpay)
        res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
        // Log error for debugging
        console.error('Webhook processing error:', error);

        // Return error response
        res.status(500).json({ error: "Failed to process webhook" }); // Fixed: message clarity
    }
});

module.exports = paymentRouter;