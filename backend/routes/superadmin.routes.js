const express = require('express');
const router = express.Router();
const controller = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('super_admin'));

router.get('/dashboard', controller.getDashboard);
router.post('/ministry/create', controller.createMinistry);
router.get('/ministry/all', controller.getAllMinistries);
router.get('/ministry/:id', controller.getMinistryById);
router.post('/budget/allocate', controller.allocateBudget);
router.get('/budget/history', controller.getBudgetHistory);
router.post('/cag/create', controller.createCAGAccount);
router.get('/transactions', controller.getAllTransactions);
router.get('/flags', controller.getAllFlags);
router.get('/users', controller.getManagedUsers);
router.get('/schemes', controller.getAllSchemes);
router.get('/settings', controller.getSystemSettings);
router.put('/settings', controller.updateSystemSettings);

module.exports = router;
