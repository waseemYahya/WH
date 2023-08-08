const express = require("express")
const { UserModel, validUser, validLogin, getToken, validUserUpdate, validNewPassword } = require("../models/userModel")
const bcrypt = require("bcrypt")
const router = express.Router()
const jwt = require("jsonwebtoken");
const { authToken } = require("../auth/authToken")


//הצגת כל המשתמשים- רק מנהל יכול לצפות
router.get("/all", authToken, async (req, res) => {
    if (req.tokenData.role == "admin") {
        let data = await UserModel.find({})
        res.json(data)
    } else {
        return res.status(401).json({ msg: "Only an administrator can view the user list" })
    }

})

//הוספת משתמש
router.post("/", async (req, res) => {
    let validBody = validUser(req.body)
    if (validBody.error) {
        res.status(404).json(validBody.error.details)
    }

    try {
        let user = new UserModel(req.body)
        user.password = await bcrypt.hash(user.password, 10)
        await user.save()
        user.password = "******"
        res.json(user)

    } catch (err) {
        console.log(err);
        res.status(400).send({ err: "כתובת האימייל שרשמת כבר רשומה אצלינו במערכת!" })

    }
})


//מחיקת משתמש- מנהל יכול את כולם ומשתמש יכול רק את עצמו
router.delete("/:idDel", authToken, async (req, res) => {
    let data;
    try {
        if (req.tokenData.role == "admin") {
            data = await UserModel.deleteOne({ _id: req.params.idDel })
        }
        else if (req.params.idDel == req.tokenData._id) {
            data = await UserModel.deleteOne({ _id: req.params.idDel })

        }
        else {
            return res.status(401).json({ msg: "You cannot delete a user who is not you" })
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})

//עדכון משתמש- מנהל יכול את כולם ומשתמש יכול רק את עצמו
router.put("/:idEdit", authToken, async (req, res) => {
    let validBody = validUserUpdate(req.body)
    let data;
    // req.body.password=await bcrypt.hash(req.body.password, 10)
    if (validBody.error) {
        res.status(404).json(validBody.error.details)
    }
    try {
        if (req.tokenData.role == "admin") {
            data = await UserModel.updateOne({ _id: req.params.idEdit }, req.body)
        }
        else if (req.params.idEdit == req.tokenData._id) {
            data = await UserModel.updateOne({ _id: req.params.idEdit }, req.body)
        }
        else {
            return res.status(401).json({ msg: "You cannot update a user who is not you" })
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})


//כניסת משתמש למערכת
router.post("/login", async (req, res) => {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
        return res.status(401).json({ msg: "user not found" })
    }
    let passValid = await bcrypt.compare(req.body.password, user.password)
    if (!passValid) {
        return res.status(401).json({ msg: "password wrong" })
    }

    let newToken = getToken(user.id, user.role);
    return res.json({ your_token: newToken, your_name: user.name })

})


//הצגת פרטי משתמש
router.get("/myInfo", authToken, async (req, res) => {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(user)

})

//בדיקת חשבון באמצעות אימייל
router.post("/confirmAccount", async (req, res) => {
    let user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
        return res.status(401).json({ msg: "user not found" })
    }
    return res.json({ name: user.name, email: user.email })
})

router.patch("/changePassword", async (req, res) => {
    try {
        let validBody = validNewPassword(req.body)
        if (validBody.error) {
            res.status(404).json(validBody.error.details)
        }
        req.body.password = await bcrypt.hash(req.body.password, 10)
        let data = await UserModel.updateOne({ email: req.body.email }, { password: req.body.password })
        if (data.matchedCount == 0) {
            return res.status(401).json({ msg: "this email not found" })
        }
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


module.exports = router