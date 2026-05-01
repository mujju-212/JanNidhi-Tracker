const express = require('express');
const router = express.Router();
const controller = require('../controllers/citizen.controller');
const { protectCitizen } = require('../middleware/auth.middleware');

router.post('/verify-aadhaar', controller.verifyAadhaar);
router.post('/verify-otp', controller.verifyCitizenOTP);
router.get('/my-benefits', protectCitizen, controller.getMyBenefits);
router.get('/payment-journey/:schemeId', protectCitizen, controller.getPaymentJourney);
router.post('/complaint', protectCitizen, controller.raiseComplaint);
router.get('/complaint/:id', protectCitizen, controller.getComplaintStatus);

module.exports = router;
