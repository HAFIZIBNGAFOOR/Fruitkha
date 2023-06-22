const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/userSchema');
const { log } = require('console');
const bcrypt = require('bcrypt');
const Product = require('../models/productSchema');
const mongoosePaginate = require('mongoose-paginate-v2');
const Category = require('../models/categorySchema');
const CartItem =require('../models/cart');
const Order = require('../models/orderSchema');
const Coupon = require('../models/couponSchema');
const randomstring = require("randomstring");

const moment = require("moment");
const { name } = require('ejs');

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
                fname:user.name,
                email:user.email,
                mobile:user.mobile,
                password:password,
                blockStatus:false
            });
            userData.save();
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
        const categoryList = await Category.find({isDeleted:false});
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
        if(req.session.user){
            const user = req.session.userData;
            res.render('single-product',{
                singleProduct:singleProduct,
                AllProducts:OtherProducts,
                user
            });
        }else{
            res.render('single-product',{
                singleProduct:singleProduct,
                AllProducts:OtherProducts
            });
        }
       
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
        const ProductPrice = Product1.DiscountedPrice ? Product1.DiscountedPrice : Product1.Price;
        console.log(ProductPrice);
        if(!userId ){
            res.json(false)
        }else{
            const Cart = new CartItem({
                ProductId:productId,
                UserId:userId,
                Total:1 * ProductPrice,
                subTotal:1 * Product1.Price
            });
            if(!item){
                await Cart.save();
                res.json(true);
            }else{
                res.json(true);
            }          
        }        
    } catch (error) {
        console.log(' add to cart erorr  ',error);
    }
}

