const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//collection is a group of documents
//documents have the actual data
//creating the document schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    stats: {
        type: Object,
        required: true
    }
}, {timestamps: true});

//making a model
//it pluralises user so itll look for users
const User = mongoose.model("User", userSchema);

module.exports = User;