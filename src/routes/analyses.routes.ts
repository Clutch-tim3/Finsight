import { Router } from 'express';
import { AnalysesController } from '../controllers/analyses.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Ratios analysis
router.post('/:document_id/ratios', [
  authMiddleware
], AnalysesController.getRatios);

// Health score
router.post('/:document_id/health-score', [
  authMiddleware
], AnalysesController.getHealthScore);

// Creditworthiness
router.post('/:document_id/creditworthiness', [
  authMiddleware
], AnalysesController.getCreditworthiness);

// Commentary
router.post('/:document_id/commentary', [
  authMiddleware
], AnalysesController.getCommentary);

// Cash flow analysis
router.post('/:document_id/cashflow', [
  authMiddleware
], AnalysesController.getCashFlowAnalysis);

// Revenue analysis
router.post('/:document_id/revenue', [
  authMiddleware
], AnalysesController.getRevenueAnalysis);

// Anomaly detection
router.post('/:document_id/anomalies', [
  authMiddleware
], AnalysesController.getAnomalyDetection);

export default router;
