const { Admin } = require('mongodb');
//const AdminSave=require('../models/adminSchema');
const bcrypt=require('bcrypt');
const path=require('path')
const adminData = require('../models/adminSchema');
const User=require('../models/userSchema');
const Category=require('../models/categorySchema');
const { log } = require('console');
const Product = require('../models/productSchema');;
const Order = require('../models/orderSchema');
const Coupon = require('../models/couponSchema');
const moment = require("moment");
const { json } = require('body-parser');

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
                req.session.adminData=verifiedEmail;
                res.redirect('/admin/dashboard');
                // const currentDate = new Date();
                // const startDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Start of the last 24 hours
                // const endDate = currentDate
                // // Query orders within the current date range
                // const orders = await Order.find({
                //     date: {
                //     $gte: startDate,
                //     $lt: endDate,
                //     },status:'Delivered'
                // });
                // // Calculate total sales for the current date
                // let totalSales = 0;
                // orders.forEach((order) => {
                //     totalSales += order.total;
                // });
                // console.log(orders,' htis didf8',totalSales);
                // const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6, 0, 0, 0); // Start of the past 7 days
                // const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

                // // Query orders within the current week range
                // const weeklyOrders = await Order.find({
                // date: {
                //     $gte: startOfWeek,
                //     $lte: endOfWeek,
                // },status:'Delivered'
                // });

                // // Calculate total sales for the current week
                // let weeklySales = 0;
                // weeklyOrders.forEach((order) => {
                // weeklySales += order.total;
                // });

                // console.log('Weekly orders:', weeklyOrders);
                // console.log('Total sales for the current week:', weeklySales);
                // const currentYear = currentDate.getFullYear(); // Specify the target year
                // const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0); // Start of the target year
                // const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); 
                // const yearlyOrders = await Order.find({
                //     date: {
                //         $gte: startOfYear,
                //         $lte: endOfYear,
                //     },status:'Delivered'
                // }); 
                // let YearlySales = 0;
                // yearlyOrders.forEach((order) => {
                // YearlySales += order.total;
                // });
                // console.log(YearlySales,'this is yealy salses');
                // const dailyOrder = orders.length;
                // const weeklyOrder = weeklyOrders.length
                // const annualOrder = yearlyOrders.length;
                // const latestOrders = await Order.find({status:'Delivered'}).sort({date:-1}).limit(4);
                // console.log(latestOrders);
                // const salesData = await Order.aggregate([
                //     {
                //     $match:{status:'Delivered'}
                //     },
                //     {
                //         $group:{
                //             _id:{
                //                 year:{$year:"$date"},
                //                 month:{$month:"$date"},
                //             },
                //             totalSales: { $sum: '$total' },
                //         }
                //     },
                //     {
                //         $sort:{
                //             '_id.year':1,
                //             '_id.month':1
                //         }
                //     }
                // ])
                // res.json(salesData,totalSales,weeklySales,YearlySales,dailyOrder,weeklyOrder,annualOrder,latestOrders);
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
const adminDashboard = async (req,res)=>{
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Start of the last 24 hours
        const endDate = currentDate
        // Query orders within the current date range
        const orders = await Order.find({
            date: {
            $gte: startDate,
            $lt: endDate,
            },status:'Delivered'
        });
        // Calculate total sales for the current date
        let totalSales = 0;
        orders.forEach((order) => {
            totalSales += order.total;
        });
        console.log(orders,' htis didf8',totalSales);
        const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6, 0, 0, 0); // Start of the past 7 days
        const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

        // Query orders within the current week range
        const weeklyOrders = await Order.find({
        date: {
            $gte: startOfWeek,
            $lte: endOfWeek,
        },status:'Delivered'
        });

        // Calculate total sales for the current week
        let weeklySales = 0;
        weeklyOrders.forEach((order) => {
        weeklySales += order.total;
        });
        const currentYear = currentDate.getFullYear(); // Specify the target year
        const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0); // Start of the target year
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); 
        const yearlyOrders = await Order.find({
            date: {
                $gte: startOfYear,
                $lte: endOfYear,
            },status:'Delivered'
        }); 
        let YearlySales = 0;
        yearlyOrders.forEach((order) => {
        YearlySales += order.total;
        });
        const dailyOrder = orders.length;
        const weeklyOrder = weeklyOrders.length
        const annualOrder = yearlyOrders.length;
        const latestOrders = await Order.find({status:'Delivered'}).sort({date:-1}).limit(4);
        res.render('adminHome',{totalSales,weeklySales,YearlySales,dailyOrder,weeklyOrder,annualOrder,latestOrders})
    } catch (error) {
        console.log('this is admin dashboard errror ', error);
    }
}
const loadDashboard=async (req,res)=>{
    try {
        
        const salesData = await Order.aggregate([
            {
              $match: { status: 'Delivered' }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                totalSales: { $sum: '$total' }
              }
            },
            {
              $sort: {
                '_id.year': 1,
                '_id.month': 1
              }
            }
          ]);
          const categories = await Order.aggregate([
            { $unwind: "$product" },
            {
              $lookup: {
                from: "categories", // Replace "categories" with the actual name of your category collection
                localField: "product.Category",
                foreignField: "_id",
                as: "category"
              }
            },
            { $unwind: "$category" },
            {
              $group: {
                _id: "$category._id",
                categoryName: { $first: "$category.categoryName" },
                totalQuantity: { $sum: "$product.Quantity" }
              }
            },
            {
              $group: {
                _id: '',
                categories: { $push: { _id: "$_id", categoryName: "$categoryName", totalQuantity: "$totalQuantity" } }
              }
            }
          ]);
          
          
          console.log(categories);
          console.log(salesData);
        if(salesData){
            res.json(salesData);
        }
        
    } catch (error) {
        console.log('loading dashboard error',error);
    }
}
const userLoad=async(req,res)=>{
    try {
        const pageSize =  5;
        const currentPage = req.query.page || 1
        const searchQuery = req.query.search || ''
        const result=await User.paginate({},{page:currentPage,limit:pageSize})
        const userData = result.docs;
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
       res.render('userManage',{userData:userData,currentPage,endPage,startPage,totalPages,pageSize}) 
    } catch (error) {
        console.log('rendering userpage error '+error);
    }
}
//  const searchResult=async(req,res)=>{
//     try {
//         let search='';
//         if(req.query.search){

