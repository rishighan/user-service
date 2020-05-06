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
				return new Promise((resolve, reject) => {
					passport.authenticate("local", (err, user, info) => {
						if (err) {
							reject(new Error(err));
						}

						if (!user) {
							ctx.meta.$statusCode = 401;
							reject({ status: "Invalid credentials" });
						}

						ctx.options.parentCtx.params.req.logIn(
							user,
							err,
							() => {
								if (err) {
									ctx.meta.$statusCode = 500;
									reject({ status: "Could not login user" });
								}
								ctx.meta.$statusCode = 200;
								resolve({ status: "Login successful" });
							}
						);
					})(
						ctx.options.parentCtx.params.req,
						ctx.options.parentCtx.params.res,
						() => {
							console.log("Inside user.login's callback");
						}
					);
				});
			},
		},
	},
	events: {},
	methods: {},
	created() {},
	async started() {},
	async stopped() {},
};
