const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {

    try {
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // ststus type only allowed
        const allowedStatus = ['ignored', 'intrested'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status type. Allowed types are: ${allowedStatus.join(', ')}`
            });
        }
        // checking existing request
        const existingRequest = await ConnectionRequest.findOne({
            $or:[
            { fromUserId: fromUserId },
            { toUserId: toUserId }
        ]
        });

        // if sending id user is not in the database
        const userExists = await User.findByid(toUserId);
        if(!userExists){
            return res.status(404).json({
                success: false,
                message: `The user you are trying to send a request to does not exist.`
            });
        }

        if(existingRequest){
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
            message: `${req.user.firstName} is Sent  ${status}  request to successfully`,
            request: newRequsest
        });

    } catch (error) {
        res.status(500).send(`ERROR sending request: ${error.message}`);
    }

})

module.exports = requestRouter;