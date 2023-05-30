const express= require('express');
const app=express();
const connectDB=require('./config/database');
const secret=require('./config/config');
connectDB();
const userRoute=require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute');
const morgan = require('morgan');
const session=require('express-session')
app.use(express.static('public'))
app.use(userRoute);
app.use(adminRoute);
app.use(session({
    secret: secret.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000, sameSite: false }
}))



const PORT= process.env.PORT||3000
app.listen(PORT,()=>{
    console.log('server started listening at port'+PORT);
})