const mongoose = require("mongoose");

const schema = mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
   
    
    
})

const Forot_Password_OTP = mongoose.model("Forot_Password_OTP", schema);
module.exports = Forot_Password_OTP;