const express=require('express');
const router=express.Router();
const User=require('../../model/user')
const bcrypt=require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const checkAuth=require('../../middlewares/auth')
require('dotenv').config()


router.get('/',(req,res,next)=>{
    User.find().select('_id email').exec().then(data=>{
        if(!data.length)
        return res.status(409).json({message:"No User Found"})
        else
        {
            const response={
                _id:data[0]._id,
                email:data[0].email,
                request:{
                    method:"POST",
                    body:{
                        email:"String",
                        password:"String"
                    }
                }
            }
            res.status(200).json(response);
        }
       
    }).catch(error=>res.status(500).json({error:error}))
})

router.post('/',(req,res,next)=>{
    User.find({email:req.body.email}).exec().then(data=>{
        if(!data.length)
        {
            const { email, password}=req.body;
            bcrypt.hash(password,10,(err,hash)=>{
                if(err)
                return res.status(500).json({message:"1",error:err})
                const user=new User({
                    _id:new mongoose.Types.ObjectId,
                    email:email,
                    password:hash
                })
                user.save().then(result=>{
                    const response={
                        _id:result._id,
                        email:result.email,
                        password:result.password,
                        request:{
                            method:"GET",
                            url:"http://localhost:3000/user"

                        }
                        
                    }
                    return res.status(200).json(response)
                }).catch(err=>res.status(500).json({error:err}))
            });

        }
        else
        return res.status(409).json({message:"email Exists"})
    }).catch(err=>res.status(500).json({error:err}))
})
router.post('/login',(req,res,next)=>{
    User.find({email:req.body.email}).exec().then(data=>{
        if(!data.length)
        return res.status(409).json({message:"Auth Failed"})
        else
        {
            console.log(req.body.email,req.body.password)
            bcrypt.compare(req.body.password,data[0].password,(err,result)=>{
                if(result)
                {
                    const token=jwt.sign({'email':data[0].email,'password':data[0].password},process.env.JWT_KEY,{expiresIn:'1h'});
                    return res.status(200).json({message:"Auth Successful",token:token})
                }
                else
                return res.status(409).json({message:"Auth Failed"})
            })
        }
    }).catch(err=>res.status(500).json({error:err}))
})




router.delete('/:userid',checkAuth,(req,res,next)=>{
    User.findById(req.params.userid).exec().then(data=>{
        if(data)
        User.remove({_id:req.params.userid}).exec().then(result=>res.status(200).json({
            message:"Successfully deleted",
            result
    })).catch(err=>res.status(500).json({error:err}))
    else{
       return res.status(409).json({message:"User doesnt exist with this id"})
    }
    }).catch(err=>res.status(500).json({error:err}))
})



module.exports=router