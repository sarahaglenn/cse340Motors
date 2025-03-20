// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const util = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management page
router.get("/",
    util.checkAccountType,
    util.handleErrors(invController.buildInvManagement));

// Route to build add classification page
router.get("/add-classification",
    util.checkAccountType,
    util.handleErrors(invController.buildAddClassification));

// Route to add new classification to database
router.post("/add-classification",
    util.checkAccountType,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    util.handleErrors(invController.addClassification))

// Route to build add inventory page
router.get("/add-inventory",
    util.checkAccountType,
    util.handleErrors(invController.buildAddInventory));

// Route to add new inventory to database
router.post("/add-inventory",
    util.checkAccountType,
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    util.handleErrors(invController.addInventory))

// Route to build inventory by classification view
router.get("/type/:classificationId",
    util.handleErrors(invController.buildByClassificationId));

// Route to get a single vehicle by detail view
router.get("/detail/:inventoryId",
    util.handleErrors(invController.buildByInventoryId));

// Route to view vehicle edit page
router.get("/edit/:inventory_id",
    util.checkAccountType,
    util.handleErrors(invController.buildEditInventory))

// Route to update inventory in database
router.post("/editInv",
    util.checkAccountType, 
    invValidate.vehicleRules(),
    invValidate.checkUpdateData,
    util.handleErrors(invController.updateInventory))

// Route to get delete view
router.get("/delete/:inventory_id",
    util.checkAccountType,
    util.handleErrors(invController.buildDeleteInv))

// Route to process deleting from inventory
router.post("/delete",
    util.checkAccountType,
    util.handleErrors(invController.deleteInventory)
)

// Route to get inventory list
router.get("/getInventory/:classificationId",
    util.handleErrors(invController.getInventoryJSON))

// Intentional error route
router.get("/cars",
    util.handleErrors(invController.buildByClassificationId))

module.exports = router;