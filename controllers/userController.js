const nodemailer = require('nodemailer');
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const CartItem =require('../models/cart');
const randomstring = require("randomstring");
const config = require("../config/config");

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
          user: config.emailUser,
          pass: config.emailPassword
        }
      });
  
      const mailOptions = {
        from: config.emailUser,
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
        let discountAmount = subTotal-AllTotal;
        console.log(subTotal,AllTotal,discountAmount,'-------');
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
            user,
            discountAmount
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
              user: config.emailUser,
              pass: config.emailPassword ,
            },
          });
          const mailOptions = {
            from: config.emailUser,
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
 const userLoad=async(req,res)=>{
    try {
        const pageSize =  5;
        const currentPage = req.query.page || 1
        const searchQuery = req.query.search || ''
        const result=await User.paginate({},{page:currentPage,limit:pageSize})
        const userData = result.docs;
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
       res.render('userManage',{userData:userData,currentPage,endPage,startPage,totalPages,pageSize}) 
    } catch (error) {
        console.log('rendering userpage error '+error);
    }
}
 const blockUser=async(req,res)=>{
       const userData=req.body.id;
       console.log(userData);
       const userToBlock=await User.findOne({_id:req.body.id});
        await User.findByIdAndUpdate({_id:req.body.id},{$set:{blockStatus:true}})
        .then((response)=>{
            res.json(response);
            res.redirect('/admin/users')
        })
    //    res.redirect('/admin/users')
    .catch ((error)=>{
        console.log('blocking user error '+error);
    })
}

const unBlockUser= async (req,res)=>{
    try {
        const userData=req.body.id;
        const userToUnblock=await User.findOne({_id:userData});
        if(userToUnblock){
            await User.findByIdAndUpdate({_id:req.body.id},{$set:{blockStatus:false}});           
        }
        res.redirect('/admin/users')
    } catch (error) {
        console.log('unblocking user error '+error);
    }
}


module.exports={
    loadLogin,
    loadSignUp,
    sendOTP,
    verifyOTP,
    verifyLogin,
    verifyUser,

    loadCheckout,
    editCheckoutAddress,
    deleteCheckoutAddress,
    addCheckoutAddress,
    saveCheckoutAddress,

    loadProfile,
    AddProfile,

    loadAddress,
    addAddress,
    saveAddress,
    loadEditAddress,
    saveEditedAddress,
    deleteAddress,
   
    loadForgotPassword,
    forgotPassword,
    forgetVerify,
    resetPassword,

    userLoad,
    blockUser,
    unBlockUser,
}