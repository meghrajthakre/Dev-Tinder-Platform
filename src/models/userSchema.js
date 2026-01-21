const mongoose = require('mongoose');
const validate = require('validator');
const { Schema } = mongoose;
const jsonewebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true,
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
            },
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
            },
        },

        mobile: {
            type: Number,
        },

        profession: {
            type: String,
            trim: true,
        },

        experienceLevel: {
            type: String,
            enum: ["Student", "Fresher", "Junior", "Mid", "Senior"],
        },

        about: {
            type: String,
            maxlength: 500,
            trim: true,
        },

        gender: {
            type: String,

        },

        age: {
            type: Number,
            min: 0,
            max: 120,
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        membershipType: {
            type: String,   
        },
        membershipValidity: {
            type: Date
        },
        membershipStartDate: {
            type: Date,
        },

        photourl: {
            type: String,
            default:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTabOgeMNrSqYJ4c2-kMg0I_QreIqbVVfgvWQ&s",
            validate(value) {
                if (!validate.isURL(value)) {
                    throw new Error("Invalid photo URL");
                }
            },
        },

        photos: {
            type: [String],
            default: [],
        },

        skills: {
            type: [String],
            default: [],
        },

        interests: {
            type: [String],
            default: [],
        },

        lookingFor: {
            type: String,
            enum: ["Networking", "Dating", "Friendship", "Hiring"],
            default: "Networking",
        },

        location: {
            city: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
            },
        },

        verified: {
            type: Boolean,
            default: false,
        },

        profileCompleted: {
            type: Boolean,
            default: false,
        },

        isOnline: {
            type: Boolean,
            default: false,
        },

        lastSeen: {
            type: Date,
            default: Date.now,
        },
        // 🔹 Developer specific profile data

        githubUsername: {
            type: String,
            trim: true,
        },

        githubProfileUrl: {
            type: String,
            trim: true,
            validate(value) {
                if (value && !validate.isURL(value)) {
                    throw new Error("Invalid GitHub URL");
                }
            },
        },

        linkedinProfileUrl: {
            type: String,
            trim: true,
            validate(value) {
                if (value && !validate.isURL(value)) {
                    throw new Error("Invalid LinkedIn URL");
                }
            },
        },

        portfolioUrl: {
            type: String,
            trim: true,
            validate(value) {
                if (value && !validate.isURL(value)) {
                    throw new Error("Invalid Portfolio URL");
                }
            },
        },

        currentRole: {
            type: String,
            trim: true, // Frontend Dev, Backend Dev, Full Stack etc
        },

        preferredTechStack: {
            type: [String], // React, Node, MongoDB
            default: [],
        },

        openToWork: {
            type: Boolean,
            default: false,
        },

        lookingForRoles: {
            type: [String], // Intern, Full-time, Freelance
            default: [],
        },

        availability: {
            type: String,
            enum: ["Full-time", "Part-time", "Freelance", "Open Source"],
        },

        githubStats: {
            repos: Number,
            followers: Number,
            following: Number,
        },

        matchPreferences: {
            skills: {
                type: [String],
                default: [],
            },
            experienceLevel: {
                type: [String],
                default: [],
            },
            locationPreference: {
                type: String,
                enum: ["Remote", "Same City", "Anywhere"],
                default: "Anywhere",
            },
        },

    },
    { timestamps: true }
);


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