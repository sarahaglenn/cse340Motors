const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  let grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  if (data.length == 0) {
    grid = `<div class="mainContainer"><p>We don't currently have this in stock. Check back later</p></div>`
    res.render("./inventory/classification", {
      title: "Out of Stock",
      nav,
      grid,
      errors: null
    })
  } else {
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
    })
  }
}

/* ***************************
 *  Build inventory by vehicle details view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryById(inventory_id)
  const main = await utilities.buildVehicleDetail(data)
  const reviewData = await reviewModel.getReviewsByInvId(inventory_id)
  const reviews = await utilities.buildVehicleReviews(reviewData)
  const nav = await utilities.getNav()
  const year = data[0].inv_year
  const make = data[0].inv_make
  const model = data[0].inv_model
  const pageTitle = `${year} ${make} ${model}`
  res.render("./inventory/detail", {
    title: pageTitle,
    nav,
    main,
    reviews,
    inventory_id,
    errors: null,
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildInvManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process add new classification
* *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const addClassificationResult = await invModel.addNewClassification(
    classification_name
  )

  if (addClassificationResult) {
    req.flash(
      "notice",
      `${classification_name} has been added to classifications.`
    )
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect: await utilities.buildClassificationList(),
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the classification could not be added.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const selectList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    selectList,
    errors: null,
  })
}

/* ****************************************
*  Process add new inventory
* *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const selectList = await utilities.buildClassificationList(classification_id)

  const addInventoryResult = await invModel.addNewInventory(
    inv_make, inv_model, inv_year, inv_description, inv_image.replaceAll("&#x2F;", "/"), inv_thumbnail.replaceAll("&#x2F;", "/"), inv_price, inv_miles, inv_color, classification_id
  )

  if (addInventoryResult) {
    req.flash(
      "notice",
      `${inv_make} ${inv_model} has been added to inventory.`
    )

    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect: await utilities.buildClassificationList(),
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the inventory item could not be added.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      selectList,
      errors,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classificationId)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  const nav = await utilities.getNav()
  const vehicleData = (await invModel.getInventoryById(inventory_id))[0]
  const selectList = await utilities.buildClassificationList(vehicleData.classification_id)
  res.render("./inventory/edit-inventory", {
    title: `Edit ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    selectList,
    errors: null,
    inv_id: vehicleData.inv_id,
    inv_make: vehicleData.inv_make,
    inv_model: vehicleData.inv_model,
    inv_year: vehicleData.inv_year,
    inv_description: vehicleData.inv_description,
    inv_image: vehicleData.inv_image,
    inv_thumbnail: vehicleData.inv_thumbnail,
    inv_price: vehicleData.inv_price,
    inv_miles: vehicleData.inv_miles,
    inv_color: vehicleData.inv_color,
    classification_id: vehicleData.classification_id
  })
}

/* ****************************************
*  Process updating inventory
* *************************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const selectList = await utilities.buildClassificationList(classification_id)

  const updateResult = await invModel.updateInventory(
    inv_id, inv_make, inv_model, inv_year, inv_description, inv_image.replaceAll("&#x2F;", "/"), inv_thumbnail.replaceAll("&#x2F;", "/"), inv_price, inv_miles, inv_color, classification_id
  )

  if (updateResult) {
    req.flash(
      "notice",
      `The ${inv_make} ${inv_model} was successfully updated.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the inventory item could not be updated.")
    res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      selectList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation inventory view
 * ************************** */
invCont.buildDeleteInv = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  const nav = await utilities.getNav()
  const vehicleData = (await invModel.getInventoryById(inventory_id))[0]
  res.render("./inventory/delete-confirm", {
    title: `Delete ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    errors: null,
    inv_id: vehicleData.inv_id,
    inv_make: vehicleData.inv_make,
    inv_model: vehicleData.inv_model,
    inv_year: vehicleData.inv_year,
    inv_price: vehicleData.inv_price,
  })
}

/* ****************************************
*  Process deleting inventory
* *************************************** */
invCont.deleteInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const inv_id= parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash(
      "notice",
      `The item was successfully deleted.`
    )
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the inventory item could not be deleted.")
    res.status(501).render("inventory/delete-confirm", {
      title: `Delete ${deleteResult.inv_make} ${deleteResult.inv_model}`,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price
    })
  }
}

module.exports = invCont