const loadCart = async(req,res)=>{
    try {
        console.log(req.query.id ,' user idddd');
        const user=req.query.id;
        const cartItems =await CartItem.find({UserId:user}).populate('ProductId');
        let Total = 0;
        let subTotal = 0;
        cartItems.forEach(element=>{
            const price = element.ProductId.DiscountedPrice ? element.ProductId.DiscountedPrice : element.ProductId.Price;
            const ogPrice =element.ProductId.Price;
            const quantity = element.Quantity;
            const productTotal = price * quantity;
            const sTotal = ogPrice * quantity
            subTotal += sTotal
            Total+=productTotal; 
        })
        console.log(Total ,subTotal);
        res.render('cart',{
            user,
            cartItems,
            Total,
            subTotal
        });
    } catch (error) {
        console.log('this is laod cart error ',error);
    }
}
const deleteCart = async (req,res)=>{
    try {
        await CartItem.findOneAndDelete({UserId:req.body.id,ProductId:req.body.productId});
        const cartItems = await CartItem.find({UserId:req.body.id}).populate('ProductId');
        let allTotal =0;
        cartItems.forEach(item=>{
            allTotal += item.Total
        })
        res.json({cartItems,allTotal});
    } catch (error) {
        console.log('this is delete cart error ',error);
    }
}
const updateCart = async(req,res)=>{
    try {
        const user = req.body.userId;
        const productId =req.body.productId;
        const quantity  = req.body.quantity
        const Item = await CartItem.findOne({UserId:user,ProductId:productId});
        const Product1 = await Product.findOne({_id:productId});

        const Quantity= quantity;
        const Total =Product1.DiscountedPrice ? Product1.DiscountedPrice : Product1.Price*quantity;
        await CartItem.updateOne({_id:Item._id},{$set:{Quantity:Quantity,Total:Total,subTotal:Product1.Price}});
        const newItem = await CartItem.find({UserId:user});
        if(newItem){
            res.json(newItem); 
        }else{
            res.json('emptyCart')
        }             
    } catch (error) {
        console.log('update cart error ',error);
    }
}
const loadCheckout = async(req,res)=>{
    try {
        const userId = req.query.id;
        const cartItems =await CartItem.find({UserId:userId}).populate('ProductId');
        console.log(cartItems);
        let AllTotal = 0
        let subTotal = 0
        cartItems.forEach((item)=>{
            AllTotal +=item.Total;
            subTotal += item.subTotal;
        }) 
        let user;
        if(req.session.userData){
            user = req.session.userData
        }
        const userdata = await User.findById(user).populate('Address');
        const Addresses = userdata.Address || [];
        console.log(Addresses.length,' thi sis addresssss');
        res.render('checkout',{
            cartItems: cartItems,
            userdata: userdata,
            AllTotal,
            subTotal,
            Addresses: Addresses,
            user
        });        
    } catch (error) {
        console.log('load checkout error',error);
    }
}
const editCheckoutAddress = async(req,res)=>{
    try {
        const addressId = req.query.id
        const user = await User.findOne(
            { _id: req.session.userData._id },
            { Address: { $elemMatch: { _id: addressId } } }
          );
         console.log(user.Address[0]);
        res.render('editCheckoutAddress',{
            address:user.Address[0],
            user
        });
    } catch (error) {
        console.log('this is edit checkout error ',error);
    }
}
const deleteCheckoutAddress= async (req,res)=>{
    try {
        const id =req.body.addressId;
        const user = req.session.userData;
        const deleteUserData = await User.findByIdAndUpdate({_id:user._id},
            {$pull:{Address:{_id:id}}},
            {new:true}
        );
        console.log(deleteUserData);
        res.json({
            res:'success'
        })
    } catch (error) {
        console.log(' this is delete checkoust address ',error);
    }
}
const addCheckoutAddress = async (req,res)=>{
    try {
        let user = req.session.userData._id
        res.render('addnewAddressCheckout',{user})
    } catch (error) {
        console.log('this is add checkout adddress error '+error);
    }
}
const saveCheckoutAddress= async(req,res)=>{
    try {
        const user = req.session.userData._id;
        const address = req.body;
        console.log(address);
        const addressExists = await User.findOne({_id:req.session.userData._id},{
            Address:{
                $elemMatch:{
                    house:address.house,
                    pincode:address.pincode
                }
            }
        })
        if(addressExists.Address.length > 0){
            console.log('this address is already exists',addressExists)
            res.render('addnewAddressCheckout',{user,message:'This address already exists'})
        }else{
            const userData = await User.findByIdAndUpdate(
                {_id:user},
                {$addToSet:{Address:req.body}}
            );
            console.log(userData);
            // userData.Address.push(req.body);
            const savedAddress = await User.findById(user);
            console.log(savedAddress.Address[0],' length ===',savedAddress.Address.length);
            res.redirect('/Checkout')
        }
    } catch (error) {
        console.log('this is save checkout error ', error);
    }
}
let offerPrice;
const coupon = async (req, res, next) => {
  try {
    const codeId = req.body.code;
    const total = req.body.total;
    console.log(req.body, ' this is req.body');
    const couponData = await Coupon.findOne({ code: codeId }).lean();
    console.log(couponData);
    const userData = await Coupon.findOne({
      code: codeId,
      userId: req.session.userData._id,
    }).lean();
    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      offerPrice = couponData.percentage;
      console.log("0000000000000000000");

      if (userData) {
        res.json("fail");
        console.log('failed ',userData);
      } else {

        const amount = (total * offerPrice) / 100;
        const gtotal = total - amount;
        const userupdate = await Coupon.updateOne(
            { code: codeId },
            { $push: { userId: req.session.userData._id } }
          );
          console.log('success json sent ',gtotal,offerPrice);
        res.json({ offerPrice: offerPrice, gtotal: gtotal });
       
      }
    } else {
        console.log('failed here');
      res.json("fail");
    }
  } catch (error) {
    next(error);
  }
};
const loadProfile = async (req,res)=>{
    try {
        const user = await User.findById({_id:req.session.userData._id});
        console.log(user);
        res.render('profile',{
            user,
        });
    } catch (error) {
        console.log('load profile error ',error);
    }
} 
const AddProfile= async (req,res)=>{
    try {
        const fname = req.body.fname;
        const lname = req.body.lname;
        const gender = req.body.gender;
        const mobile = req.body.mobile;
        const email = req.body.email;        
        await User.updateOne({email:email},{$set:{
            fname:fname,
            lname:lname,
            gender:gender,
            mobile:mobile
        }})        
        const user = await User.findOne({email:email});
        console.log(user);
        res.render('profile',{
            user
        })
    } catch (error) {
        console.log('this is add profile error ', error);
    }
}
const loadAddress = async (req,res)=>{
    try {
        let user;
        if(req.session.userData){
            user=req.session.userData
        }
        const userData  = await User.findOne({email:user.email});
        const Addresses = userData.Address;
        res.render('address' ,{userData,Addresses,user});
    } catch (error) {
        console.log('this is add address ',error);
    }
}
const addAddress = async (req,res)=>{
    try {
        const userId = req.query.id;

        const user =await User.findById(userId)
        console.log(user);
        res.render('addAddress',{user});

    } catch (error) {
        console.log('this is addaddress error ',error);
    }
}
const saveAddress = async (req,res)=>{
    try {
        const user = req.session.userData._id
        const name = req.body.name;
        const house = req.body.house
        const pincode = req.body.pincode
        const number = req.body.number
        const city = req.body.city
        const state = req.body.state
        console.log(user,'  this is saave address');
        const addressExists = await User.findOne({_id:req.session.userData._id},{
            Address:{
                $elemMatch:{
                    house:house,
                    pincode:pincode
                }
            }
        })
       console.log(addressExists.Address.length,' user entered address already exists ');
       if(addressExists.Address.length!==0){
        const userData = await User.find({_id:req.session.userData._id});
        const Addresses = userData.Address
        res.render('addAddress',{user,message:'Entered Address already exists',})
       }else{
        const address = {
            name:name,
            house:house,
            pincode:pincode,
            number:number,
            city:city,
            state:state,    
        }  
        const userData = await User.findById(user);
        userData.Address.push(address);
        await userData.save();
        const updatedUser =await User.findById(user)
        const Addresses = updatedUser.Address;
        res.render('address', {userData,Addresses,user})
        }
    } catch (error) {
        console.log('save address error ',error);
    }
}
const loadEditAddress =async (req,res)=>{
    try {    
        const id = req.query.id;
        const userAddress = await User.findOne(
            { Address: { $elemMatch: { _id: id } } },
            { "Address.$": 1, _id: 0 }
          );
        const user = req.session.userData
        const address = userAddress.Address[0];
        console.log(address ,' this is address load edit');
        res.render('editAddress', {user,address})
    } catch (error) {
        console.log('This is load edit addreess error ',error);
    }
}
const saveEditedAddress = async (req,res)=>{
    try {
        const user = req.session.userData;
        const name = req.body.name;
        const house = req.body.house
        const pincode = req.body.pincode
        const number = req.body.number
        const city = req.body.city
        const state = req.body.state
        const id = req.body.id;
        console.log(id);
        const savedAddress = await User.updateOne(
            {Address:{$elemMatch:{_id:id}}},
            {$set:{
                'Address.$.name':name,
                'Address.$.house':house,
                'Address.$.pincode':pincode,
                'Address.$.number':number,
                'Address.$.city':city,
                'Address.$.state':state,               
            }},
            {new:true}
        );
        console.log(savedAddress,' this is user address');
        res.redirect('/address')
    } catch (error) {
        console.log('this is the save edited address errror',error);
    }
}
    const deleteAddress = async(req,res)=>{
        try {
            const id =req.body.addressId;
            const user = req.session.userData;
            const deleteUserData = await User.findByIdAndUpdate({_id:req.session.userData._id},
                {$pull:{Address:{_id:id}}},
                {new:true}
            );
            const userData = await User.findById(user._id)
            const Addresses = userData.Address
            console.log(userData.Address,' this is delete address');
                res.render('address',{userData,Addresses,user})
        } catch (error) {
            console.log('this is delete address here',error);
        }
    }
    const sendResetPasswordMail = async (name, email, token) => {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'hafizahmed0303@gmail.com',
              pass: 'gybktcpfuxveinfv' ,
            },
          });
          const mailOptions = {
            from: 'hafizahmed0303@gmail.com',
            to: email,
            subject: "For reset Password",
            html:
              "<p>Hii " +
              name +
              ' , please click here to <a href="http://localhost:3000/forget-password?token=' +
              token +
              '">Reset</a> your password</p>',
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              res.render("error");
            } else {
              console.log("Email has been sent :-", info.response);
            }
          });
        } catch (error) {
          res.render("error");
        }
      };
 const loadForgotPassword =async (req,res)=>{
    try {
        const user = req.session.userData;
        res.render('resetPassword',{user})
    } catch (error) {
        console.log('this is load forgott password error ',error);
    }
 }
 const forgotPassword = async (req,res)=>{
    try {
        const user = req.session.userData;
        const email = req.body.email;
        const userData = await User.find({email:email})
        if(userData){
            const randomString = randomstring.generate()        
        console.log(randomString,userData);
        const updatedUser = await User.updateOne(
            {email:email},
            {$set:{token:randomString}}
            )
        const result = await sendResetPasswordMail(userData[0].fname,email,randomString);
        console.log(result,' this is sent otp mail');
        
            res.render('resetPassword',{successmessage:'Please check your mail to Reset your password.',user})
        }else{
            res.render('resetPassword',{message:"Entered Email doesn't exists",user});
        }
    } catch (error) {
        console.log('this is forgot password error ',error);
    }
 }
 const forgetVerify = async (req,res)=>{
    try {
        const token = req.query.token
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('addPassword',{user_id : tokenData._id})
        }else{
            console.log(false);
        }
    } catch (error) {
        console.log('this is password otp verify error ', error);
    }
 }
 const resetPassword =async(req,res)=>{
    try {
        const user_id = req.body.id
        console.log(req.body,'this is body ');
        const password = req.body.password;
        const securedPass =await  securePassword(password);
        const passUpdated = await User.findByIdAndUpdate(
            {_id:user_id},
            {$set:{password:securedPass,token:''}}
        )
        res.render('addPassword',{message:'Password changed successfully',user_id})
    } catch (error) {
        console.log('this is reset password errr ',error);
    }
 }
