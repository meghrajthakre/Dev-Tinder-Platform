const mongoose = require('mongoose');

const connectDB = async () => {
   await mongoose.connect(`mongodb+srv://meghrajthakre444_db_user:${process.env.MONGODB_PASSWORD}@mycluster.khcbhmn.mongodb.net/`)
}

module.exports = connectDB;
