const mongoose = require("mongoose")
const Joi = require("joi")
const adSchema = new mongoose.Schema({
    id_user: String,
    address: String,
    price: Number,
    price_type: Boolean,
    description: String,
    arr_img: [String],
    arr_busy_days: [Object],
    amount_people: Number,
    kind: String,
    rooms: Number,
    floor: Number,
    elevator: Boolean,
    merger: Boolean,
    bars: Boolean,
    parking: Boolean,
    disabled: Boolean,
    pool: Boolean,
    jacuzzi: Boolean,
    isActive:{
        type: Boolean, default: true
    },
})

exports.AdModel = mongoose.model("ads", adSchema)

exports.validAd = (_bodyData) => {
    let joiSchema = Joi.object({
        id_user: Joi.string().required(),
        address: Joi.string().min(10).max(100).required(),
        price: Joi.number().min(0).required(),
        price_type: Joi.boolean().required(),
        description: Joi.string().min(10).max(1000).required(),
        amount_people: Joi.number().min(1).required(),
        kind: Joi.string().required(),
        rooms: Joi.number().min(1).required(),
        floor: Joi.number(),
        elevator: Joi.boolean(),
        merger: Joi.boolean(),
        bars: Joi.boolean(),
        parking: Joi.boolean(),
        disabled: Joi.boolean(),
        pool: Joi.boolean(),
        jacuzzi: Joi.boolean(),
        arr_img:Joi.array(),
        arr_busy_days:Joi.array(),
        isActive:Joi.boolean()
    })
    return joiSchema.validate(_bodyData)
}