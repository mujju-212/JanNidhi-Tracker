const express = require('express');
const router = express.Router();
const controller = require('../controllers/ministry.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('ministry_admin'));

router.get('/dashboard', controller.getDashboard);
router.get('/budget', controller.getReceivedBudget);
router.post('/scheme/create', controller.createScheme);
router.get('/scheme/all', controller.getAllSchemes);
router.get('/scheme/:id', controller.getSchemeById);
router.post('/state/create', controller.createStateAdmin);
router.get('/state/all', controller.getAllStates);
router.post('/funds/release', controller.releaseFundsToState);
router.get('/transactions', controller.getTransactions);
router.get('/flags', controller.getFlags);
router.get('/reports', controller.getReports);

module.exports = router;
