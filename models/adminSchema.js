const mongoose=require('mongoose');

const adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const adminData=mongoose.model('Admin',adminSchema);
module.exports=adminData;