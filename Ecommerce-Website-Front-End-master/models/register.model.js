const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    phone : {
        type: String,
        required: true
    },
    city : {
        type: String,
        required: true
    },
    address : {
        type: String,
        required: true
    },
})

const  Register = new mongoose.model("Resgiter",signupSchema);
module.exports = Register;