const express = require("express")
const { AdModel, validAd } = require("../models/adsModel")
const { authToken } = require("../auth/authToken")
const { UserModel } = require("../models/userModel")
const router = express.Router()

//הצגת כל המודעות
router.post("/all", async (req, res) => {
    let perPage = req.query.perPage || 9;
    let page = req.query.page || 1;
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const city = req.body.city;
    const amenities = req.body.amenities;
    try {
        let data = await AdModel
            .find({
                address: { $regex: city, $options: 'i' },
                price: { $gte: minPrice, $lte: maxPrice },
                isActive:true
                // ...amenities.reduce((acc, amenity) => ({ ...acc, [amenity]: true }), {})

            })
            .limit(perPage)
            .skip((page - 1) * perPage)

        const availableAds = data.filter(ad => {
            if (ad.arr_busy_days && ad.arr_busy_days.length > 0) {
                for (const busyDay of ad.arr_busy_days) {
                    const busyEntryDate = new Date(busyDay.entry_date);
                    const busyReleaseDate = new Date(busyDay.release_date);

                    if (
                        (busyEntryDate <= checkIn && checkIn <= busyReleaseDate) ||
                        (busyEntryDate <= checkOut && checkOut <= busyReleaseDate)
                    ) {
                        return false;
                    }
                }
            }

            return true;
        });
        res.json(availableAds)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת כמות המודעות
router.post("/count", async (req, res) => {
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const city = req.body.city;
    try {
        let data = await AdModel.find({ address: { $regex: city, $options: 'i' },
        price: { $gte: minPrice, $lte: maxPrice },isActive:true})
        const availableAds = data.filter(ad => {
            if (ad.arr_busy_days && ad.arr_busy_days.length > 0) {
                for (const busyDay of ad.arr_busy_days) {
                    const busyEntryDate = new Date(busyDay.entry_date);
                    const busyReleaseDate = new Date(busyDay.release_date);

                    if (
                        (busyEntryDate <= checkIn && checkIn <= busyReleaseDate) ||
                        (busyEntryDate <= checkOut && checkOut <= busyReleaseDate)
                    ) {
                        return false;
                    }
                }
            }

            return true;
        });
        res.json(availableAds.length)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת מודעה ספציפית לפי ה-id
router.get("/adId/:id", async (req, res) => {
    let id = req.params.id
    try {
        let data = await AdModel.findOne({ _id: id })
        const userAd = await UserModel.findOne({ _id: data.id_user })
        res.json({ ...data.toObject(), nameOwner: userAd.name, phone: userAd.phone })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//הצגת ימים תפוסים של מודעה ספציפית לפי ה-id
router.get("/busyDate/adId/:id", async (req, res) => {
    let id = req.params.id
    try {
        let data = await AdModel.findOne({ _id: id })
        res.json(data.arr_busy_days)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת ימים תפוסים של מודעה ספציפית לפי ה-id
router.patch("/busyDate/adId/:id", async (req, res) => {
    let id = req.params.id
    try {
        let data = await AdModel.updateOne({ _id: id },{arr_busy_days:req.body.busyDate})
        res.json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת המודעות של משתמש ספציפי
router.get("/userId/:id", async (req, res) => {
    let perPage = req.query.perPage || 9;
    let page = req.query.page || 1;
    let id = req.params.id
    try {
        let data = await AdModel
            .find({ id_user: id })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//הצגת כמות המודעות של משתמש ספציפי
router.get("/count/userId/:id", async (req, res) => {
    let id = req.params.id
    try {
        let data = await AdModel
            .countDocuments({ id_user: id })
        res.json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})



//הוספת מודעה למשתמש
router.post("/", authToken, async (req, res) => {
    req.body.id_user = req.tokenData._id
    let validBody = validAd(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    let site = new AdModel(req.body)
    site.save()
    res.json(site)
})



//מחיקת מודעה של משתמש
router.patch("/:idDel", authToken, async (req, res) => {
    let idAd = req.params.idDel;
    let idUser = req.tokenData._id
    try {
        let data = await AdModel.updateOne({ _id: idAd, id_user: idUser },{isActive:req.body.isActive})
        if (data.matchedCount == 0) {
            return res.status(401).json({ msg: "This ad is not found in your ads" })
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})

//עדכון מודעה של משתמש
router.put("/:idEdit", authToken, async (req, res) => {
    let idAd = req.params.idEdit;
    let validBody = validAd(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    try {
        let data = await AdModel.updateOne({ _id: idAd }, req.body)
        if (data.matchedCount == 0) {
            return res.status(401).json({ msg: "This ad is not found in your ads" })
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})


module.exports = router
