const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/userSchema.js');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {

    try {
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // status type only allowed
        const allowedStatus = ['ignored', 'intrested'];
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
            message: `${req.user.firstName} is Sent  ${status}  request to ${userExists.firstName} successfully`,
            request: newRequsest
        });

    } catch (error) {
        res.status(500).send(`ERROR sending request: ${error.message}`);
    }

})

module.exports = requestRouter;