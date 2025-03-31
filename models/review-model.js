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
* Return review data using account_id
* ***************************** */
async function getReviewsByAccountId (account_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM review AS r JOIN inventory AS i ON r.inv_id = i.inv_id WHERE r.account_id = $1',
      [account_id])

    if (result && result.rows.length > 0) {
      return result.rows
    }
    return []
  } catch (error) {
    return new Error("No matching account id found")
  }
}

/* *****************************
* Return review data using review_id
* ***************************** */
async function getReviewById (review_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM review WHERE review_id = $1',
      [review_id])
    if (result.rows.length > 0) {
      return result.rows
    }
    return
  } catch (error) {
    return new Error("No matching review id found")
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

/* *****************************
*   Update account details
* *************************** */
async function updateReview(review_id, review_text){
  try {
    const sql = `UPDATE public.review
      SET review_text=$1
      WHERE review_id=$2
      RETURNING *`
    return await pool.query(sql, [review_text, review_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Delete review
* *************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM public.review WHERE review_id = $1"
    const result = await pool.query(sql, [review_id])
    return  result
  } catch (error) {
    console.error("Error deleting review:", error)
    return null
  }
}


module.exports = {
    getReviewsByInvId,
    createReview,
    getReviewsByAccountId,
    getReviewById,
    updateReview,
    deleteReview
}