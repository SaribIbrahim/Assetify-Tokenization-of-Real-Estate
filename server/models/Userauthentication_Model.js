const mongoose = require("mongoose");

const schema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    metamask_Address: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
})

const user_authentication = mongoose.model("user_authentication", schema);
module.exports = user_authentication;