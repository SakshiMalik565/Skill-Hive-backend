const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAssetSchema } = require('../validators/assetValidator');
const { getAssets, getMyAssets, createAsset } = require('../controllers/assetController');
const assetUpload = require('../middlewares/assetUpload');

const router = express.Router();

router.use(protect);

router.get('/', getAssets);
router.get('/my', getMyAssets);
router.post(
	'/',
	assetUpload.fields([
		{ name: 'photos', maxCount: 5 },
		{ name: 'videos', maxCount: 3 },
	]),
	validate(createAssetSchema),
	createAsset
);

module.exports = router;
