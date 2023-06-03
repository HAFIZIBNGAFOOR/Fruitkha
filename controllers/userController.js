const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userSchema');
const { log } = require('console');
const bcrypt = require('bcrypt');
const Product = require('../models/productSchema');
const mongoosePaginate = require('mongoose-paginate-v2');
const Category = require('../models/categorySchema');
const CartItem =require('../models/cart');

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
// const sendOTPMail=(email,otpCode)=>{
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//               user: 'hafizahmed0303@gmail.com',
//               pass: 'gybktcpfuxveinfv'
//             }
//           });
          
//           const mailOptions = {
//               from: 'hafizahmed0303@gmail.com',
//               to: email,
//               subject: 'OTP for Registration',
//               text: `Your OTP for registration is: ${otpCode}`
//             };
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                   console.log('Error sending email:', error);
//                   return false
//                 } else {
//                   console.log('Email sent:', info.response);
//                   return true;
//                 }
//             })     
//     } catch (error) {
//         console.log('sending otp failed send otp mail'+error);
//         return false;
//     }
// }
const sendOTPMail = (email, otpCode) => {
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
  
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
            resolve(false);
          } else {
            console.log('Email sent:', info.response);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log('Sending OTP failed:', error);
      return Promise.resolve(false);
    }
  };
  

// console.log(generateOTP());
const sendOTP=async(req,res)=>{
   try {
    req.session.signupData=req.body
    let userData = req.body
    const email=req.body.email
    let otp=generateOTP();
    req.session.OTP=otp;
    const findEmail=await User.findOne({email:req.body.email})
    if(!findEmail){
         const otpresult=await sendOTPMail(email,otp);
         if(otpresult){
            res.render('otpverification')
         }else{
            res.render('userSignup',{ 
                errorMessage:'Entered email not exist. Please check your email ',
                 userData
            })
         }
    }else{
        res.render('userSignup',{
            errorMessage:` Entered Email already exists try with another Email`,
            userData
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
        const user=req.session.signupData
        if(otp==req.session.OTP){
            const password=await securePassword(user.password);
            const userData=new User({
                name:user.name,
                email:user.email,
                mobile:user.mobile,
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
            console.log(user);
            res.render('home',{user:user,Product:product})
        }else{
            res.render('home',{Product:product});
        }

    } catch (error) {
        console.log(error);
    }
};

let loginEmail;
const verifyLogin=async (req,res)=>{
    try {
        loginEmail=req.body.email;
        let otp=generateOTP()
        req.session.otp=otp;
        const verifyEmail=await User.findOne({email:req.body.email});
        if(verifyEmail){
            if(verifyEmail.blockStatus===false){
                const message=true
                sendOTPMail(loginEmail,otp);  
                res.json('mailSuccess')
            }else{
                res.json('userBlocked')
            }       
        }else{
            res.json(false)
        }
    } catch (error) {
        console.log('verify login error '+error);
    }
}
const verifyUser=async(req,res)=>{
    try {
        const otp=req.body.otp;
        const userData=await User.findOne({email:req.body.email})
        if(otp){
            console.log(otp);
            if(otp==req.session.otp){
                console.log('otp matched');
                req.session.userData=userData
                req.session.user=true;
                res.redirect('/')
            }else{
                res.render('userLogin',{message:'invalid OTP'})
            }
        }else{
            const password=req.body.password;
            const email=req.body.email;
            const UserHave=await User.findOne({email:email})
            const matchedPass= await bcrypt.compare(password,userData.password);
            if(UserHave){
                if(matchedPass){
                    req.session.userData=userData;
                    req.session.user=true;
                    res.redirect('/');
                }else{
                    res.render('userLogin',{
                        message:'Entered password is incorrect'
                    })
                }
            }else{
                res.render('userLogin',{
                    message:'Entered Email not exists'
                })
            }
        }
    } catch (error) {
        console.log('this is verify user error '+error);
    }
}

const loadShop=async (req,res)=>{
    try {

        const  currentPage = req.query.page || 1;
        const pageSize = req.query.size || 6;
        const category = req.query.category;
        const categoryList = await Category.find({});
        let query={}
        if(category && category!=='All'){
            query = {Category:category}
        }
        const user = req.session.userData;
        await Product.paginate(query,{page:currentPage,limit:pageSize},function(err,result){
            if(err){
                console.log('pagination error '+err);
            }else{
                const Product = result.docs;
                const totalPages = result.totalPages;
                const maxVisiblePages = 3;
                let startPage = 1;
                let endPage = totalPages;

                if (totalPages > maxVisiblePages) {
                    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

                    if (currentPage <= halfVisiblePages) {
                        endPage = maxVisiblePages;
                    } else if (currentPage + halfVisiblePages >= totalPages) {
                        startPage = totalPages - maxVisiblePages + 1;
                    } else {
                        startPage = currentPage - halfVisiblePages;
                        endPage = currentPage + halfVisiblePages;
                    }
                }
                res.render('shop', {
                    currentPage,
                    totalPages,
                    startPage,
                    endPage,
                    Product,
                    categoryList,
                    user
                });
            
            }
        })
    } catch (error) {
        console.log('this is loading shop page error'+error);
    }
}
const singleProductLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const singleProduct=await Product.findById({_id:id}).populate('Category');
        const OtherProducts =await Product.find({_id:{$ne:id}}).limit(6);
        res.render('single-product',{
            singleProduct:singleProduct,
            AllProducts:OtherProducts
        });
    } catch (error) {
        console.log('single product loading error '+error);
    }
}
const addToCart = async (req,res)=>{
    try {
        const productId = req.body.id;
        const userId = req.body.user;
        const item =await CartItem.findOne({UserId:userId,ProductId:productId});
        const Product1 = await Product.findById({_id:productId});
        const ProductPrice =Product1.Price;
        if(!userId ){
            res.json(false)
        }else{
            const Cart = new CartItem({
                ProductId:productId,
                UserId:userId,
                Total:1*ProductPrice
            });
            if(!item){
                await Cart.save();
                res.json(true);
            }else{
                res.json(true);
            }
           
        }
        //const item = await Product.findById({_id:id});
        
    } catch (error) {
        console.log(' add to cart erorr  ',error);
    }
}
const loadCart = async(req,res)=>{
    try {
        console.log(req.query.id ,' user idddd');
        const user=req.query.id;
        const cartItems =await CartItem.find({UserId:user}).populate('ProductId');
        let Total = 0 
        cartItems.forEach(element=>{
            const price = element.ProductId.Price;
            const quantity = element.Quantity;
            const productTotal = price * quantity;
            Total+=productTotal; 
        })
        console.log(Total);
        res.render('cart',{
            user,
            cartItems,
            Total
        });
    } catch (error) {
        console.log('this is laod cart error ',error);
    }
}
const deleteCart = async (req,res)=>{
    try {
        const result =await CartItem.findOneAndDelete({UserId:req.body.id,ProductId:req.body.productId});
        const cartItems = await CartItem.find({UserId:req.body.id}).populate('ProductId');
        res.json(cartItems);
        console.log('cart items send success ',cartItems);
    } catch (error) {
        console.log('this is delete cart error ',error);
    }
}
module.exports={
    loadLogin,
    loadSignUp,
    sendOTP,
    verifyOTP,
    verifyLogin,
    loadHome,
    verifyUser,
    //userVerify,
    loadShop,
    singleProductLoad,
    addToCart,
    loadCart,
    deleteCart
}