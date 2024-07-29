const { default: mongoose } = require("mongoose")
const { config } = require("../config/config.js")

exports.db_connection = () => {
    mongoose.connect(config.MONGO_URI).then(() => {
        console.log("Database Connected");
    }).catch(err => console.log("Faild to connect database", err))
}