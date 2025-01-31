// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const util = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", util.handleErrors(invController.buildByClassificationId));

// Route to get a single vehicle by detail view
router.get("/detail/:inventoryId", util.handleErrors(invController.buildByInventoryId));

// Intentional error route
router.get("/cars", util.handleErrors(invController.buildByClassificationId))

module.exports = router;