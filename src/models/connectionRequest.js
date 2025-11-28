const mongoose = require('mongoose');
// Connection Request Schema for DevTinder
const connectionRequestSchema = new mongoose.Schema({

    // User who is sending the request
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // User who is receiving the request
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Current status of the request
    // interested → pending request
    // accepted   → request approved
    // rejected   → declined by receiver
    // ignored    → silently ignored
    status: {
        type: String,
        enum: ['ignored', 'interested', 'accepted', 'rejected'],
        default: 'interested'
    }

}, {
    // Adds createdAt and updatedAt fields automatically
    timestamps: true
});

// Ensure unique request between same two users
connectionRequestSchema.index(
    { fromUserId: 1, toUserId: 1 },
);


// Prevent sending request to yourself
// connectionRequestSchema.pre('save', function (next) {
//     if (this.fromUserId.toString() === this.toUserId.toString()) {
//         return next(new Error("You cannot send a request to yourself."));
//     }
//     next();
// });


const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
module.exports = ConnectionRequest;
