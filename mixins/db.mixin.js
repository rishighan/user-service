const path = require("path");
const mkdir = require("mkdirp").sync;
const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongoose");

module.exports = (collection, model)  => {
	if(process.env.MONGO_URI) {
		return {
			mixins: [DbService],
			adapter: new MongoAdapter(process.env.MONGO_URI, {
				user: process.env.MONGO_INITDB_ROOT_USERNAME,
				pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
				keepAlive: true,
			}),
			model: model,
			collection    
		};
	} 
	mkdir(path.resolve("./data"));
};