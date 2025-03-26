const pool = require("../database/")


/* *****************************
* Return review data using inv_id
* ***************************** */
async function getReviewsByInvId (inv_id) {
  try {
    const result = await pool.query(
      'SELECT review_text, review_date, account_id FROM review WHERE inv_id = $1',
      [inv_id])
    return result.rows
  } catch (error) {
    return new Error("No matching inv id found")
  }
}

/* *****************************
* Add a new review
* ***************************** */
async function createReview (account_id, inv_id, review_text) {
  try {
    const sql = "INSERT INTO public.review (review_text, inv_id, account_id) VALUES ($1, $2, $3) returning *"
    return await pool.query(sql, [review_text, inv_id, account_id])
  } catch (error) {
    return error.message
  }
}


module.exports = {
    getReviewsByInvId,
    createReview
}