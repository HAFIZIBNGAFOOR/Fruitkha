const mongoose = require('mongoose')
const bannerSchema = new mongoose.Schema({
    bannerName:{
        type:String,
        required:true
    },
    imagePath: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      required: true
    },
    status:{
        type:String,
        default:'active'
    },
  });
    bannerSchema.pre('save', function (next) {
        const Banner = mongoose.model('Banner');
        Banner.countDocuments()
        .then(count => {
            if (count >= 3) {
            throw new Error('Maximum document limit reached');
            }
            next();
        })
        .catch(error => next(error));
    });
  
  const Banner = mongoose.model('Banner', bannerSchema);
  
  module.exports = Banner;