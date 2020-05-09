"use strict";

const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3456,
		ip: "0.0.0.0",
		use: [
		],
		routes: [
			{
				path: "/api",
				whitelist: ["**"],
				mergeParams: true,
				authentication: false,
				authorization: false,
				autoAliases: false,

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
		aliases: {
			"POST /user/health": "$node.health",
			"POST /user/register": "user.register",	
			"POST login": "user.login",
			"GET /user/me": "user.me",
			"PUT /user/update": "user.updateMyself",
			"GET logout": "user.logout",
		},
		

		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
	},

	methods: {},

	created() {},

	started() {},

	stopped() {},
};
