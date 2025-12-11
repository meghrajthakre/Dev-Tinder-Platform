const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/userSchema.js');

// sending connection request
requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;         // always use _id from Mongo
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // Allowed status
        const allowedStatus = ['ignored', 'interested'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status type. Allowed types: ${allowedStatus.join(', ')}`
            });
        }

        // Prevent sending request to yourself
        if (fromUserId.toString() === toUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: `You cannot send a request to yourself`
            });
        }

        // Check if target user exists
        const userExists = await User.findById(toUserId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: `The user you are trying to send a request to does not exist`
            });
        }

        // Check for existing request both directions
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: `A request between these users already exists.`
            });
        }

        // Create new request
        const newRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await newRequest.save();

        return res.status(201).json({
            success: true,
            message: `${req.user.firstName} sent an '${status}' request to ${userExists.firstName} successfully.`,
            request: newRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error sending request: ${error.message}`
        });
    }
});


// // accepting connection request ot rejecting
// Review a connection request (Accept or Reject)
requestRouter.patch('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { requestId, status } = req.params;

        // Allowed status values
        const allowedStatus = ['accepted', 'rejected'];

        // Validate status
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status type. Allowed types: ${allowedStatus.join(', ')}`
            });
        }

        // Find the request:
        // 1. Must match the requestId
        // 2. Must belong to the logged-in user (toUserId)
        // 3. Must be in 'interested' state
        const request = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        });
        console.log(request)
        // If no such request exists -> send error
        if (!request) {
            return res.status(404).json({
                success: false,
                message: `No pending (interested) request found for the logged-in user.`
            });
        }

        // Update request status
        request.status = status;
        await request.save();

        res.status(200).json({
            success: true,
            message: `${loggedInUser.firstName}, you have successfully ${status} this connection request.`,
            request
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error updating request: ${error.message}`
        });
    }
});


module.exports = requestRouter;