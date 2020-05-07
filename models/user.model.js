let mongoose = require("mongoose");
let Schema = mongoose.Schema;

// Define our user schema
let UserSchema = new Schema({
	username: String,
	password: String,
	email: String,
});

module.exports = mongoose.model("User", UserSchema);
