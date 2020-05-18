"use strict";
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;
const _ = require("lodash");


module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3456,
		ip: "0.0.0.0",
		use: [],
		cors: {
			origin: "*",
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			allowedHeaders: [],
			exposedHeaders: [],
			credentials: false,
			maxAge: 3600
		},
		routes: [
			{
				path: "/api",
				whitelist: ["**"],
				mergeParams: true,
				authentication: false,
				authorization: true,
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
			"POST health": "$node.health",
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

	methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			let user;
			if (token) {
				// Verify JWT token
				try {
					user = await ctx.call("user.resolveToken", { token });
					console.log(user);
					if (user) {
						this.logger.info(
							"Authenticated via JWT: ",
							user.username
						);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, [
							"_id",
							"username",
							"email",
						]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}

			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		},
	},

	created() {},

	started() {},

	stopped() {},
};
