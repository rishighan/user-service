"use strict";

const DBService = require("../mixins/db.mixin");
const User = require("../models/user.model");
const passport = require("passport");

module.exports = {
	name: "user",
	mixins: [DBService("userschemas", User)],
	settings: {},
	dependencies: [],
	actions: {
		register: {
			params: { username: "string" },
			handler(broker) {
				User.register(
					new User({ username: broker.params.username }),
					broker.params.password,
					(err, account) => {
						if (err) {
							return { error: new Error(err, account) };
						}
						passport.authenticate("local")(null, null, () => {
							return { status: "User successfully registered." };
						});
					}
				);
			},
		},
		login: {
			handler(ctx) {
				console.log(ctx.meta)
				passport.authenticate("local", (error, user, info) => {
					console.log("here");
				});
				
			},
		},
		jagan: {
			handler(ctx) {
				return "goo";	
			}
		}
	},
	events: {},
	methods: {},
	created() {},
	async started() {},
	async stopped() {},
};
