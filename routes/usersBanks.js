const express = require("express")
const { UsersBankModel, validUsersBank } = require("../models/usersBankModel")
const { authToken } = require("../auth/authToken")
const router = express.Router()

//הצגת פרטי חשבון של משתמש ספציפי
router.get("/userId/:id", async (req, res) => {
    let id=req.params.id
    try {
        let data = await UsersBankModel.findOne({id_user:id})
        res.json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הוספת פרטי בנק למשתמש
router.post("/", authToken, async (req, res) => {
    req.body.id_user= req.tokenData._id
    let validBody = validUsersBank(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    let site = new UsersBankModel(req.body)
    site.save()
    res.json(site)
})


//מחיקת פרטי בנק של משתמש
router.delete("/:idDel", authToken, async (req, res) => {
    let idUser= req.params.idDel;
    try {
        let data = await UsersBankModel.deleteOne({ _id:idUser})
        if(data.deletedCount==0){
            return res.status(401).json({msg:"This Bank acount is not found in your"})
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})


//עדכון פרטי בנק של משתמש
router.put("/:idEdit", authToken, async (req, res) => {
    let idBank= req.params.idEdit;
    let idUser=req.tokenData._id
    let validBody = validUsersBank(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    try {
        let data = await UsersBankModel.updateOne({ _id:idBank, id_user:idUser }, req.body)
        if(data.matchedCount==0){
            return res.status(401).json({msg:"This Bank acount is not found in your"})
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})
module.exports = router
