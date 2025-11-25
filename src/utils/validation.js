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

module.exports = validate;