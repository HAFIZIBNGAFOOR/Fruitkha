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
    Description:{
        type:String,
    },
    Category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    }
});
ProductData.plugin(mongoosePaginate);
const Product=mongoose.model("Product",ProductData);
module.exports=Product;