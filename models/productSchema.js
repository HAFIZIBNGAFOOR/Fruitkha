const mongoose=require('mongoose');
//const { array } = require('../helpers/multer');
const ProductData=new mongoose.Schema({
    ProductName:{
        type:String,
        required:true,
    },
    ProductImage:{
        type:Array,
        required:true
    },
    Quantity:{
        type:Number,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    Description:{
        type:String,
    },
    Category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    }
});
const Product=mongoose.model("Product",ProductData);
module.exports=Product;