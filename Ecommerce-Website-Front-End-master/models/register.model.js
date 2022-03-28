const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    Name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    contact : {
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
    password : {
        type: String,
        required: true
    }
})

const  Register = new mongoose.model("Resgiter",signupSchema);

module.exports = Register;