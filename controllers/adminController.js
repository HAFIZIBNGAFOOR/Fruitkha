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
const Banner = require('../models/bannerSchema');
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
        res.render('adminError')
    }
}
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
      res.render('adminError')
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
      res.render('adminError')
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

        if(salesData){
            res.json(salesData);
        }
        
    } catch (error) {
      res.render('adminError')
        console.log('loading dashboard error',error);
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
        res.render('dailySales',{formattedDate,totalSales,numOrders,topProducts})
    } catch (error) {
      res.render('adminError')
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
      res.render('adminError')
      console.log('this is daily sales report error ',error);
    }
}

const salesReport = async(req,res)=>{
    try {
        const dateRange = req.query.Date;
        const inputDate = '23-06-2000';
        const [day, month, year] = inputDate.split('-');
        const defaultFrom = new Date(`${year}-${month - 1}-${day}`)

        let dateFrom,dateTo;
        if(dateRange){
             [dateFrom,dateTo]= dateRange.split('|')
        }
        let fromDate, toDate;
        if (dateFrom && dateTo) {
          const date = new Date(dateFrom);
          fromDate = date.toISOString();
          const datte = new Date(dateTo);
          toDate = datte.toISOString();

          if (dateFrom === dateTo) {
            const nextDate = new Date(datte.getTime() + 24 * 60 * 60 * 1000);
            toDate = nextDate.toISOString();
          }
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
        }).sort({date:-1})
        console.log(orders);
        res.render('salesReport',{orders});
    } catch (error) {
      res.render('adminError')
      console.log('this is  sales report error ',error);
    }
}
const salesReportView = async (req,res)=>{
    try {
        const id = req.query.id;
        const order = await Order.findById({_id:id});
        res.render('viewOrder',{order});
    } catch (error) {
      res.render('adminError')
      console.log('this is sales report view error ',error);
    }
}



module.exports = {
    loadAdminLogin,
    loginAdmin,
    
    loadDashboard,
    adminDashboard,

    dailySalesReport,
    weeklySalesReport,
    salesReport,
    salesReportView,  
}