//         }
//     } catch (error) {
//         console.log('search error'+error);
//     }
//  }
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
        const categoryData=await Category.find({isDeleted:false}); 
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
        const discountPercent = req.body.discount || 0
        const image = req.file;
        console.log(image+"getting image in category");
        const CategoryData=await Category.findOne({categoryName:categoryName})
          if(categoryName!=="" && image){
           const categorySave= new Category({
            categoryName:categoryName,
            categoryImage:image.filename,
            discount:discountPercent
           });
           if(!CategoryData){
            await categorySave.save();
            const categoryOffers = await Category.find({});

            const products = await Product.find({}).populate('Category');

            products.forEach(product => {
            const matchingOffer = categoryOffers.find(offer => offer.name === product.Category.categoryName);

            if (matchingOffer) {
                const offerPrice = product.Price - (product.Price * (matchingOffer.discount / 100));
                product.DiscountedPrice = offerPrice; 
            }
            });
                res.render('addCategory',{message:'Category added successfully'})
            }else{
                res.render('addCategory',{message: 'Entered category already exists'})
            }
        }else{
            res.render('addCategory',{message:'category adding failed'});
        }
           
          
    } catch (error) {
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
        const discount = req.body.discount || 0;
        const id=req.query.id
        const ToeditData=Category.findOne({_id:id});
         const EditingData=await Category.findOne({categoryName:categoryName,discount:discount})
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
                      const offerPrice = product.Price - (product.Price * (matchingOffer.discount / 100));
                      product.DiscountedPrice = offerPrice;
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
        console.log('this is save edited category error '+error);
    }
}
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
      console.log('product loading error ' + error);
    }
  };
  
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
           res.render('addProduct',{message:'Added New Product Successfully',errormessage:'',Categories:Categories})
           console.log('adding new product success');
        }else{
            res.render('addProduct',{message:'',errormessage:'Product already exists',Categories:Categories})
        }
        }else{
            res.render('addproduct',{message:'', errormessage:'Please fill all the fields',Categories:Categories})
        }
    } catch (error) {    
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
        console.log(Images[0],'this is s');
        res.render('editProduct',{ProductData:ProductData,Category:CategoryData,Images});
    } catch (error) {
        console.log('edit product error '+error);
    }
}

