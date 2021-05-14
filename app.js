const express=require('express');
const app=express();
const path=require('path')
const mongoose=require('mongoose')
const productRoutes=require('./api/routes/product')
const orderRoutes=require('./api/routes/order');
const userRoute=require('./api/routes/user')
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,PUT')
        return res.status(200).json({})
    }
    next()
})
const uri='mongodb+srv://Rupayan:'+process.env.MONGO_PASSWORD+'@cluster0.wam6p.mongodb.net/restapi?retryWrites=true&w=majority'
mongoose.connect(uri,{
    useNewUrlParser:true,useUnifiedTopology:true
})
const connection=mongoose.connection;
connection.once('open',()=>console.log("Database restapi connected"))
app.use('/uploads',express.static('uploads'));
app.use('/product',productRoutes)
app.use('/order',orderRoutes)
app.use('/user',userRoute)
app.get('/',(req,res)=>{
    res.status(200).json({message:"this is homepage"})
})
app.use((req,res,next)=>{
    const err=new Error('Not found');
    err.status=404;
    next(err)
})
app.use((error,req,res,next)=>{
    res.status(error.status||500).json({
        error:{
            message:error.message
        }
    })
})
module.exports=app;