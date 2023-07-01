require("dotenv").config();
const mongoose = require('mongoose');
//to connect database
const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.DB_HOST,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log('mongoDB connection Failed'+err);
        process.exit(1);
    }
}
module.exports=connectDB