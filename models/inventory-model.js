const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getClassificationsById error " + error)
  }
}

/* ***************************
 *  Get a single vehicle by inventory_id
 * ************************** */
async function getInventoryById(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1`,
      [inventory_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryById error " + error)
  }
}
/* *****************************
*   Add new classification
* *************************** */
async function addNewClassification(classification_name){
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Add new inventory item
* *************************** */
async function addNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id){
  try {
    const sql = "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    const result = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
    if (result.rows.length > 0) {
      return result.rows[0]
    } else {
      return null
    }
  } catch (error) {
    console.error("Error adding inventory:", error)
    return null
  }
}

/* *****************************
*   Update inventory item
* *************************** */
async function updateInventory(
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
    classification_id){
  try {
    const sql = "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const result = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id])
    if (result.rows.length > 0) {
      return result.rows[0]
    } else {
      return null
    }
  } catch (error) {
    console.error("Error updating inventory:", error)
    return null
  }
}

/* *****************************
*   Delete inventory item
* *************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return  result
  } catch (error) {
    console.error("Error deleting inventory:", error)
    return null
  }
}

module.exports = {getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addNewClassification,
  addNewInventory,
  updateInventory,
  deleteInventory,
}