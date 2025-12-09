const validator = require('validator');

const validate = (req) => {
    const { firstName, lastName, email, password, gender, age } = req.body;

    if (!validator.isEmail(email)) {
        throw new Error("Invalid Email Address");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password");
    }

}

const validUserUpdates = (req) => {
    const allowedUpdates = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "bio",
        "skills",
        "photourl",
        "photos",
        "mobile",
        "profession"
    ];

    const isUpdateValid = Object.keys(req.body).every(field => allowedUpdates.includes(field));

    return isUpdateValid;
}

module.exports = { validate, validUserUpdates };