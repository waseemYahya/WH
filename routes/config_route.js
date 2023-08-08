const usersR=require("./users")
const adsR=require("./ads")
const adsLikesR=require("./adsLikes")
const userBankR=require("./usersBanks")
const chatsR=require("./chats")
const ordersR=require("./orders")



exports.routesInit=(app)=>{
    app.use("/users",usersR)
    app.use("/ads",adsR)
    app.use("/adsLikes",adsLikesR)
    app.use("/userBanks",userBankR)
    app.use("/chats",chatsR)
    app.use("/orders",ordersR)



}
