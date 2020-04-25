let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// Define our user schema
let UserSchema = new Schema({
	username: String,
	password: String,
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("UserSchema", UserSchema);
