const express = require('express');
const {
  createSwap,
  getSwaps,
  getSwap,
  getMySwaps,
  updateStatus,
  addFeedback,
  deleteSwap,
} = require('../controllers/swapController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createSwapSchema,
  updateStatusSchema,
  feedbackSchema,
} = require('../validators/swapValidator');

const router = express.Router();

router.use(protect);

router.post('/', validate(createSwapSchema), createSwap);
router.get('/', getSwaps);
router.get('/my', getMySwaps);
router.get('/:id', getSwap);
router.patch('/:id/status', validate(updateStatusSchema), updateStatus);
router.post('/:id/feedback', validate(feedbackSchema), addFeedback);
router.delete('/:id', deleteSwap);

module.exports = router;
