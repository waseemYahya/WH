const express = require("express")
const { OrderModel, validOrder } = require("../models/ordersModel")
const { AdModel } = require("../models/adsModel")
const { authToken } = require("../auth/authToken")
const { UserModel } = require("../models/userModel")
const router = express.Router()


//הצגת הזמנות למודעה של משתמש ספציפי
router.get("/idAd/:id", async (req, res) => {
    let perPage = req.query.perPage||9;
    let page = req.query.page || 1;
    let id=req.params.id
    try {
        let data = await OrderModel.find({id_ad:id})  
        const orderPromises = data.map(async (order) => {
            const user = await UserModel.findOne({ _id: order.id_invit }, { password: 0 });
            return { ...order.toObject(), name: user.name, email:user.email, phone:user.phone };
          });
          const updatedData = await Promise.all(orderPromises);
          res.json(updatedData);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת הזמנות של משתמש ספציפי
router.get("/idinvit/:id", async (req, res) => {
    let perPage = req.query.perPage||9;
    let page = req.query.page || 1;
    let id=req.params.id
    try {
        let data = await OrderModel.find({id_invit:id})  
        .limit(perPage)
        .skip((page - 1) * perPage)
        const orderPromises = data.map(async (order) => {
            const ad = await AdModel.findOne({ _id: order.id_ad });
            return { ...order.toObject(), address: ad.address};
          });
          const updatedData = await Promise.all(orderPromises);
          res.json(updatedData);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הוספת הזמנה למשתמש
router.post("/", authToken, async (req, res) => {
    req.body.id_invit= req.tokenData._id
    let validBody = validOrder(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    let site = new OrderModel(req.body)
    site.save()
    res.json(site)
})


//מחיקת הזמנה של משתמש
router.delete("/:idDel", authToken, async (req, res) => {
    let idOrder= req.params.idDel;
    let idInvit=req.tokenData._id
    try {
        let data = await OrderModel.deleteOne({ _id:idOrder, id_invit:idInvit })
        if(data.deletedCount==0){
            return res.status(401).json({msg:"This order is not found in your orders"})
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})


//עדכון הזמנה של משתמש
router.put("/:idEdit", authToken, async (req, res) => {
    req.body.id_invit= req.tokenData._id
    let idOrder= req.params.idEdit;
    let idUser=req.tokenData._id
    let validBody = validOrder(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    try {
        let data = await OrderModel.updateOne({ _id:idOrder, id_invit:idUser }, req.body)
        if(data.matchedCount==0){
            return res.status(401).json({msg:"This order is not found in your orders"})
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})

module.exports = router
