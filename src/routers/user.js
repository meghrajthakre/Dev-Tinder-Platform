const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest')

// Get all connection requests received by the logged-in user
userRouter.get('/user/request/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Fetch all connection requests where logged-in user is the receiver
        const requests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName photourl email");

        // If no requests found
        if (requests.length === 0) {
            return res.status(200).json({
                success: false,
                message: `${loggedInUser.firstName}, you have no pending connection requests.`,
                requests: []
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: `Here are all your pending connection requests, ${loggedInUser.firstName}.`,
            total: requests.length,
            requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error fetching requests: ${error.message}`
        });
    }
});


// Route to get all accepted connections of the logged-in user
userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        // Logged-in user details from auth middleware
        const loggedInUser = req.user;

        // Fetch all accepted connection requests where the logged-in user is 
        // either the sender (fromUserId) or the receiver (toUserId)
        const connectionReq = await ConnectionRequest.find({
            $or: [
                {
                    fromUserId: loggedInUser._id,
                    status: "accepted"
                },
                {
                    toUserId: loggedInUser._id,
                    status: "accepted"
                }
            ]
        })
        // Populate user data (only selected fields)
        .populate("fromUserId", "firstName lastName photourl email")
        .populate("toUserId", "firstName lastName photourl email");

        // Map each request and return the *other* user connected to the logged-in user
        const data = connectionReq.map((row) => {
            // If logged-in user is the sender, return receiver's data
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            // Else return sender's data
            return row.fromUserId;
        });

        // If user has no accepted connections
        if (data.length == 0) {
            return res.status(200).json({
                success: true,
                message: `You dont have any connections`,
            });
        }

        // Success response with final list of connections
        res.status(200).json({
            success: true,
            message: `fetch Data Successully`,
            request: data
        });

    } catch (error) {
        // Error handling
        res.status(500).json({
            success: false,
            message: `Error fetching Connections: ${error.message}`
        });
    }
});


module.exports = userRouter