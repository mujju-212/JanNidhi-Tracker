const express = require('express');
const router = express.Router();
const controller = require('../controllers/state.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('state_admin'));

router.get('/dashboard', controller.getDashboard);
router.get('/funds', controller.getReceivedFunds);
router.post('/district/create', controller.createDistrictAdmin);
router.get('/district/all', controller.getAllDistricts);
router.post('/funds/release', controller.releaseFundsToDistrict);
router.get('/transactions', controller.getTransactions);
router.get('/flags', controller.getFlags);
router.post('/scheme/create', controller.createStateScheme);
router.post('/uc/submit', controller.submitUC);
router.post('/matching-fund/release', controller.releaseMatchingFund);

module.exports = router;
