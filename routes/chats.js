const express = require("express")
const { ChatModel, validChat } = require("../models/chatsModel")
const { AdModel } = require("../models/adsModel")
const { authToken } = require("../auth/authToken")
const { UserModel } = require("../models/userModel")
const router = express.Router()


//הצגת תגובות למודעה
router.get("/:id", async (req, res) => {
    let id=req.params.id
    try {
        let data = await ChatModel.find({id_ad:id})  
        const chatPromises = data.map(async (chat) => {
            const user = await UserModel.findOne({ _id: chat.id_invit }, { password: 0 });
            return { ...chat.toObject(), name: user.name };
          });
          const updatedData = await Promise.all(chatPromises);
          res.json(updatedData);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//הוספת תגובה למודעה
router.post("/", authToken, async (req, res) => {
    req.body.id_invit= req.tokenData._id
    let validBody = validChat(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    let site = new ChatModel(req.body)
    site.save()
    res.json(site)
})


//מחיקת תגובה למודעה
router.delete("/:idDel", authToken, async (req, res) => {
    let idChat= req.params.idDel;
    let idInvit=req.tokenData._id
    try {
        let data = await ChatModel.deleteOne({ _id:idChat, id_invit:idInvit })
        if(data.deletedCount==0){
            return res.status(401).json({msg:"This order is not found in your orders"})
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})

module.exports = router
