"use strict";

const passport = require("passport");
const ApiGateway = require("moleculer-web");
const User = require("../models/user.model");

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3456,
		ip: "0.0.0.0",
		use: [passport.initialize(), passport.session()],
		routes: [
			{
				path: "/users",
				whitelist: ["**"],
				mergeParams: true,
				authentication: false,
				authorization: false,
				autoAliases: true,

				aliases: {
					"POST health": "$node.health",
					"POST login": "user.login"
				},

				callingOptions: {},
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,
			},
		],

		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
	},

	methods: {
	},
	
	created() {
	},

	started() {
	},

	stopped() {
	},
};
