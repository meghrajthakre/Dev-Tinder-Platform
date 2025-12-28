const mongoose = require('mongoose');
const validate = require('validator');
const { Schema } = mongoose;
const jsonewebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
    mobile: {
        type: Number,

    },
    profession: {
        type: String
    },
    about: {
        type: String
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
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTabOgeMNrSqYJ4c2-kMg0I_QreIqbVVfgvWQ&s',
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


userSchema.methods.getJWT = async function () {

    // "this" refers to the current user document instance
    const user = this;

    // Generate a JWT token for the user
    const jwt = await jsonewebtoken.sign(
        { id: user._id },     // Payload: store user's unique ID
        "meghrajsecret",      // Secret key used to sign the token
        { expiresIn: "1d" }   // Token expiry time: valid for 1 day
    );

    // Return the generated JWT
    return jwt;
}


userSchema.methods.isPassValid = async function (inputPassword) {

    // "this" refers to the current user document
    const user = this;
    // Get the hashed password stored in the database
    const hashPassword = user.password;
    // Compare the incoming plain password with the hashed password
    const passValid = await bcrypt.compare(inputPassword, hashPassword);
    // Return true (valid) or false (invalid)
    return passValid;
}


module.exports = mongoose.model('User', userSchema);