const Coupon = require('../models/couponSchema');

const moment = require("moment");
const { name } = require('ejs');

const laodCoupon = async (req,res)=>{
    try {
         
        const coupons = await Coupon.find({}); 

        coupons.forEach(async coupon => {
            const expirationDate = new Date(coupon.date); 
            if (expirationDate < Date.now()) {
                await Coupon.updateOne({ _id: coupon._id }, { status: "expired" })
            }
        })
        const coupon =  await Coupon.find({}).sort({timestampField:-1})
        res.render('coupon',{coupon})
    } catch (error) {
      res.render('adminError')
        console.log('this is load coupon error ',error);
    }
}
const addCoupon = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
      res.render('adminError')
        console.log('this is add coupon error ',error);
    }
}
const saveAddCoupon = async (req,res)=>{
    try {
        const code = req.body.code;
        const date = req.body.expiry;
        const minCartAmount = parseInt( req.body.min);
        const maxRedeemableAmount = parseInt(req.body.max)
        const couponData = new Coupon({
            code:code,
            date:date,
            maxRedeemable:maxRedeemableAmount,
            minCartAmount:minCartAmount
        });
        console.log(code,date,minCartAmount,maxRedeemableAmount);
        await couponData.save();
        console.log('coupon saved');
        res.render('addCoupon',{message:' Added Coupon successfully'})
    } catch (error) {
      res.render('adminError')
        console.log('this is save add coupon ',error);
    }
}

let offerPrice;
const coupon = async (req, res, next) => {
  try {
    const codeId = req.body.code;
    const total = req.body.total;
    const couponData = await Coupon.findOne({ code: codeId }).lean();
    let couponId = couponData._id
    const userData = await Coupon.findOne({
      code: codeId,
      userId: req.session.userData._id,
    }).lean();
    if (couponData && couponData.status==='Active') {
      if (userData) {
        console.log(userData);
        res.json("fail");
      } else {
        if(total >= couponData.minCartAmount){
            const offerPrice = couponData.maxRedeemable;
            const gtotal = total- offerPrice
            const userupdate = await Coupon.updateOne(
                { code: codeId },
                { $push: { userId: req.session.userData._id } }
              );
              res.json({ offerPrice: offerPrice, gtotal: gtotal ,couponId:couponId});
        }else{
            res.json('minAmount')
        }      
      }
    } else {
      res.json("fail");
    }
  } catch (error) {
    res.render('error')
    console.log(error, ' this is coupon error ');
  }
};
module.exports={
    coupon,
    laodCoupon,
    addCoupon,
    saveAddCoupon,
}