const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

/**
 * USER SCHEMA
 */
const userSchema = new Schema(
  {
    /* ================= BASIC INFO ================= */
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // 🔐 never send password in queries
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password must be strong");
        }
      },
    },

    /* ================= PROFILE INFO ================= */
    age: {
      type: Number,
      min: 18,
      max: 100,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    about: {
      type: String,
      maxlength: 300,
    },

    profession: {
      type: String,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: ["Student", "Fresher", "Junior", "Mid", "Senior"],
    },

    /* ================= MEDIA ================= */
    photourl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTabOgeMNrSqYJ4c2-kMg0I_QreIqbVVfgvWQ&s",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL");
        }
      },
    },

    photos: {
      type: [String], // multiple images (Tinder-style)
      default: [],
    },

    /* ================= INTERESTS & SKILLS ================= */
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
      enum: ["Dating", "Friendship", "Networking", "Hiring"],
      default: "Networking",
    },

    /* ================= LOCATION ================= */
    location: {
      city: String,
      country: String,
    },

    distance: {
      type: Number, // km (calculated server/frontend)
    },

    /* ================= STATUS ================= */
    verified: {
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

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    /* ================= SOCIAL LINKS ================= */
    socialLinks: {
      github: {
        type: String,
        validate: v => !v || validator.isURL(v),
      },
      linkedin: {
        type: String,
        validate: v => !v || validator.isURL(v),
      },
      portfolio: {
        type: String,
        validate: v => !v || validator.isURL(v),
      },
    },
  },
  { timestamps: true }
);

/* =========================================================
   🔐 MIDDLEWARES
   ========================================================= */

/**
 * Hash password before saving
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* =========================================================
   🔑 INSTANCE METHODS
   ========================================================= */

/**
 * Generate JWT
 */
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/**
 * Compare password
 */
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

/* =========================================================
   📦 EXPORT
   ========================================================= */
module.exports = mongoose.model("User", userSchema);
