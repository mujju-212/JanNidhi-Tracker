const express = require('express');
const router = express.Router();
const controller = require('../controllers/public.controller');

router.get('/stats', controller.getNationalStats);
router.get('/fund-flow', controller.getFundFlow);
router.get('/schemes', controller.getPublicSchemes);
router.get('/scheme/:id', controller.getPublicSchemeDetail);
router.get('/verify/:txHash', controller.verifyTransaction);
router.get('/flags/stats', controller.getPublicFlagStats);

module.exports = router;
