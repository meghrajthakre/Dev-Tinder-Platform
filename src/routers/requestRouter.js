const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/auth');


requestRouter.post('/sendConnectRequest', userAuth, async (req, res) => {
    const user = req.user;

    res.send(user.firstName + " " + user.lastName + " Connection Request Sent Successfully");
})

module.exports = requestRouter;