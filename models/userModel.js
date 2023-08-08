const mongoose = require("mongoose")
const Joi = require("joi")
const jwt = require("jsonwebtoken")
const { config } = require("../config/secret")



const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    date_created: {
        type: Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    },

});


exports.UserModel = mongoose.model("users", userSchema)

exports.getToken = (_userId, _role) => {
    let token = jwt.sign({ _id: _userId, role: _role }, config.tokenSecret, { expiresIn: "1000mins" });
    return token;
}

exports.validUser = (_bodyData) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(30).required().email(),
        password: Joi.string().min(6).max(15).required(),
        phone: Joi.string().min(9).max(11).required(),
        role: Joi.string()

    })
    return joiSchema.validate(_bodyData)
}

exports.validUserUpdate = (_bodyData) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(30).required().email(),
        phone: Joi.string().min(9).max(11).required(),
        role: Joi.string()

    })
    return joiSchema.validate(_bodyData)
}


exports.validNewPassword=(_bodyData)=>{
    let joiSchema=Joi.object({
        email: Joi.string().min(5).max(30).required().email(),
        password:Joi.string().min(6).max(15).required()
    })
    return joiSchema.validate(_bodyData)
}