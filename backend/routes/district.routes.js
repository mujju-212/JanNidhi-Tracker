const express = require('express');
const router = express.Router();
const controller = require('../controllers/district.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('district_admin'));

router.get('/dashboard', controller.getDashboard);
router.get('/funds', controller.getReceivedFunds);
router.post('/verify-aadhaar', controller.verifyAadhaar);
router.post('/beneficiary/add', controller.addBeneficiary);
router.get('/beneficiaries', controller.getBeneficiaries);
router.get('/beneficiary/check-duplicate', controller.checkDuplicate);
router.post('/payment/trigger', controller.triggerPayment);
router.get('/payments', controller.getPayments);
router.get('/complaints', controller.getComplaints);
router.get('/flags', controller.getFlags);

module.exports = router;
