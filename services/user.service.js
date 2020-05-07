"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DBService = require("../mixins/db.mixin");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
	name: "user",
	mixins: [DBService("users", User)],
	settings: {
		JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret",
		fields: ["_id", "username", "email"],
		entityValidator: {
			username: { type: "string", min: 2 },
			password: { type: "string", min: 6 },
			email: { type: "email" },
		},
	},
	dependencies: [],
	actions: {
		register: {
			params: {
				user: { type: "object" }
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				await this.validateEntity(entity);
				if (entity.username) {
					const found = await this.adapter.findOne({ username: entity.username });
					if (found)
						throw new MoleculerClientError("Username exists!", 422, "", [{ field: "username", message: "already exists." }]);
				}

				if (entity.email) {
					const found = await this.adapter.findOne({ email: entity.email });
					if (found)
						throw new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist" }]);
				}

				entity.password = bcrypt.hashSync(entity.password, 10);
				entity.createdAt = new Date();

				const doc = await this.adapter.insert(entity);
				const user = await this.transformDocuments(ctx, {}, doc);
				const json = await this.transformEntity(user, true, ctx.meta.token);
				await this.entityChanged("created", json, ctx);
				return json;
			}
		},
		login: {
			handler(ctx) {
				console.log("login");
			},
		},
		status: {
			handler(ctx) {
				if (!ctx.options.parentCtx.params.req.isAuthenticated()) {
					ctx.meta.$statusCode = 200;
					return { status: false };
				}
				ctx.meta.$statusCode = 200;
				return {
					status: true,
					user: ctx.options.parentCtx.params.req.user.username,
				};
			},
		},
		logout: {
			handler(ctx) {
				ctx.options.parentCtx.params.req.logout();
				ctx.meta.$statusCode = 200;
				return { status: "Bye everyone!" };
			},
		},
	},
	events: {},
	methods: {
		/**
		 * Generate a JWT token from user entity
		 *
		 * @param {Object} user
		 */
		generateJWT(user) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign({
				id: user._id,
				username: user.username,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},

		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 * @param {Boolean} withToken
		 */
		transformEntity(user, withToken, token) {
			if (user) {
				if (withToken)
					user.token = token || this.generateJWT(user);
			}
			return { user };
		},
	},
	created() {},
	async started() {},
	async stopped() {},
};
