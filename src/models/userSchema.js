const mongoose = require('mongoose');
const validate = require('validator');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 2
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 2
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validate.isEmail(value)) {
                throw new Error("Invalid Email Address");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 100,
        validate(value) {
            if (!validate.isStrongPassword(value)) {
                throw new Error("Enter a strong password");
            }
        }

    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
        message: 'Gender must be Male, Female, or Other'
    },
    age: {
        type: Number,
        min: 0,
        max: 120
    },
    photourl: {
        type: String,
        default: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Ddummy&psig=AOvVaw2TYyHn6TsJwJf16E2fAQ34&ust=1764062698214000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCODV_uW7ipEDFQAAAAAdAAAAABAE',
        validate(value) {
            if (!validate.isURL(value)) {
                throw new Error("Invalid URL for photo");
            }
        }
    },
    skills: {
        type: [String],
        default: []
    }

}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);