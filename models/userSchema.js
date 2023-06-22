const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const mongoosePaginate = require('mongoose-paginate-v2');


const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    blockStatus: {
      type: Boolean,
    },
    gender: {
      type: String,
    },
    token: {
      type: String,
      default: "",
    },
    Address: [
      {
        name: { type: String, required: true },
        number: { type: String, required: true },
        house: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      }
    ],
});
userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);
module.exports=User;