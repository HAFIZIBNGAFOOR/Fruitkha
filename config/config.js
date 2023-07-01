require("dotenv").config();
const sessionSecret = "mysitesessionsecret";
const YOUR_KEY_ID  = process.env.SECRET_KEY_ID
const YOUR_KEY_SECRET = process.env.SECRET_KEY

const emailUser = process.env.emailUser;
const emailPassword = process.env.emailPassword;
module.exports={sessionSecret,YOUR_KEY_SECRET,YOUR_KEY_ID ,emailUser,emailPassword};