const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAssetSchema } = require('../validators/assetValidator');
const { getAssets, createAsset } = require('../controllers/assetController');

const router = express.Router();

router.use(protect);

router.get('/', getAssets);
router.post('/', validate(createAssetSchema), createAsset);

module.exports = router;
