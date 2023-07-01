const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
    },
    Balance:{
        type:Number,
        required:true,
    },
    Currency:{
        type:String,
        required:true
    }
 })
 const Wallet = mongoose.model('Wallet',walletSchema);
 module.exports = Wallet;