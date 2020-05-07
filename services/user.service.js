"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DBService = require("../mixins/db.mixin");
const User = require("../models/user.model");
const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = {
	name: "user",
	mixins: [DBService("userschemas", User)],
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
	methods: {},
	created() {},
	async started() {},
	async stopped() {},
};
