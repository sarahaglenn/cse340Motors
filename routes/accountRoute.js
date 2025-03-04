// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const util = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Default route - account management
router. get("/", util.checkLogin, util.handleErrors(accountController.buildAccountManagement))

// Route to build login page
router.get("/login", util.handleErrors(accountController.buildLogin))

// Route to process login attempt
router.post("/login", 
    regValidate.loginRules(),
    regValidate.checkLogData,
    util.handleErrors(accountController.accountLogin))

// Route to build registration page
router.get("/register", util.handleErrors(accountController.buildRegister))

// Route to register new account
router.post("/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    util.handleErrors(accountController.registerAccount))

module.exports = router;