const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const CouponSchema = mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    percentage:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'Active'
    },
    userId:[{
        type:ObjectId,
    }],
    timestampField: {
        type: Date,
        default: Date.now
      }
})
const Coupon = mongoose.model('Coupon',CouponSchema);
module.exports=Coupon;