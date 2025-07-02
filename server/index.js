const express = require("express");
const cors = require("cors");
// import db connection
const dbConnection = require("./connection/db")
// import router
const router = require("./router/router");
const path = require("path");
require('dotenv').config()
const app = express();
app.use(cors());
app.use( router)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get('/', async (req, res) => {
    try {
        res.status(200).send("Server running fine 🏃‍♂️")

    } catch (error) {
        console.error("error while get user", error);
    }
}
)
let PATH = process.env.PORT || 3344;
let server = app.listen(PATH, () => {
    dbConnection();
    console.log(`Marketplace server listening at http://localhost:${PATH}`);
})
process.on('unhandledRejection', error => {
    console.log(error.message);
    server.close(() => process.exit(1));
});