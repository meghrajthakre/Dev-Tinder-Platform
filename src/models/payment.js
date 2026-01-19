const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    status: {
        type: String,
        required:true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,   
        required: true
    },
    receipt: { 
        type: String,
        required: true
    },
    notes: {
       firstName: String,
       lastName: String,
       email:String,
       membershipType: String
    }

})


const payment = mongoose.model("Payment", paymentSchema);
module.exports = payment;