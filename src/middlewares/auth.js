const User = require('../models/userSchema');
const jsonewebtoken = require('jsonwebtoken');

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("token is not valid!!!!!!!!!");;
        }
        const decodeMessage = await jsonewebtoken.verify(token, "meghrajsecret");
        const userId = decodeMessage.id;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();

    } catch (error) {
        res.status(401).send(`Unauthorized Access: ${error.message}`);
    }

}

module.exports = userAuth;