const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        enum: {
            values: ['ignored', 'intrested', 'rejected', 'accepted  '],
        }
    }
}, { timestamps: true })

const ConneectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
module.exports = ConneectionRequest;