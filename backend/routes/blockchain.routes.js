const express = require('express');
const router = express.Router();
const blockchainService = require('../controllers/blockchain.controller');

// Public verification — no auth needed (anyone can verify on blockchain)
router.get('/ministry/:wallet', blockchainService.verifyMinistry);
router.get('/transaction/:txId', blockchainService.verifyTransaction);
router.get('/scheme/:schemeId', blockchainService.verifyScheme);
router.get('/payment/:paymentId', blockchainService.verifyPayment);
router.get('/enrollment/:aadhaarHash', blockchainService.verifyEnrollment);
router.get('/flag/:flagId', blockchainService.verifyFlag);
router.get('/balance/:wallet', blockchainService.getBalance);

module.exports = router;
