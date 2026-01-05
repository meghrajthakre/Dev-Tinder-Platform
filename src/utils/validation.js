const validator = require("validator");

/* =====================================================
   SIGNUP VALIDATION
   ===================================================== */
const validateSignup = (body) => {
  if (!body || Object.keys(body).length === 0) {
    throw new Error("Request body is missing");
  }

  const { email, password } = body;
  console.log(email, password);

  if (!email || !validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

/* =====================================================
   PROFILE UPDATE VALIDATION
   ===================================================== */
const validateProfileUpdates = (data) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "interests",
    "photourl",
    "photos",
    "mobile",
    "profession",
    "experienceLevel",
    "lookingFor",
    "location",
    "socialLinks",
  ];

  const updates = Object.keys(data);

  const isValidOperation = updates.every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    throw new Error("Invalid profile update fields");
  }
};

module.exports = {
  validateSignup,
  validateProfileUpdates,
};
