const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('central_cag', 'state_auditor'));

router.get('/dashboard', controller.getDashboard);
router.get('/access-context', controller.getAccessContext);
router.get('/live-feed', controller.getLiveFeed);
router.get('/flags', controller.getFlags);
router.get('/flag/:id', controller.getFlagById);
router.post('/flag/raise', controller.raiseFlag);
router.put('/flag/:id/decide', controller.decideFlag);
router.get('/transactions', controller.searchTransactions);
router.get('/leakage', controller.getLeakageReport);
router.get('/timeline', controller.getFundTrailTimeline);

module.exports = router;
