const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/userSchema.js');

// sending connection request
requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {

    try {
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // status type only allowed
       const allowedStatus = ['ignored', 'interested'];
  // WRONG SPELLING

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status type. Allowed types are: ${allowedStatus.join(', ')}`
            });
        }
        // checking existing request
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: fromUserId },
                { toUserId: toUserId }
            ]
        });

         // checking the fromUserId and toUserId are not same
        if(fromUserId === toUserId){
            return  res.status(400).json({
                success: false,
                message: `fromUserId and toUserId cannot be the same`
            });
        }


        // if sending id user is not in the database
        const userExists = await User.findById(toUserId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: `The user you are trying to send a request to does not exist.`
            });
        }

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: `A request between these users already exists.`
            });
        }

       
        const newRequsest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await newRequsest.save();

        res.status(201).json({
            success: true,
            message: `${req.user.firstName} is Sent  ${status}  request to ${userExists.firstName} - successfully`,
            request: newRequsest
        });

    } catch (error) {
        res.status(500).send(`ERROR sending request: ${error.message}`);
    }

})

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