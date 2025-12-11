const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/userSchema')

// Get all connection requests received by the logged-in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const requests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested",
        })
            .populate(
                "fromUserId",
                "_id firstName lastName photourl about"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            requests: requests.map((req) => ({
                _id: req._id,
                status: req.status,
                about: req.about,
                createdAt: req.createdAt,
                fromUser: req.fromUserId,
            })),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch connection requests",
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
            .populate("fromUserId", "firstName lastName photourl email age gender ")
            .populate("toUserId", "firstName lastName photourl email age gender ");

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


//feed api 
userRouter.get('/user/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const connectionsReq = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();

        connectionsReq.forEach(req => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        hideUserFromFeed.add(loggedInUser._id.toString());

        const users = await User.find({
            _id: { $nin: Array.from(hideUserFromFeed) },
        })
            .select("firstName lastName email age gender photourl")
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: "Feed fetched successfully",
            currentPage: page,
            limit,
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error fetching feed: ${error.message}`
        });
    }
});



module.exports = userRouter