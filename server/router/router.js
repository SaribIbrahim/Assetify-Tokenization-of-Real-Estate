const express = require("express");
const bodyParser = require("body-parser");
const { admin_register, changePassword, admin_login, sendOTP, VarifyOTP, forgotPassword } = require("../controller/userauthentication_Controller");
const propertyRoutes = require("../controller/PropertyController");
const salePropertyRoutes = require("../controller/SalePropertyController");

// import router

const router = express.Router();
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());



router.route("/admin_register").post(admin_register)
router.route("/admin_login").post(admin_login)
router.route("/changePassword/:email").post(changePassword)
router.route("/sendOTP").post(sendOTP)
router.route("/VarifyOTP").post(VarifyOTP)
router.route("/forgotPassword/:email").post(forgotPassword)

router.use("/property", propertyRoutes);
router.use("/sale", salePropertyRoutes);




module.exports = router;