const saveEditedProduct=async(req,res)=>{
    try {
        console.log('its inside the save edit   ',req.body);
    const id=req.query.id;
    const productName= req.body.ProductName
    const category= req.body.Category
    const quantity = req.body.Quantity
    const price= req.body.Price
    const desc= req.body.Description;
    // const images= req.files.map(file=>file.filename);
    const uploadedFiles = req.files;
    const existingImages = req.body.existingImages || [];
    const allFiles = existingImages.concat(uploadedFiles);
    console.log(existingImages,'nthis is existingn inages', uploadedFiles,' this is uploaded files',allFiles,'  this is all fiels');
    const imageFilenames = allFiles.map(file => {
        if (typeof file === 'string') {
          // Existing image filename
          return file;
        } else {
          // Uploaded file
          return file.filename;
        }
      });
    
    console.log(imageFilenames,'thi sis image file names');
    const productData = await Product.find({}).populate('Category');
    const categoryData=await Category.find({});
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
        const newProductData=await Product.find({}).populate('Category')
        res.redirect('/admin/product')
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
const loadOrders = async (req,res)=>{
    try {
        const Orders =await Order.find({}).sort({date:-1});
        console.log(Orders);
        res.render('ordersList',{Orders})
    } catch (error) {
        console.log('this is load orders error  ',error);
    }
}
const viewSingleOrder =async(req,res)=>{
    try {
        const order = await Order.findById({_id:req.query.id})
        console.log(order,' this is order');
        res.render('singleOrder',{order})
    } catch (error) {
        console.log('this is view single order error ',error);
    }
}

const changeStatus = async (req, res) => {
    try {
      const id = req.query.id;
      const orderData = await Order.findOne({ _id: id });
      if (orderData.status === "processing") {
        const shipOrder = await Order.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              status: "Shipped",
            },
          }
        );
      } else if (orderData.status === "Shipped") {
        const deliverOrder = await Order.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              status: "Out for Delivery",
            },
          }
        );
      } else if (orderData.status === "Out for Delivery") {
        const deliverOrder = await Order.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              status: "Delivered",
            },
          }
        );
      }
      res.redirect("/admin/orders");
    } catch (error) {
      console.log(error.message);
    }
  };
