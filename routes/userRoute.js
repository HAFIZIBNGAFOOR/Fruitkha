const express=require ('express');
const userRoute=express();
const bodyParser=require('body-parser');
const userController= require('../controllers/userController');
const morgan = require('morgan');
const config=require('../config/config');
const session= require('express-session');
const auth =require('../middleware/auth');

userRoute.use(session({secret:config.sessionSecret,resave: true, saveUninitialized: true}));
userRoute.set('view engine','ejs');
userRoute.set('views','./views/userViews');
userRoute.use(express.json());
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}));
userRoute.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next();
})
userRoute.use(morgan('dev'));
userRoute.get('/signup',userController.loadSignUp);
userRoute.post('/signup',userController.sendOTP);
//userRoute.get('/resendOtp',userController.resendOTP)
//userRoute.get('/otp',userController.getOTP)
userRoute.post('/otp',userController.verifyOTP);
userRoute.get('/',userController.loadHome);
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login/otp',userController.verifyLogin);
userRoute.post('/login',userController.verifyUser)
//userRoute.post('/otpLogin',userController.userVerify);
userRoute.get('/shop',userController.loadShop);
userRoute.get('/single-product',userController.singleProductLoad);
// userRoute.post('/category-filter',userController.categoryFilter);
userRoute.post('/add-to-cart',userController.addToCart);
userRoute.get('/cart',userController.loadCart);
userRoute.post('/delete-cartItem',userController.deleteCart)

userRoute.get('/logout',auth.userLogout);

module.exports=userRoute;