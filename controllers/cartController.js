const Product = require('../models/productSchema');
const CartItem =require('../models/cart');

const addToCart = async (req,res)=>{
    try {
        const productId = req.body.id;
        const userId = req.body.user;
        const item =await CartItem.findOne({UserId:userId,ProductId:productId});
        const Product1 = await Product.findById({_id:productId});
        const ProductPrice = Product1.DiscountedPrice ? Product1.DiscountedPrice : Product1.Price;
        console.log(ProductPrice);
        if(!userId ){
            res.json(false)
        }else{
            const Cart = new CartItem({
                ProductId:productId,
                UserId:userId,
                Total:1 * ProductPrice,
                subTotal:1 * Product1.Price
            });
            if(!item){
                await Cart.save();
                res.json(true);
            }else{
                res.json(true);
            }          
        }        
    } catch (error) {
        console.log(' add to cart erorr  ',error);
    }
}

const loadCart = async(req,res)=>{
    try {
        console.log(req.query.id ,' user idddd');
        const user=req.query.id;
        const cartItems =await CartItem.find({UserId:user}).populate('ProductId');
        let Total = 0;
        let subTotal = 0;
        cartItems.forEach(element=>{
            const price = element.ProductId.DiscountedPrice ? element.ProductId.DiscountedPrice : element.ProductId.Price;
            const ogPrice =element.ProductId.Price;
            const quantity = element.Quantity;
            const productTotal = price * quantity;
            const sTotal = ogPrice * quantity
            subTotal += sTotal
            Total+=productTotal; 
        })
        console.log(Total ,subTotal);
        res.render('cart',{
            user,
            cartItems,
            Total,
            subTotal
        });
    } catch (error) {
        console.log('this is laod cart error ',error);
    }
}
const deleteCart = async (req,res)=>{
    try {
        await CartItem.findOneAndDelete({UserId:req.body.id,ProductId:req.body.productId});
        const cartItems = await CartItem.find({UserId:req.body.id}).populate('ProductId');
        let allTotal =0;
        cartItems.forEach(item=>{
            allTotal += item.Total
        })
        res.json({cartItems,allTotal});
    } catch (error) {
        console.log('this is delete cart error ',error);
    }
}
const updateCart = async(req,res)=>{
    try {
        const user = req.body.userId;
        const productId =req.body.productId;
        const quantity  = req.body.quantity
        const Item = await CartItem.findOne({UserId:user,ProductId:productId});
        const Product1 = await Product.findOne({_id:productId});

        const Quantity= quantity;
        console.log(Product1.DiscountedPrice,' this isdisocuted pridce');
        const Total =Product1.DiscountedPrice ? Product1.DiscountedPrice*quantity : Product1.Price*quantity;
        const subtotal = Product1.Price * quantity;
        await CartItem.updateOne({_id:Item._id},{$set:{Quantity:Quantity,Total:Total,subTotal:subtotal}});
        const newItem = await CartItem.find({UserId:user});
        console.log(newItem,' this is new itrems');
        if(newItem){
            res.json(newItem); 
        }else{
            res.json('emptyCart')
        }             
    } catch (error) {
        console.log('update cart error ',error);
    }
}
module.exports={
    addToCart,
    loadCart,
    deleteCart,
    updateCart,
}