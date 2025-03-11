// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const util = require("../utilities")
const regValidate = require("../utilities/account-validation")

// Default route - account management
router. get("/", util.checkLogin, util.getUserData, util.handleErrors(accountController.buildAccountManagement))

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

// Route to build update account view
router.get("/update/:account_id",
    util.handleErrors(accountController.buildAccountUpdate))

// Route to update account information
router.post("/update",
    regValidate.updateAccountRules(),
    regValidate.checkUpdateData,
    util.handleErrors(accountController.updateAccountDetails))

// Route to change password
router.post("/updatePassword",
    regValidate.updatePasswordRules(),
    regValidate.checkUpdateData,
    util.handleErrors(accountController.changePassword))

module.exports = router;