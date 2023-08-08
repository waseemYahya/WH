const express = require("express")
const { AdsLikeModel, validAdsLike } = require("../models/adsLikesModel")
const { AdModel } = require("../models/adsModel")
const { authToken } = require("../auth/authToken")
const router = express.Router()


//הצגת מודעות שמורות של משתמש ספציפי
router.get("/", authToken, async (req, res) => {
    let perPage = req.query.perPage || 4;
    let page = req.query.page || 1;
    let id = req.tokenData._id
    try {
        let data = await AdsLikeModel.find({ id_user: id })
            .limit(perPage)
            .skip((page - 1) * perPage);
        const AddPromises = data.map(async (ad) => {
            const detailsAd = await AdModel.findOne({ _id: ad.id_ad,isActive:true });
            return { ...detailsAd.toObject(), note: ad.note };
        });
        const updatedData = await Promise.all(AddPromises);
        res.json(updatedData);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//הצגת כל המודעות עם שדה של אהבתי למשתמש ספציפי
router.post("/myLike/:id", authToken, async (req, res) => {
    let perPage = req.query.perPage || 9;
    let page = req.query.page || 1;
    let id = req.params.id
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const city = req.body.city;
    const amenities = req.body.amenities;
    try {
        let data = await AdModel.find({
            address: { $regex: city, $options: 'i' },
            price: { $gte: minPrice, $lte: maxPrice },
            isActive:true
        })
            .limit(perPage)
            .skip((page - 1) * perPage);
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
        const AddPromises = availableAds.map(async (ad) => {
            const like = await AdsLikeModel.find({ id_user: id, id_ad: ad._id }).count();
            if (like > 0) {
                return { ...ad.toObject(), like: true };
            }
            return { ...ad.toObject(), like: false };
        });
        const updatedData = await Promise.all(AddPromises);
        console.log(updatedData);

        res.json(updatedData);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הצגת כמות המודעות שאהבתי למשתמש ספציפי
router.get("/count", authToken, async (req, res) => {
    let idUser = req.tokenData._id
    try {
        let data = await AdsLikeModel.countDocuments({ id_user: idUser })
        res.json(data)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//הוספת מודעה שמורה למשתמש
router.post("/", authToken, async (req, res) => {
    req.body.id_user = req.tokenData._id
    let validBody = validAdsLike(req.body)
    if (validBody.error) {
        return res.status(404).json(validBody.error.details)
    }
    let site = new AdsLikeModel(req.body)
    site.save()
    res.json(site)
})


//מחיקת מודעה שמורה של משתמש
router.delete("/:idDel", authToken, async (req, res) => {
    let idAd = req.params.idDel;
    let idUser = req.tokenData._id
    try {
        let data = await AdsLikeModel.deleteOne({ id_ad: idAd, id_user: idUser })
        if (data.deletedCount == 0) {
            return res.status(401).json({ msg: "This ad is not found in your ads" })
        }
        res.json(data)
    } catch (err) {
        console.log(err);
        res.status(400).send(err)

    }
})

// שינוי הפתק שהשארנו על המודעה
router.patch("/changeNote/:id", authToken, async (req, res) => {
    try {
        let id = req.params.id
        let idUser = req.tokenData._id
        let data = await AdsLikeModel.updateOne({ id_ad: id, id_user: idUser }, { note: req.body.note })
        if (data.matchedCount == 0) {
            return res.status(401).json({ msg: "This ad is not found in your ads" })
        }
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

module.exports = router

