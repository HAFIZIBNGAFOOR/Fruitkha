const Banner = require('../models/bannerSchema');

const loadBanner = async (req,res)=>{
    try {
        const bannerData = await Banner.find({}).sort({Timestamp:-1});
        res.render('banner',{bannerData});
    } catch (error) {
        res.render('adminError')
        console.log('this is load banner error ',error);
    }
}
const addBanner = async (req,res)=>{
    try {
        res.render('addBanner');
    } catch (error) {
        res.render('adminError')
        console.log('this is add banner error ',error);
    }
}
const saveBanner = async (req,res)=>{
    try {
        const name = req.body.name;
        const caption = req.body.caption;
        const image = req.file;
        const bannerData = new Banner({
            bannerName:name,
            caption:caption,
            imagePath:image.filename
        });
        await bannerData.save();
        res.render('addBanner',{message:'added Banner successfully'})
    } catch (error) {
        res.render('adminError')
        console.log('thi sis save banner error ',error);
    }
}
const deleteBanner = async (req,res)=>{
    try {
        const id = req.body.id;
        await Banner.findByIdAndDelete({_id:id});
        res.redirect('/admin/banner');
    } catch (error) {
        res.render('adminError')
        console.log('this is delete banner error ',error);
    }
}
const bannerChangeStatus = async (req,res)=>{
    try {
        const id = req.body.id;
        const banner =await Banner.findById({_id:id});
        if(banner.status =='active'){
            await Banner.findByIdAndUpdate({_id:id},{$set:{status:'blocked'}})
        }else{
            await Banner.findByIdAndUpdate({_id:id},{$set:{status:'active'}});
        }
        res.redirect('/admin/banner')
    } catch (error) {
        res.render('adminError')
        console.log('tis is banner change status ',error);
    }
}
const getBanner = async(req,res)=>{
    try {
        const getBanner = await Banner.find({status:'active'}).limit(3);
        const path =getBanner.map(path=>path.imagePath)
        res.json(getBanner);
    } catch (error) {
        res.render('error')
        console.log('this is getbanner error ',error);
    }
}

module.exports={
    getBanner,
    loadBanner,
    addBanner,
    saveBanner,
    deleteBanner,
    bannerChangeStatus,
}