const mongoose = require('mongoose');

const { config } = require("../config/secret")

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(`mongodb+srv://waseem1277:waseem123@cluster0.9worvjd.mongodb.net/maorsProject`);
  // await mongoose.connect(`mongodb+srv://${config.userDB}:${config.passDB}@cluster0.9worvjd.mongodb.net/maorsProject`);
  console.log("'waseem&haitham' : mongo connect 24")
}