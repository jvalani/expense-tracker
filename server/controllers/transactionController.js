const Transaction = require('../models/Transaction');

const allowedTypes = ['income', 'expense'];

const buildPayload = (body) => ({
  type: body.type,
  amount: Number(body.amount),
  category: body.category?.trim(),
  date: body.date ? new Date(body.date) : new Date(),
  note: body.note?.trim() || '',
});

const validateTransaction = ({ type, amount, category, date }) => {
  if (!type || !allowedTypes.includes(type)) {
    return 'Transaction type must be either income or expense.';
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Amount must be a number greater than 0.';
  }

  if (!category) {
    return 'Category is required.';
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Please provide a valid transaction date.';
  }

  return null;
};

exports.getTransactions = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    const { type, category } = req.query;

    if (type && allowedTypes.includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validateTransaction(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const transaction = await Transaction.create({
      ...payload,
      userId: req.user.id,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction.' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validateTransaction(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      payload,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction.' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
};
