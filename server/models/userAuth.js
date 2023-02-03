const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
});

const UserAuth = mongoose.model("UserAuth", authSchema);

module.exports = UserAuth;