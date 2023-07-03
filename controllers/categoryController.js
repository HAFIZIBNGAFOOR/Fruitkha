const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');

const categoryLoad =async(req,res)=>{
    try {
        const categoryData=await Category.find({isDeleted:false}); 
        // console.log(categoryData.categoryImage);
        res.render('category',{categoryData:categoryData});
 
    } catch (error) {
        res.render('adminError')
        console.log(error);
    }
}
const addCategory=async(req,res)=>{
    try {
        res.render('addCategory');
    } catch (error) {
        res.render('adminError')
        console.log('rendering add category page error '+error);
    }
}
const categoryAdding=async (req,res)=>{
    try {
        const categoryName=req.body.categoryName;
        const discountPercent = req.body.discount ||0
        const image = req.file;
        console.log(image+"getting image in category");
        const CategoryData=await Category.findOne({categoryName:categoryName})
        if(categoryName!=="" && image ){
                const categorySave= new Category({
                    categoryName:categoryName,
                    categoryImage:image.filename,
                    discount:discountPercent
                });
            if(!CategoryData){
                await categorySave.save();
                if(discountPercent){
                    const categoryOffers = await Category.find({});
                    const products = await Product.find({}).populate('Category');
                    products.forEach(product => {
                        const matchingOffer = categoryOffers.find(offer => offer.name === product.Category.categoryName);
                        if (matchingOffer && !product.Offer) {
                            const offerPrice = product.Price - (product.Price * (matchingOffer.discount / 100));
                            product.CategoryOffer = discountPercent
                            product.DiscountedPrice = offerPrice; 
                        }
                    })
               }
               res.render('addCategory',{message:'Category added successfully'})
            }else{
                res.render('addCategory',{message: 'Entered category already exists'})
            }
        }else{
            res.render('addCategory',{message:'category adding failed'});
        }
           
          
    } catch (error) {
        res.render('adminError')
        console.log('Category adding  error '+error);
    }
}
const deleteCategory=async(req,res)=>{
   try {
    const Categorydata=req.body.id
    const categoryTodelete=await Category.findByIdAndUpdate({_id:Categorydata},{$set:{isDeleted:true}});
    const categoryList=await Category.find({isDeleted:false});
    res.render('category',{message1:'category delete success',categoryData:categoryList})
   } catch (error) {
    res.render('adminError')
    console.log('edit Category error '+error);
   }
}
const editCategory =async (req,res)=>{
    try {
        const ToeditData = await Category.findOne({_id:req.query.id})
        console.log(ToeditData+"this is category to edit");
        res.render('editCategory',{ToEdit:ToeditData})
    } catch (error) {
        res.render('adminError')
        console.log("edit category error "+error);
    }
}
const saveEditedCategory=async (req,res)=>{
    try {
        const categoryName=req.body.categoryName;
        const categoryImage =req.file;
        const discount = req.body.discount || 0;
        const id=req.query.id
        const ToeditData=Category.findOne({_id:id});
        console.log(discount,'  this is discount ');
        let EditingData=await Category.findOne({categoryName:categoryName,discount:discount});
      
        if(categoryName!=='' && categoryImage){
            if(!EditingData){
                await Category.findByIdAndUpdate(
                    { _id: id },
                    { $set: { categoryName, categoryImage: categoryImage.filename, discount:discount } }
                  );
                  
                  const categoryOffers = await Category.find({_id:id});
                  const products = await Product.find({}).populate('Category');
                  
                  for (const product of products) {
                    const matchingOffer = categoryOffers.find(offer => offer.categoryName === product.Category.categoryName);;
                    if (matchingOffer) {
                        if(matchingOffer.discount === 0){
                            product.CategoryOffer =0
                            product.DiscountedPrice = 0;    
                        }else{
                            const offerPrice = product.Price - (product.Price * (matchingOffer.discount / 100));
                            product.CategoryOffer = matchingOffer.discount
                            product.DiscountedPrice = offerPrice;
                        }
                      await product.save();
                    }
                  }
                  
                  const newProducts = await Product.find({});
                  res.redirect('/admin/category');
            }else{
                res.render('editcategory',{ToEdit:ToeditData,message:'Entered Category already exists'});
            }          
        }else{
            res.render('editcategory',{Toedit:ToeditData,message:'please fill all fields'})
        }
        
    } catch (error) {
        res.render('adminError')
        console.log('this is save edited category error '+error);
    }
}
module.exports={
    categoryLoad,
    addCategory,
    categoryAdding,
    deleteCategory,
    editCategory,
    saveEditedCategory,
}