const cancelOrder= async (req,res)=>{
    try {
        const orderId = req.query.id;
        const oldOrder = await Order.findByIdAndUpdate({_id:orderId},{$set:{status:'cancelled'}});
        const Orders = await Order.find({}).sort({date:-1});
        res.render('ordersList',{Orders});
    } catch (error) {
        console.log('this is cancel order error ',error);
    }
}
const  dailySalesReport = async(req,res)=>{
    try {
        const time = moment();
        const formattedDate = time.toDate();
        const startDate = new Date(formattedDate.getTime() - 24 * 60 * 60 * 1000); // Start of the last 24 hours
        const endDate = formattedDate;
        const orders = await Order.find({
             date: {
                $gte: startDate,
                $lt: endDate,
            },status:'Delivered'
        });
        let totalSales = 0;
        orders.forEach((order) => {
            totalSales += order.total;
        });
        const numOrders = await Order.countDocuments({
            date:{
                $gte:startDate,
                $lte:endDate
            },status:'Delivered'
        });
        console.log(numOrders,'this is numorders');
        const topProducts = await Order.aggregate([
            {
              $match: {
                date: { $gte: startDate, $lt: endDate },
                status:'Delivered'
              }
            },
            { $unwind: "$product" },
            {
              $group: {
                _id: {
                  orderId: "$_id",
                  productId: "$product.id"
                },
                productName: { $first: "$product.name" },
                totalQuantity: { $sum: "$product.quantity" },
                totalRevenue: { $sum: { $multiply: ["$product.price", "$product.quantity"] } }
              }
            },
            {
              $group: {
                _id: "$_id.productId",
                productName: { $first: "$productName" },
                totalQuantity: { $sum: "$totalQuantity" },
                totalRevenue: { $sum: "$totalRevenue" }
              }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
          ]);
          
          console.log(topProducts);          
          console.log(' thiis sis top products ',topProducts.length);
        //   const totalRevenue = await Order.aggregate([
        //     {
        //      $match:{
        //         date:{$gte: startDate, $lte:endDate}
        //      }
        //     },
        //     {
        //         $group:{
        //             _id:"",
        //             totalRevenue:{$sum:"$total"}
        //         }
        //     }          
        // ])
        // console.log(totalRevenue,'this is total revenue >>>>>>>', totalRevenue);
        res.render('dailySales',{formattedDate,totalSales,numOrders,topProducts})
    } catch (error) {
        console.log('this is daily sales report error ',error);
    }
}

const  weeklySalesReport = async(req,res)=>{
    try {
        const todayformattedEndDate = new Date();
        const formattedStartDate = new Date(todayformattedEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const orders = await Order.find({
            date: {
               $gte: formattedStartDate,
               $lt: todayformattedEndDate,
           },status:'Delivered'
        });
        let totalSales = 0;
        orders.forEach((order) => {
            totalSales += order.total;
        });
       const  numOrders  = await Order.countDocuments({
        date:{
            $gte:formattedStartDate,
            $lte:todayformattedEndDate
        },status:'Delivered'
        })
        const topProducts = await Order.aggregate([
            {
              $match: {
                date: { $gte: formattedStartDate, $lt: todayformattedEndDate },
                status:'Delivered'
              }
            },
            { $unwind: "$product" },
            {
              $group: {
                _id: {
                  orderId: "$_id",
                  productId: "$product.id"
                },
                productName: { $first: "$product.name" },
                totalQuantity: { $sum: "$product.quantity" },
                totalRevenue: { $sum: { $multiply: ["$product.price", "$product.quantity"] } }
              }
            },
            {
              $group: {
                _id: "$_id.productId",
                productName: { $first: "$productName" },
                totalQuantity: { $sum: "$totalQuantity" },
                totalRevenue: { $sum: "$totalRevenue" }
              }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
          ]);
        res.render('weeklySales',{formattedStartDate,todayformattedEndDate, numOrders ,topProducts,totalSales})
    } catch (error) {
        console.log('this is daily sales report error ',error);
    }
}

const salesReport = async(req,res)=>{
    try {
        const dateRange = req.query.Date;
        // const date = new Date('23-06-2000');
        console.log(dateRange,' this is date range');
        const inputDate = '23-06-2000';
        const [day, month, year] = inputDate.split('-');
        const defaultFrom = new Date(`${year}-${month - 1}-${day}`)

        console.log(defaultFrom);

        console.log( defaultFrom,' this is from date');
        let dateFrom,dateTo;
        if(dateRange){
             [dateFrom,dateTo]= dateRange.split('|')
        }
        let fromDate,toDate;
        if(dateFrom && dateTo){
            const date = new Date(dateFrom);
             fromDate = date.toISOString();
            const datte = new Date(dateTo);
             toDate = datte.toISOString();
        }
        
        console.log(fromDate,toDate);
        const defaultTo = new Date();
        console.log(defaultTo,' this is defult');
        const from =  fromDate || defaultFrom ;
        const to = toDate || defaultTo;
        console.log(to,' this i to date ',from,' this is from fate' );
        const orders = await Order.find({date:
            {
                $gte:from,
                $lte:to
            },
            status:'Delivered'
        })
        console.log(orders);
        res.render('salesReport',{orders});
    } catch (error) {
        console.log('this is  sales report error ',error);
    }
}
const salesReportView = async (req,res)=>{
    try {
        const id = req.query.id;
        const order = await Order.findById({_id:id});
        res.render('viewOrder',{order});
    } catch (error) {
        console.log('this is sales report view error ',error);
    }
}
const laodCoupon = async (req,res)=>{
    try {
         
        const coupons = await Coupon.find({}); 

        coupons.forEach(async coupon => {
        const expirationDate = new Date(coupon.date); 

        if (expirationDate < Date.now()) {
            await Coupon.updateOne({ _id: coupon._id }, { status: "expired" })
        }
        })
        const coupon =  await Coupon.find({}).sort({timestampField:-1})
        res.render('coupon',{coupon})
    } catch (error) {
        console.log('this is load coupon error ',error);
    }
}
const addCoupon = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log('this is add coupon error ',error);
    }
}
const saveAddCoupon = async (req,res)=>{
    try {
        const code = req.body.code;
        const date = req.body.expiry;
        const off = parseInt( req.body.percent);
        const couponData = new Coupon({
            code:code,
            date:date,
            percentage:off 
        });
        console.log(code,date,off);
        await couponData.save();
        console.log('coupon saved');
        res.render('addCoupon',{message:' Added Coupon successfully'})
    } catch (error) {
        console.log('this is save add coupon ',error);
    }
}
module.exports ={
    loadAdminLogin,
    loginAdmin,
    userLoad,
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
    adminDashboard,
    deleteProduct,
    loadOrders,
    viewSingleOrder,
    // orderDetails,
    changeStatus,
    cancelOrder,
    dailySalesReport,
    weeklySalesReport,
    salesReport,
    salesReportView,
    laodCoupon,
    addCoupon,
    saveAddCoupon
}