const mongoose = require("mongoose")
const Joi = require("joi")
const usersBankSchema = new mongoose.Schema({
    id_user:String,
    account_number:String,
    branch_number:String,
    bank_number:String
})

exports.UsersBankModel = mongoose.model("userBanks", usersBankSchema)

exports.validUsersBank = (_bodyData) => {
    let joiSchema = Joi.object({
        id_user:Joi.string().required(),
        account_number:Joi.string().required(),
        branch_number:Joi.string().min(1).max(4).required(),
        bank_number:Joi.string().required(),
    })
return joiSchema.validate(_bodyData)
}