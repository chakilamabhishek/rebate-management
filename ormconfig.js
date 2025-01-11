const { DataSource } = require("typeorm");
const RebateProgram = require("./src/models/RebateProgram");
const Transaction = require("./src/models/Transaction");
const RebateClaim = require("./src/models/RebateClaim");
const config = require('./src/config');

const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    synchronize: true, // Disable synchronize in production
    logging: false,
    entities: [RebateProgram, Transaction, RebateClaim],
    // todo: Before moving to production, you should disable synchronize and use migrations
    // migrations: ["./src/migrations/*.js"], // Path to your migrations
    // cli: {
    //     migrationsDir: "./src/migrations"
    // }
});


module.exports = { AppDataSource };
