const mongoose=require('mongoose');
const schema=mongoose.Schema;
const User=new schema({
    _id:mongoose.Schema.Types.ObjectId,
    email:{type:String,required:true,match:/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
    password:{type:String,required:true}})
module.exports=mongoose.model('user',User);