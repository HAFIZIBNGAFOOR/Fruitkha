const mongoose =require('mongoose');
const Cart = mongoose.Schema({
    ProductId: {
       type : mongoose.Schema.Types.ObjectId,
       ref : 'Product',
       required : true
    },
    Quantity:{
        type: Number,
        required : true,
        default : 1
    },
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    Total:{
        type:Number,
        required: true
    },
    subTotal:{
        type:Number,
        required:true,
    }
})
const CartItem = mongoose.model('CartItem',Cart);
module.exports =CartItem;
