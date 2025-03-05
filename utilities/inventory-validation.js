const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
   return [
    // name is required and must be a string containing only letters, no spaces, and the first letter is capitalized
    body("classification_name")
       .trim()
       .escape()
       .isLength({ min: 3 })
       .withMessage("Classification name is required.")
       .bail()
       .matches(/^[A-Z][a-zA-Z]*$/)
       .withMessage("Please provide a valid classification name.")
    ]
}

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
  *  Add Inventory Data Validation Rules
  * ********************************* */
validate.vehicleRules = () => {
   return [
    // vehicle classification is required
    body("classification_id")
        .isInt()
        .withMessage("Classification is required."),

    // make of vehicle is required, min 3 characters, all letters
    body("inv_make")
       .trim()
       .escape()
       .isLength({ min: 2 })
       .withMessage("Please provide valid vehicle make")
       .bail()
       .matches(/^[A-Z][a-zA-Z]*$/)
       .withMessage("Please provide the vehicle make."),

    // model of vehicle is required, min 3 characters, all letters or numbers
    body("inv_model")
       .trim()
       .escape()
       .isLength({ min: 3 })
       .withMessage("Please provide valid vehicle model")
       .bail()
       .matches(/^[A-Z][a-zA-Z0-9]*$/)
       .withMessage("Please provide the vehicle model."),

    // last name is required and must be string
    body("inv_year")
       .trim()
       .escape()
       .isLength(4)
       .withMessage("Please provide a valid year.")
       .bail()
       .isInt()
       .withMessage("Please provide a valid year."),

    // description is required
    body("inv_description")
     .trim()
     .escape()
     .notEmpty()
     .withMessage("Description is required."),

    // img filepath is required
    body("inv_image")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Image filepath is required.")
        .bail()
        .custom(value => {
            const decodedValue = value.replace(/&#x2F;/g, '/');
            if (!/^\/images\/vehicles\/[\w\d-]+(\.[a-zA-Z]+)$/.test(decodedValue)) {
                throw new Error("Image filepath must be in the format: \"/images/vehicles/car.png\"");
            }
            return true;
        }),

    // img thumbnail filepath is required
    body("inv_thumbnail")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Thumbnail filepath is required.")
        .bail()
        .custom(value => {
            const decodedValue = value.replace(/&#x2F;/g, '/');
            if (!/^\/images\/vehicles\/[\w\d-]+(\.[a-zA-Z]+)$/.test(decodedValue)) {
                throw new Error("Thumbnail filepath must be in the format: \"/images/vehicles/car.png\"");
            }
            return true;
        }),

    // price is required, can be int or decimal
    body("inv_price")
       .trim()
       .isCurrency()
       .bail()
       .withMessage("Please enter the price."),

    // mileage is required, must be int
    body("inv_miles")
       .trim()
       .notEmpty()
       .withMessage("Please enter the mileage.")
       .bail()
       .isInt()
       .withMessage("Please enter valid mileage."),

    // color is required, text
    body("inv_color")
       .trim()
       .isLength(3)
       .withMessage("Please enter valid color.")
       .bail()
       .matches(/^[a-zA-Z]/)
       .withMessage("Please enter valid color."),
    ]
}

/* ******************************
 * Check vehicle data and return errors or continue to add inventory
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  const selectList = await utilities.buildClassificationList(classification_id)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      selectList,
      inv_make, inv_model,
      inv_year, inv_description, inv_image,
      inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id,
    })
    return
  }
  next()
}

/* ******************************
 * Check vehicle data and return errors or continue to edit inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  const selectList = await utilities.buildClassificationList(classification_id)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/edit-inventory", {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      selectList,
      inv_id,
      inv_make, inv_model,
      inv_year, inv_description, inv_image,
      inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id,
    })
    return
  }
  next()
}

module.exports = validate