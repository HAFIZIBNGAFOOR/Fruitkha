const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userSchema');
const { log } = require('console');
const bcrypt = require('bcrypt');
const Product = require('../models/productSchema');
const securePassword=async (password)=>{
    try {
        const hashpassword= await bcrypt.hash(password,10)
        return hashpassword;
    } catch (error) {
        console.log('securing password error '+error);
    }
}
const loadLogin=(req,res)=>{
    try {
       if(req.session.user){
        res.redirect('/')
       }else{
        res.render('userLogin')
       }

    } catch (error) {
        console.log('login rendering error '+error);
    }
}
const loadSignUp=(req,res)=>{
    try {
        res.render('userSignup')
    } catch (error) {
        console.log('signup page error'+error);
    }
}
const generateOTP=()=>{
    const otp=Math.floor(Math.random()*9000)+1000;
    return otp;
}
const sendOTPMail=(email,otpCode)=>{
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hafizahmed0303@gmail.com',
              pass: 'gybktcpfuxveinfv'
            }
          });
          
          const mailOptions = {
              from: 'hafizahmed0303@gmail.com',
              to: email,
              subject: 'OTP for Registration',
              text: `Your OTP for registration is: ${otpCode}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log('Error sending email:', error);
                  return false
                } else {
                  console.log('Email sent:', info.response);
                  return true;
                }
              })     
    } catch (error) {
        console.log('sending otp failed send otp mail'+error);
        return false;
    }
}
let saavedOtp;
let naame;
let email;
let moobile;
let paassword;
// console.log(generateOTP());

const sendOTP=async(req,res)=>{
   try {
    naame=req.body.name;
    email=req.body.email;
    moobile=req.body.mobile;
    paassword=req.body.password;
    let otp=generateOTP();
    saavedOtp=otp;
    console.log(otp);
    const findEmail=await User.findOne({email:req.body.email})
    if(!findEmail){
        
         const otpresult=sendOTPMail(email,otp);
         if(otpresult){
            res.render('otpverification')
         }else{
            res.render('userSignup',{message:'Entered email not exist. Please check your email '})
         }
    }else{
        res.render('userSignup',{
            message:'Entered email already exists'
        })
    }
   } catch (error) {
    res.status(500).send("Error sending OTP");
    console.log(error);
   }
}
const verifyOTP=async (req,res)=>{
    try {
        const otp=req.body.otp;
        console.log(otp+' req body');
        console.log(saavedOtp);
        if(otp==saavedOtp){
            console.log('otp verified');
            const password=await securePassword(paassword);
            const userData=new User({
                name:naame,
                email:email,
                mobile:moobile,
                password:password,
                blockStatus:false
            });
            const saveuser=userData.save();
            res.render('userSignup',{message:'Registration successfull'});
        }else{
            res.render('otpverification',{message:'Entered OTP is incorrect'})
        } 
    } catch (error) {
        console.log(error);
    }
}
const loadHome=async(req,res)=>{
    try {
        const product=await Product.find({});
        if(req.session.user){
            const user=req.session.userData;
            res.render('home',{user:user,Product:product})
        }else{
            res.render('home',{Product:product});
        }

    } catch (error) {
        console.log(error);
    }
};
let verifiedOtp;
let loginEmail;
const verifyLogin=async (req,res)=>{
    try {
        loginEmail=req.body.email;
        let otp=generateOTP()
        verifiedOtp=otp;
        console.log("",otp);
        const verifyEmail=await User.findOne({email:req.body.email});
        
        if(verifyEmail){
            if(verifyEmail.blockStatus===false){
                console.log('email verified');
                sendOTPMail(loginEmail,otp);  
                res.render('loginOTPverify')
            }else{
                res.render('userLogin',{message:'This user is blocked By Admin'})
            }
            
        }else{
            res.render('userLogin',{message:'Entered Email not exist '})
        }
    } catch (error) {
        console.log('verify login error '+error);
    }
}
const userVerify=async(req,res)=>{
    try {
        const loginData=await User.findOne({email:loginEmail})
        const enteredOTP=req.body.otp;
        console.log(enteredOTP,"hhhhhhhhh",verifiedOtp);
        if(verifiedOtp==enteredOTP){
            console.log('otp matched');
            req.session.userData=loginData
            req.session.user=true;
            res.redirect("/")
        }else{
            res.render('loginOTPVerify',{message:'invalid OTP'})
        }
    } catch (error) {
        console.log('otpverify error '+error);
    }
}
const loadShop=async (req,res)=>{
    try {
        const ProductData=await Product.find({});
        res.render('shop',{Product:ProductData});
    } catch (error) {
        console.log('this is loading shop page error'+error);
    }
}
const singleProductLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const singleProduct=await Product.findById({_id:id});
        res.render('single-product',{singleProduct:singleProduct});
    } catch (error) {
        console.log('single product loading error '+error);
    }
}
module.exports={
    loadLogin,
    loadSignUp,
    sendOTP,
    verifyOTP,
    verifyLogin,
    loadHome,
    userVerify,
    loadShop,
    singleProductLoad
}