let couponCode;
let couponamount;
 const placeOrder = async (req,res)=>{
    try {
        const {
            address,
            payment,
            subtotal,
            allTotal
        } = req.body;
        console.log('this is form data ,' ,req.body,address,payment,allTotal,subtotal);
        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;
        const now = moment();
        const date = now.toDate();
        const cart = await CartItem.find({UserId:req.session.userData._id}).populate('ProductId');
        // const user = await User.findById({_id:req.session.userData._id});
        const paymentMethod = payment[0]==='1' ? 'Cash On Delivery' :'RazorPay';
        
        // const usernew= await User.find({_id:req.session.userData._id})
        const newOrder = new Order({
            orderId:orderId,
            userId:req.session.userData._id,
            date:date,
            total:allTotal,
            subtotal:subtotal,
            payment_method:paymentMethod,
            addressId:address
        })
        newOrder.product=cart.map((item)=>({
            id : item._id,
            name : item.ProductId.ProductName,
            price :item.ProductId.DiscountedPrice ? item.ProductId.DiscountedPrice : item.ProductId.Price,
            quantity : item.Quantity
        }))
        await newOrder.save();

        await CartItem.deleteMany({UserId:req.session.userData._id})
        res.json('success')
        
    } catch (error) {
        res.json('error')
        console.log('this is place order error '+error);
    }
 }
 const orderSuccess = async (req,res)=>{
    try {
        const user = req.session.userData;
        const Orders = await Order.find({ userId:req.session.userData._id }) 
        .sort({ date: -1 }) 
        .limit(1)
        let latestOrder;
        if(Orders.length >0){
           latestOrder = Orders[0];
        }
        console.log(' this is orders   sss');
        res.render('orderSuccess',{latestOrder,user});
    } catch (error) {
        console.log('order success page error',error);
    }
 }

 const loadOrders= async (req,res)=>{
    try {
        const Orders = await Order.find({userId:req.session.userData._id}).sort({date:-1});
        console.log(Orders);
        const user = req.session.userData
        res.render('orders',{Orders,user});
    } catch (error) {
        console.log('this is view orders error');
    }
 }
