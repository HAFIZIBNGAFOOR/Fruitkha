const mongoose=require("mongoose")
const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        trim:true,
        uppercase:true
    },
    categoryImage:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
})
const Category=mongoose.model("Category",categorySchema);
module.exports=Category;