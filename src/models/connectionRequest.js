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

// connectionRequestSchema.pre('save', function (next) {

//     // chechking fromUserId and toUserId are not same
//     if(this.fromUserId.toString() === this.toUserId.toString()){
//         throw new Error("fromUserId and toUserId cannot be the same");
//     }
//     next();
// })

const ConneectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
module.exports = ConneectionRequest;