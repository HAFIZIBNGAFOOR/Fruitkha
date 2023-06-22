const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
    DiscountedPrice:{
        type:Number,
        default:0,
    },
    Description:{
        type:String,
    },
    Category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    timestampField: {
        type: Date,
        default: Date.now
      }
});
ProductData.plugin(mongoosePaginate);
const Product=mongoose.model("Product",ProductData);
module.exports=Product;