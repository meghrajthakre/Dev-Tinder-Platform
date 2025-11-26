const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {

    try {
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        
        const newRequsest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await newRequsest.save();

        res.status(201).json({
            success: true,
            message: `Connection  ${status}  request successfully`,
            request: newRequsest
        });
        
    } catch (error) {
        res.status(500).send(`ERROR sending request: ${error.message}`);
    }

})

module.exports = requestRouter;