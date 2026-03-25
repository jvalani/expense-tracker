const express = require('express');

const auth = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(auth);

router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
