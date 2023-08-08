const mongoose = require("mongoose")
const Joi = require("joi")
const chatSchema = new mongoose.Schema({
    id_invit:String,
    id_ad:String,
    comment:String,
    score: Number,
    date_created: {
        type: Date, default: Date.now()
    }
})

exports.ChatModel = mongoose.model("adchats", chatSchema)

exports.validChat = (_bodyData) => {
    let joiSchema = Joi.object({
        id_invit:Joi.string().required(),
        id_ad:Joi.string().required(),
        comment:Joi.string().min(2).max(1000).required(),
        score:Joi.number().min(0).max(10)
    })
return joiSchema.validate(_bodyData)
}