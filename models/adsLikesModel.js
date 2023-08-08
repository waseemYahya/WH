const mongoose = require("mongoose")
const Joi = require("joi")
const adsLikeSchema = new mongoose.Schema({
    id_user: String,
    id_ad: String,
    note: String
})

exports.AdsLikeModel = mongoose.model("adslikes", adsLikeSchema)

exports.validAdsLike = (_bodyData) => {
    let joiSchema = Joi.object({
        id_user:Joi.string().required(),
        id_ad:Joi.string().required(),
        note:Joi.string().allow('')

    })
    return joiSchema.validate(_bodyData)
}
