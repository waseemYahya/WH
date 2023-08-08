const mongoose = require("mongoose")
const Joi = require("joi")
const orderSchema = new mongoose.Schema({
    id_ad: String,
    id_invit: String,
    entry_date: Date,
    release_date: Date,
    number_people: Number,
    price:Number
})

exports.OrderModel = mongoose.model("orders", orderSchema)

exports.validOrder = (_bodyData) => {
    let joiSchema = Joi.object({
        id_ad:Joi.string().required(),
        id_invit:Joi.string().required(),
        entry_date:Joi.date().required(),
        release_date:Joi.date().required(),
        number_people:Joi.number().required(),
        price:Joi.number().min(0).required()

    })
    return joiSchema.validate(_bodyData)
}