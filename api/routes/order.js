const express=require('express');
const mongoose = require('mongoose');
const router=express.Router();
const Order=require('../../model/order');
const Product = require('../../model/product');
const checkAuth=require('../../middlewares/auth')
router.get('/',(req,res,next)=>{
    Order.find().exec().then(data=>{
        if(!data.length)
        return res.status(404).json({message:'No orders yet received'})
        const response={
            count:data.length,
            orders:data.map(order=>{
                return {
                    _id:order._id,
                    product:order.product,
                    quantity:order.quantity
                }
            }),
            request:{
                method:'POST',
                url:'http://localhost:3000/order',
                body:{
                    productId:"ID",
                    quantity:"Number"
                }
            }
        }
        return res.status(200).json(response);

    }).catch(error=>res.status(500).json({error:error}))
})

router.post('/',checkAuth,(req,res,next)=>{
    const productId=req.body.productId;
    Product.findById(productId).exec().then(data=>{
        if(!data)
        {
            return res.status(404).json({message:"Product not Found"})
        }
        const order=new Order({
            _id:new mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:productId
        })
        order.save().then(data=>{
            const response={
                order,
                request:{
                    method:'GET',
                    url:'http://localhost:3000/order/'+productId
                }
            }
            res.status(200).json(response)
        })

    })
})
router.get('/:orderid',(req,res,next)=>{
    const orderId=req.params.orderid;
    Order.findById(orderId).exec().then(data=>{
        if(!data)
        return res.status(404).json({message:'Order not found'});
        const response={
            _id:data._id,
            product:data.product,
            quantity:data.quantity,
            request:{
                method:'DELETE',
                url:'http://localhost:3000/order/'+orderId
            }
        }
        res.status(200).json(response)
    }).catch(error=>res.status(500).json({error:error}))
})
router.delete('/:orderid',checkAuth,(req,res,next)=>{
    const orderId=req.params.orderid;
    Order.remove({_id:orderId}).exec().then(response=>
        res.status(200).json({
            message:'Order deleted',
            request:{
                method:'GET',
                url:'http://localhost:3000/order'
            }
        })).catch(error=>res.status(500).json({error:error}))
    
})

module.exports=router;

