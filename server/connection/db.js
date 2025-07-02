// create db connection 
const mongoose = require("mongoose");
const {mongo_url} = require("../config")

const dbConnection = () => {
    try{
        mongoose.set("strictQuery", false);
        mongoose.connect(mongo_url);
        console.log("database connected successfully");
    }catch(e){
        console.error("error while connect db");
    }
}

module.exports = dbConnection;