const viewOrders = async (req,res)=>{
    try {
        const orderId = req.query.id;
        const order = await Order.findById(orderId);
        const user = req.session.userData
        console.log(order);
        res.render('viewOrders',{order,user})
    } catch (error) {
        console.log('this is view orders error ',error);
    }
}
const deleteOrder = async (req,res)=>{
    try {
        const orderId = req.query.id;
        const user = req.session.userData._id;
        const oldOrder =await Order.findByIdAndUpdate({_id:orderId},{$set:{status:'cancelled'}});
        const Orders = await Order.find({userId:user});
        console.log(Orders);
        res.render('orders',{Orders,user});
    } catch (error) {
        console.log('delete order error ',error);
    }
}
const trackOrder=async (req,res)=>{
    try {
        const user = req.session.userData;
        const order = await Order.findById({_id:req.query.id});
        const currentDate = new Date();
        const halfHourBefore = new Date(currentDate.getTime() - 30 * 60 * 1000);
        const hours = halfHourBefore.getHours();
        const minutes = halfHourBefore.getMinutes();
        const now = (hours + ':' + minutes)
        const orderDate = order.date; // Assuming `order.date` is a valid `Date` object

        const fiveDaysAfterOrder = new Date(orderDate.getTime());
        fiveDaysAfterOrder.setDate(orderDate.getDate() + 5);
        console.log(order,'this is order',now);
        res.render('trackOrder',{order,now,fiveDaysAfterOrder,user})
    } catch (error) {
        console.log('this is track order errror');
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
    loadShop,
    singleProductLoad,
    addToCart,
    loadCart,
    deleteCart,
    loadCheckout,
    editCheckoutAddress,
    deleteCheckoutAddress,
    addCheckoutAddress,
    saveCheckoutAddress,
    updateCart,
    loadProfile,
    AddProfile,
    loadAddress,
    addAddress,
    saveAddress,
    loadEditAddress,
    saveEditedAddress,
    deleteAddress,
    placeOrder,
    orderSuccess,
    viewOrders,
    loadOrders,
    deleteOrder,
    trackOrder,
    loadForgotPassword,
    forgotPassword,
    forgetVerify,
    resetPassword,
    coupon
}