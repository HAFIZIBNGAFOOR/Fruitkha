const CartItem =require('../models/cart');
const Order = require('../models/orderSchema');
const User = require('../models/userSchema');
const moment = require('moment')
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
        const order = await Order.findById({_id:req.query.id}).populate('Coupon')
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
let couponCode;
let couponamount;
const placeOrder = async (req,res)=>{
    try {
        const {
            address,
            payment,
            subtotal,
            allTotal,
            coupon
        } = req.body;
        console.log('this is form data ,' ,req.body,address,payment,allTotal,subtotal);
        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;
        const now = moment();
        const date = now.toDate();
        const cart = await CartItem.find({UserId:req.session.userData._id}).populate('ProductId');
        // const user = await User.findById({_id:req.session.userData._id});
        console.log(coupon);
        const paymentMethod = payment[0]==='1' ? 'Cash On Delivery' :'RazorPay';
        const couponId = coupon ?? null 
        const newOrder = new Order({
            orderId:orderId,
            userId:req.session.userData._id,
            date:date,
            total:allTotal,
            subtotal:subtotal,
            payment_method:paymentMethod,
            addressId:address,
            Coupon:couponId,
        })
        newOrder.product=cart.map((item)=>({
            id : item._id,
            name : item.ProductId.ProductName,
            price :item.ProductId.DiscountedPrice ? item.ProductId.DiscountedPrice : item.ProductId.Price,
            quantity : item.Quantity
        }))
        await newOrder.save();

        await CartItem.deleteMany({UserId:req.session.userData._id})
        res.json('success')
        
    } catch (error) {
        res.json('error')
        console.log('this is place order error '+error);
    }
 }
 const orderSuccess = async (req,res)=>{
    try {
        const user = req.session.userData;
        const Orders = await Order.find({ userId:req.session.userData._id })
        .populate('Coupon') 
        .sort({ date: -1 }) 
        .limit(1)
        let latestOrder;
        if(Orders.length >0){
           latestOrder = Orders[0];
        }
        let maxRedeemable = 0
        if(latestOrder.Coupon){
          maxRedeemable = latestOrder.Coupon.maxRedeemable
        }
        res.render('orderSuccess',{latestOrder,user,maxRedeemable});
    } catch (error) {
      res.render('error')
      console.log('order success page error',error);
    }
 }

 const loadUserOrders= async (req,res)=>{
    try {
        const Orders = await Order.find({userId:req.session.userData._id}).sort({date:-1});
        console.log(Orders);
        const user = req.session.userData
        res.render('orders',{Orders,user});
    } catch (error) {
      res.render('error')
      console.log('this is view orders error');
    }
 }
const viewOrders = async (req,res)=>{
    try {
      const orderId = req.query.id;
      const order = await Order.findById(orderId).populate('Coupon').sort({date:-1});
      const user = req.session.userData
      let couponAmount = 0
      if(order.Coupon){
        couponAmount=order.Coupon.maxRedeemble;
      }
      console.log(couponAmount);
      res.render('viewOrders',{order,user,couponAmount})
    } catch (error) {
        res.render('error')
        console.log('this is view orders error ',error);
    }
}
const deleteOrder = async (req,res)=>{
    try {
        const orderId = req.query.id;
        const user = req.session.userData._id;
        const oldOrder =await Order.findByIdAndUpdate({_id:orderId},{$set:{status:'cancelled'}});
        const Orders = await Order.find({userId:user}).sort({date:-1});
        console.log(Orders);
        res.render('orders',{Orders,user});
    } catch (error) {
      res.render('error')
      console.log('delete order error ',error);
    }
}
const returnOrder = async(req,res)=>{
  try {
    const id = req.query.id;
    const user1 =req.session.userData
    const order = await Order.findById({_id:id});
    const amount = order.total;
    console.log(amount);
    await Order.findByIdAndUpdate({_id:id},{$set:{status:'Returned'}})
    const userData = await User.findByIdAndUpdate({_id:user1._id},{$set:{Wallet:amount}});
    req.session.userData= userData;
    const user = req.session.userData;
    const Orders = await Order.find({userId:user1._id}).sort({date:-1})
    res.render('orders',{Orders,user})
  } catch (error) {
    res.render('error')
    console.log('this is return order ',error);
  }
}
const trackOrder=async (req,res)=>{
    try {
        const user = req.session.userData;
        const order = await Order.findById({_id:req.query.id});
        const currentDate = new Date();
        const halfHourBefore = new Date(currentDate.getTime() - 30 * 60 * 1000);
        const hours = halfHourBefore.getHours();
        const minutes = halfHourBefore.getMinutes();
        const now = (hours + ':' + minutes)
        const orderDate = order.date; 

        const fiveDaysAfterOrder = new Date(orderDate.getTime());
        fiveDaysAfterOrder.setDate(orderDate.getDate() + 5);
        res.render('trackOrder',{order,now,fiveDaysAfterOrder,user})
    } catch (error) {
      res.render('error')
      console.log('this is track order errror');
    }
}
module.exports={
    placeOrder,
    orderSuccess,
    viewOrders,
    loadOrders,
    deleteOrder,
    trackOrder,
    loadUserOrders,
    viewSingleOrder,
    changeStatus,
    cancelOrder,
    returnOrder
}