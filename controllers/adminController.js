const { Admin } = require('mongodb');
//const AdminSave=require('../models/adminSchema');
const bcrypt=require('bcrypt');
const path=require('path')
const adminData = require('../models/adminSchema');
const User=require('../models/userSchema');
const Category=require('../models/categorySchema');
const { log } = require('console');
const Product = require('../models/productSchema');;

const securePassword=async (password)=>{
    try {
        const hashpassword= await bcrypt.hash(password,10)
        return hashpassword;
    } catch (error) {
        console.log('securing password error '+error);
    }
}
const loadAdminLogin=async(req,res)=>{
    try {
        if(req.session.admin){
            res.redirect('admin/dashboard')
            console.log('admin rendered');
        }else{
            res.render('login');
        }

    } catch (error) {
        console.log('admin login error '+error);
    }
}
// const savingAdmin=async()=>{
//     try {
//     const password='admin1234'
//     const email='admin123@gmail.com'
//     const password1=await securePassword(password);
//     console.log(password1);
//     const   Admin1=new adminData({
//         email:email,
//         password:password1
//     })
// const savedAdmin=await Admin1.save();
// console.log('admin saved');
//     } catch (error) {
//         console.log('saving admin error'+error);
//     }
// }
// savingAdmin();

const loginAdmin=async(req,res)=>{
    try {
        console.log(req.body.email);
        let email=req.body.email;
        let password=req.body.password;
        
        const verifiedEmail=await adminData.findOne({email:email})
        if(verifiedEmail){
            console.log('email exists and verified');
           const passwordMatch=await bcrypt.compare(password,verifiedEmail.password);
            if(passwordMatch){
                req.session.admin=true;
                req.session.adminData=verifiedEmail
                res.render('adminHome')
            }else{
                res.render('adminLogin',{message:'Entered Password is Incorrect'})
            }
        }else{
            res.render('adminLogin',{message:' Not an Admin'})
        }
    } catch (error) {
        console.log('login admin error'+error);
    }
}
const loadDashboard=async (req,res)=>{
    try {
        res.render('adminHome');
    } catch (error) {
        console.log('loading dashboard error');
    }
}
const userLoad=async(req,res)=>{
    //console.log("jjhgdgfghdfgdg");
    try {
        const userData=await User.find({});
        console.log(userData);
       res.render('userManage',{userData:userData}) 
    } catch (error) {
        console.log('rendering userpage error '+error);
    }
}
 const searchResult=async(req,res)=>{
    try {
        let search='';
        if(req.query.search){

        }
    } catch (error) {
        console.log('search error'+error);
    }
 }
 const blockUser=async(req,res)=>{
       const userData=req.body.id;
       console.log(userData);
       const userToBlock=await User.findOne({_id:req.body.id});
        await User.findByIdAndUpdate({_id:req.body.id},{$set:{blockStatus:true}})
        .then((response)=>{
            res.json(response);
            res.redirect('/admin/users')
        })
    //    res.redirect('/admin/users')
    .catch ((error)=>{
        console.log('blocking user error '+error);
    })
}

