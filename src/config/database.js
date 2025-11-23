const mongoose = require('mongoose');

const connectDB = async() =>{
   await mongoose.connect(`mongodb+srv://meghrajthakre444_db_user:MeghrajThakre%401234@mycluster.khcbhmn.mongodb.net/`)
}


connectDB()
.then(() => {
    console.log('Database connected successfully');
})
.catch((err) => {
    console.error('Database connection error:', err);
});