const express=require('express');
const mongoose= require('mongoose');
const multer=require('multer')
const router=express.Router();
const Product=require('../../model/product')
const path=require('path');
const checkAuth=require('../../middlewares/auth')

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+file.originalname)
    }
})
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png')
    cb(null,true)
    else
    cb(null,false)
}
const upload=multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*50
    },
    fileFilter:fileFilter
})




router.get('/',(req,res,next)=>{
    Product.find().select('name price _id productImage').exec().then((docs)=>{
        const response={
            count:docs.length,
            products:docs.map(doc=>{
                return {
                    _id:doc._id,
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    request:{
                        method:'GET',
                        url:'http://localhost:3000/product/'+doc._id,
                        method:'GET',
                        url:'http://localhost:3000/'+doc.productImage
                    }
                }
            })
        }

        res.status(200).json(response)
        

    }).catch(error=>{
        res.status(500).json({error:error})
    })
   
})
router.post('/',checkAuth,upload.single('ProductImage'),(req,res,next)=>{
    const {name,price}=req.body;

    // if(!name || !price)
    // return res.status(500).json({error:"Fill all Fields"})
    const product=new Product({
        _id:new mongoose.Types.ObjectId(),
        name,
        price,
        productImage:req.file?req.file.path:'test path'
    })
    product.save().then(data=>{
        const response={
            _id:data._id,
            name:data.name,
            price:data.price,
            productImage:data.productImage,
            requests:{
                method:'PATCH',
                url:'http://localhost:3000/product/'+data._id,
                fields:{
                    name:'String',
                    price:'Number'
                }
            }
        }
    res.status(200).json(response);
    }).catch(error=>res.status(500).json({error:error}))
    
})
router.get('/:productid',(req,res,next)=>{
    const id=req.params.productid;
    Product.findById(id).select('_id name price productImage').exec().then(data=>{
        const response={
            name:data.name,
            price:data.price,
            _id:data._id,
            productImage:data.productImage,
            request:{
                method:'POST',
                url:'http://localhost:3000/product',
                validation:{
                    name:'String',
                    price:'Number',
                    productImage:'String'
                }
            }
        }
        res.status(200).json(response)
    }).catch(error=>{
        res.status(500).json({error:error})
    })
    
})
router.patch('/:productid',checkAuth,(req,res,next)=>{
    const productId=req.params.productid;
    const updateOps={};
    for(const each in req.body)
    updateOps[each]=req.body[each];
    Product.findOneAndUpdate({_id:productId},{$set:updateOps}).select('name price _id').exec().then(data=>{
        console.log(data)
        const response={
            name:data.name,
            price:data.price,
            _id:data._id,
            productImage:data.productImage,
            request:{
                method:'DELETE',
                url:'http://localhost:3000/product/'+data._id
            }
        }
        res.status(200).json({
        message:'Updated',
        response})
    }).catch(error=>res.status(500).json(error))
    
})
router.delete('/:productid',checkAuth,(req,res,next)=>{
    const productId=req.params.productid;
    Product.remove({_id:productId}).exec().then((result)=>{
        res.status(200).json({
        message:'Deleted',
        result
    })
    }).catch(error=>res.status(500).json({error:error}))
    
})
router.delete('/',checkAuth,(req,res,next)=>{
    Product.remove({}).exec().then(response=>{
        res.status(200).json({
            message:'Deleted All',
            response:response
        })
    }).catch(error=>res.status(500).json({error:error}))
})
module.exports=router;