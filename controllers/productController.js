const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');

const loadHome=async(req,res)=>{
    try {
        const product=await Product.find({}).limit(6);
        if(req.session.user){
            const user=req.session.userData;
            res.render('home',{user:user,Product:product})
        }else{
            res.render('home',{Product:product});
        }

    } catch (error) {
        res.render('error')
        console.log(error);
    }
};
const productLoad = async (req, res) => {
    try {
      const pageSize = 5;
      const currentPage = req.query.page || 1;
      const result = await Product.paginate({}, { page: currentPage, limit: pageSize });
      const allProduct = result.docs;
      const totalPages = result.totalPages;
      const maxVisiblePages = 3;
      let startPage = 1;
      let endPage = totalPages;
  
      if (totalPages > maxVisiblePages) {
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
  
        if (currentPage <= halfVisiblePages) {
          endPage = maxVisiblePages;
        } else if (currentPage + halfVisiblePages >= totalPages) {
          startPage = totalPages - maxVisiblePages + 1;
        } else {
          startPage = currentPage - halfVisiblePages;
          endPage = currentPage + halfVisiblePages;
        }
      }
  
      const populatedProducts = await Product.find({ _id: { $in: allProduct.map(product => product._id) } })
        .populate('Category').sort({timestampField:-1})
        .exec();
        res.render('product', {
        Product: populatedProducts,
        currentPage: currentPage,
        startPage: startPage,
        endPage: endPage,
        totalPages: totalPages,
        pageSize: pageSize
      });
    } catch (error) {
        res.render('adminError')
      console.log('product loading error ' + error);
    }
  };
  
const addProduct = async (req,res)=>{
    try {
        const Categories=await Category.find({});
        res.render("addProduct",{Categories:Categories});
    } catch (error) {
        res.render('adminError')
        console.log('this is add product error '+ error);
    }
}
const SaveAddProduct = async (req,res)=>{
    try {
        const Categories=await Category.find({});
        const images=req.files.map((file)=>{
            return file.filename
        })
        const ProductName=req.body.ProductName
        if(
            req.body.ProductName!=""&&
            req.body.Category!=""&&
            req.body.Price > 1 &&
            req.body.Quantity > 0 &&
            images
        ){
        const ProductData=await Product.findOne({ProductName:ProductName});
        if(!ProductData){
            const ProductToSave= new Product({
                ProductName:req.body.ProductName,
                Price:req.body.Price,
                Quantity:req.body.Quantity,
                Category:req.body.Category,
                ProductImage:images,
                Description:req.body.Description
            })
           await ProductToSave.save();
           res.render('addProduct',{message:'Added New Product Successfully',errormessage:'',Categories:Categories})
        }else{
            res.render('addProduct',{message:'',errormessage:'Product already exists',Categories:Categories})
        }
        }else{
            res.render('addproduct',{message:'', errormessage:'Please fill all the fields',Categories:Categories})
        }
    } catch (error) {   
        res.render('adminError') 
        console.log('saving add product error '+error);
    }
}
const editProduct = async (req,res)=>{
    try {
        console.log('its inside the edit prod');
        const id=req.query.id;
        const CategoryData=await Category.find({});
        const ProductData = await Product.findById({_id:id})
        const Images =  ProductData.ProductImage
        res.render('editProduct',{ProductData:ProductData,Category:CategoryData,Images});
    } catch (error) {
        res.render('adminError')
        console.log('edit product error '+error);
    }
}

const saveEditedProduct=async(req,res)=>{
    try {
    const id=req.query.id;
    const productName= req.body.ProductName
    const category= req.body.Category
    const quantity = req.body.Quantity
    const price= req.body.Price
    const desc= req.body.Description;
    const uploadedFiles = req.files;
    const existingImages = req.body.existingImages || [];
    const allFiles = existingImages.concat(uploadedFiles);
    const imageFilenames = allFiles.map(file => {
        if (typeof file === 'string') {
          return file;
        } else {
          return file.filename;
        }
      }).filter(filename => filename.trim() !== '');
    const productData = await Product.findById({_id:id})
    const categoryData=await Category.find({});
    const Images = productData.ProductImage
    if(productName!='' && category!='' && quantity > 0 && price > 0 && allFiles){
         await Product.findByIdAndUpdate({_id:id},
            {$set:{
                ProductName:productName,
                ProductImage:imageFilenames,
                Price:price,
                Quantity:quantity,
                Description:desc,
                Category:category
        }})
        res.redirect('/admin/product')
    }else{
        res.render('editProduct',{message:'enter a valid details', ProductData:productData,Category:categoryData,Images})
    }    
    } catch (error) {
        res.render('adminError')
        console.log('this is submitting error of edit '+error);
    }
}