const unBlockUser= async (req,res)=>{
    try {
        const userData=req.body.id;
        const userToUnblock=await User.findOne({_id:userData});
        if(userToUnblock){
            await User.findByIdAndUpdate({_id:req.body.id},{$set:{blockStatus:false}});           
        }
        res.redirect('/admin/users')
    } catch (error) {
        console.log('unblocking user error '+error);
    }
}
const categoryLoad =async(req,res)=>{
    try {
        const categoryData=await Category.find({}); 
        console.log(categoryData+"this is catweory data");
        // console.log(categoryData.categoryImage);
        res.render('category',{categoryData:categoryData});
 
    } catch (error) {
        console.log(error);
    }
}
const addCategory=async(req,res)=>{
    try {

        res.render('addCategory');
    } catch (error) {
        console.log('rendering add category page error '+error);
    }
}
const categoryAdding=async (req,res)=>{
    try {
        const categoryName=req.body.categoryName;
        const image = req.file;
        console.log(image+"getting image in category");
        const CategoryData=await Category.findOne({categoryName:categoryName})
          if(categoryName!=="" && image){
           const categorySave= new Category({
            categoryName:categoryName,
            categoryImage:image.filename
           });
           if(!CategoryData){
                await categorySave.save();
                res.render('addCategory',{message:'Category added successfully'})
            }else{
                res.render('addCategory',{message: 'Entered category already exists'})
            }
        }else{
            res.render('addCategory',{message:'category adding failed'});
        }
           
          
    } catch (error) {
        console.log('Category adding to database error '+error);
    }
}
const deleteCategory=async(req,res)=>{
   try {
    const Categorydata=req.body.id
    const categoryTodelete=await Category.deleteOne({_id:Categorydata});
    const categoryList=await Category.find({});
    res.render('category',{message1:'category delete success',categoryData:categoryList})
   } catch (error) {
    console.log('edit Category error '+error);
   }
}
const editCategory =async (req,res)=>{
    try {
        const ToeditData = await Category.findOne({_id:req.query.id})
        console.log(ToeditData+"this is category to edit");
        res.render('editCategory',{ToEdit:ToeditData})
    } catch (error) {
        console.log("edit category error "+error);
    }
}
const saveEditedCategory=async (req,res)=>{
    try {
        const categoryName=req.body.categoryName;
        const categoryImage =req.file;
        const id=req.query.id
        const ToeditData=Category.findOne({_id:id});
         const EditingData=await Category.findOne({categoryName:categoryName})
        if(categoryName!=='' && categoryImage){
            if(!EditingData){
                await Category.findByIdAndUpdate(
                    {_id:id},
                    {$set:{categoryName:categoryName,categoryImage:categoryImage.filename}}
                )
                res.redirect('/admin/category')
            }else{
                res.render('editcategory',{ToEdit:ToeditData,message:'Entered Category already exists'});
            }          
        }else{
            res.render('editcategory',{Toedit:ToeditData,message:'please fill all fields'})
        }
        
    } catch (error) {
        console.log('this is save edited category error '+error);
    }
}
const productLoad=async(req,res)=>{
    try {
        const allProduct=await Product.find({}).populate('Category')
        //console.log(allProduct.Category +' this is error of categroy');
        console.log(allProduct+" this is all product details");
       res.render('product',{Product:allProduct}); 
    } catch (error) {
        console.log('product loading error '+error );
    }
}
const addProduct = async (req,res)=>{
    try {
        const Categories=await Category.find({});
        res.render("addProduct",{Categories:Categories});
    } catch (error) {
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
           console.log(ProductToSave+" this is product details");
           res.render('addProduct',{message:'Added New Product Successfully',Categories:Categories})
           console.log('adding new product success');
        }else{
            res.render('addProduct',{message:'Product already exists',Categories:Categories})
        }
        }else{
            res.render('addproduct',{message:'please fill all the fields',Categories:Categories})
        }
    } catch (error) {    
        console.log('saving add product error '+error);
    }
}
const editProduct = async (req,res)=>{
    try {
        const id=req.query.id;
        const CategoryData=await Category.find({});
        const ProductData = await Product.findById({_id:id})
        res.render('editProduct',{ProductData:ProductData,Category:CategoryData});
    } catch (error) {
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
    const images= req.files.map(file=>file.filename);
    console.log(images);
    const productData = await Product.find({}).populate('Category');
    const categoryData=await Category.find({});
    if(productName!='' && category!='' && quantity > 0 && price > 0 && images){
         await Product.findByIdAndUpdate({_id:id},
            {$set:{
                ProductName:productName,
                ProductImage:images,
                Price:price,
                Quantity:quantity,
                Description:desc,
                Category:category
        }})
        const newProductData=await Product.find({}).populate('Category')
        res.render('product',{Product:newProductData})
        console.log('edited successfully');
    }else{
        res.render('editProduct',{message:'enter a valid details', ProductData:productData,Category:categoryData})
        console.log('else worked');
    }    
    } catch (error) {
        console.log('this is submitting error of edit '+error);
    }
}

const deleteProduct=async (req,res)=>{
    try {
        const id=req.body.id;
        console.log('delete product id '+id);
        await Product.findByIdAndDelete({_id:id});
        const remainingProduct= await Product.find({});
        res.render('product',{Product:remainingProduct,message:'deleted successfully'})
    } catch (error) {
        console.log('deleting Product  error '+error);
    }
}
module.exports ={
    loadAdminLogin,
    loginAdmin,
    userLoad,
    searchResult,
    categoryLoad,
    blockUser,
    unBlockUser,
    addCategory,
    categoryAdding,
    deleteCategory,
    editCategory,
    saveEditedCategory,
    productLoad,
    addProduct,
    SaveAddProduct,
    editProduct,
    saveEditedProduct,
    loadDashboard,
    deleteProduct
}