const deleteProduct=async (req,res)=>{
    try {
        const id=req.body.id;
        await Product.findByIdAndDelete({_id:id});
        const remainingProduct= await Product.find({});
        res.render('product',{Product:remainingProduct,message:'deleted successfully'})
    } catch (error) {
        res.render('adminError')
        console.log('deleting Product  error '+error);
    }
}
const loadShop=async (req,res)=>{
    try {

        const  currentPage = req.query.page || 1;
        const pageSize = req.query.size || 6;
        const category = req.query.category;
        const categoryList = await Category.find({isDeleted:false});
        let query={}
        if(category && category!=='All'){
            query = {Category:category}
        }
        const user = req.session.userData;
        await Product.paginate(query,{page:currentPage,limit:pageSize},function(err,result){
            if(err){
                res.render('error')
                console.log('pagination error '+err);
            }else{
                const Product = result.docs;
                const totalPages = result.totalPages;
                const maxVisiblePages = 3;
                let startPage = 1;
                let endPage = totalPages;

                if (totalPages > maxVisiblePages) {
                    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

                    if (currentPage <= halfVisiblePages) {
                        endPage = maxVisiblePages;
                    } else if (currentPage + halfVisiblePages >= totalPages) {
                        startPage = totalPages - maxVisiblePages + 1;
                    } else {
                        startPage = currentPage - halfVisiblePages;
                        endPage = currentPage + halfVisiblePages;
                    }
                }
                res.render('shop', {
                    currentPage,
                    totalPages,
                    startPage,
                    endPage,
                    Product,
                    categoryList,
                    user,
                });
            
            }
        })
    } catch (error) {
        res.render('error')
    }
}
const singleProductLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const singleProduct=await Product.findById({_id:id}).populate('Category');
        const OtherProducts =await Product.find({_id:{$ne:id}}).limit(6);
        if(req.session.user){
            const user = req.session.userData;
            res.render('single-product',{
                singleProduct:singleProduct,
                AllProducts:OtherProducts,
                user
            });
        }else{
            res.render('single-product',{
                singleProduct:singleProduct,
                AllProducts:OtherProducts,

            });
        }
    } catch (error) {
        res.render('error')

    }
}
const loadOffer = async (req,res)=>{
    try {
        const offer = await Product.find({
            $or: [
              { Offer: { $gt: 0 } },
              { CategoryOffer: { $gt: 0 } }
            ]
          });
        res.render('offer',{offer})
    } catch (error) {
        res.render('adminError')
        console.log(' trhis is load offer error ',error);
        // res.render('error')
    }
}
const addOffer = async (req,res)=>{
    try {
        const Products =await Product.find({})
        res.render('addOffer',{Products})
    } catch (error) {
        res.render('adminError')
        console.log('this is addOffer error ',error);
    }
}
const saveProductOffer = async (req,res)=>{
    try {
        const product =  await Product.findById(req.body.Product);
        const offer = parseInt(req.body.offer);
        const offerPrice = (offer/100)* product.Price
        console.log(offerPrice,product.Price,' this is offer price');
           if(!product.Offer && !product.CategoryOffer){
                product.Offer = offer
                product.DiscountedPrice = product.Price - offerPrice         
                await product.save()
                const savedProduct = await Product.findById(req.body.Product)
                console.log(savedProduct,' this is saved product');
                const Products = await Product.find({});
                res.render('addOffer',{Products, success:'Offer added successfully'});
           }else if(product.Offer){
                const Products = await Product.find({});
                console.log('else if worked');
                res.render('addOffer',{Products,message:'Offer already available for this Product'});
           }else{
                const Products = await Product.find({});
                console.log('else worked');
                res.render('addoffer',{Products,message:'Category offer is available for selected product'});
           }       
    } catch (error) {
        res.render('adminError')
        console.log('this is save product offer error ',error);
    }
}

module.exports={
    loadHome,
    loadShop,
    singleProductLoad,
    productLoad,
    addProduct,
    SaveAddProduct,
    editProduct,
    saveEditedProduct,
    deleteProduct,
    loadOffer,
    addOffer,
    saveProductOffer
}