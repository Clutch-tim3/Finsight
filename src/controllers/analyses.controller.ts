import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { RatioCalculator } from '../utils/ratioCalculator';
import { HealthScoreCalculator } from '../utils/healthScoreCalculator';
import { AIService } from '../services/ai.service';
import crypto from 'crypto';

export class AnalysesController {
  static async getRatios(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      const { industry = 'auto', include_interpretations = true } = req.body;
      
      // Mock financial data (would be extracted from document in real implementation)
      const mockIncomeStatement = {
        revenue: 1847350,
        cogs: 1066000,
        gross_profit: 781350,
        operating_expenses: 436800,
        ebitda: 344550,
        depreciation: 28000,
        ebit: 316550,
        interest_expense: 38200,
        pbt: 278350,
        tax: 77938,
        net_profit: 200412
      };
      
      const mockBalanceSheet = {
        cash: 721740,
        trade_receivables: 485000,
        inventory: 142000,
        other_current_assets: 38000,
        total_current_assets: 1386740,
        fixed_assets: 284000,
        total_assets: 1670740,
        trade_payables: 312000,
        short_term_debt: 125000,
        other_current_liabilities: 118000,
        total_current_liabilities: 555000,
        long_term_debt: 285000,
        total_liabilities: 840000,
        total_equity: 830740
      };
      
      const mockCashFlow = {
        operating_cash_flow: 298000,
        investing_cash_flow: -45000,
        financing_cash_flow: -25000,
        net_cash_flow: 228000,
        free_cash_flow: 253000,
        capex: 45000
      };
      
      // Calculate ratios
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );
      
      // AI analysis for interpretations and benchmarks
      const analysis = await AIService.analyzeRatios(ratios, industry, include_interpretations);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'ratios' + JSON.stringify(req.body))
        .digest('hex');
      
      // Save analysis to database
      await DocumentService.saveAnalysis(
        document_id,
        'ratios',
        { ratios, ratio_summary: analysis.ratio_summary },
        inputHash,
        'claude-sonnet-4-20250514',
        1200,
        2800,
        Date.now() - (req as any).startTime
      );
      
      // Track API usage
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'ratios',
        6,
        200,
        Date.now() - (req as any).startTime,
        4000
      );
      
      res.json({
        success: true,
        data: {
          document_id,
          analysis_id: inputHash,
          document_type: 'management_accounts',
          period: 'Jan 2025 - Mar 2025 (3 months)',
          currency: 'ZAR',
          ratios: ratios,
          ratio_summary: {
            green_count: 14,
            amber_count: 4,
            red_count: 2,
            overall_rating: 'amber',
            overall_narrative: 'Financially healthy with strong profitability and manageable leverage. Debtor collection and one elevated creditor obligation warrant monitoring.'
          },
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error calculating ratios:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'ratios',
        6,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RATIO_CALCULATION_FAILED',
          message: 'Failed to calculate financial ratios',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getHealthScore(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      
      // Mock financial data
      const mockRatios = RatioCalculator.calculateRatios(
        { revenue: 1847350, cogs: 1066000, gross_profit: 781350, operating_expenses: 436800, ebitda: 344550, depreciation: 28000, ebit: 316550, interest_expense: 38200, pbt: 278350, tax: 77938, net_profit: 200412 },
        { cash: 721740, trade_receivables: 485000, inventory: 142000, other_current_assets: 38000, total_current_assets: 1386740, fixed_assets: 284000, total_assets: 1670740, trade_payables: 312000, short_term_debt: 125000, other_current_liabilities: 118000, total_current_liabilities: 555000, long_term_debt: 285000, total_liabilities: 840000, total_equity: 830740 },
        { operating_cash_flow: 298000, investing_cash_flow: -45000, financing_cash_flow: -25000, net_cash_flow: 228000, free_cash_flow: 253000, capex: 45000 }
      );
      
      const healthScore = HealthScoreCalculator.calculateHealthScore(mockRatios, 12.7);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'health_score')
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'health_score',
        healthScore,
        inputHash,
        'calculator',
        0,
        0,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'health_score',
        5,
        200,
        Date.now() - (req as any).startTime
      );
      
      res.json({
        success: true,
        data: healthScore
      });
    } catch (error) {
      console.error('Error calculating health score:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'health_score',
        5,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_SCORE_FAILED',
          message: 'Failed to calculate health score',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getCreditworthiness(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      const options = req.body;
      
      // Mock financial data
      const mockData = {
        ratios: RatioCalculator.calculateRatios(
          { revenue: 1847350, cogs: 1066000, gross_profit: 781350, operating_expenses: 436800, ebitda: 344550, depreciation: 28000, ebit: 316550, interest_expense: 38200, pbt: 278350, tax: 77938, net_profit: 200412 },
          { cash: 721740, trade_receivables: 485000, inventory: 142000, other_current_assets: 38000, total_current_assets: 1386740, fixed_assets: 284000, total_assets: 1670740, trade_payables: 312000, short_term_debt: 125000, other_current_liabilities: 118000, total_current_liabilities: 555000, long_term_debt: 285000, total_liabilities: 840000, total_equity: 830740 },
          { operating_cash_flow: 298000, investing_cash_flow: -45000, financing_cash_flow: -25000, net_cash_flow: 228000, free_cash_flow: 253000, capex: 45000 }
        ),
        cashFlow: {
          monthlyInflow: 615783,
          monthlyOutflow: 537613,
          averageNet: 78170
        }
      };
      
      const creditworthiness = await AIService.assessCreditworthiness(mockData, options);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'creditworthiness' + JSON.stringify(req.body))
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'creditworthiness',
        creditworthiness,
        inputHash,
        'claude-sonnet-4-20250514',
        1800,
        3200,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'creditworthiness',
        8,
        200,
        Date.now() - (req as any).startTime,
        5000
      );
      
      res.json({
        success: true,
        data: creditworthiness
      });
    } catch (error) {
      console.error('Error assessing creditworthiness:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'creditworthiness',
        8,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CREDITWORTHINESS_FAILED',
          message: 'Failed to assess creditworthiness',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getCommentary(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      const options = req.body;
      
      // Mock financial data
      const mockData = {
        revenue: 1847350,
        monthlyRunRate: 615783,
        arr: 7389400,
        grossMargin: 42.3,
        ebitdaMargin: 18.7,
        netCash: 234510,
        closingBalance: 721740,
        dscr: 1.87
      };
      
      const commentary = await AIService.generateCommentary(mockData, options);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'commentary' + JSON.stringify(req.body))
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'commentary',
        commentary,
        inputHash,
        'claude-sonnet-4-20250514',
        1000,
        2500,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'commentary',
        5,
        200,
        Date.now() - (req as any).startTime,
        3500
      );
      
      res.json({
        success: true,
        data: commentary
      });
    } catch (error) {
      console.error('Error generating commentary:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'commentary',
        5,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'COMMENTARY_FAILED',
          message: 'Failed to generate commentary',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getCashFlowAnalysis(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      const options = req.body;
      
      // Mock transactions data
      const mockTransactions = [];
      const startDate = new Date(2025, 0, 1);
      
      for (let i = 0; i < 100; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        mockTransactions.push({
          id: `tx${i}`,
          date: date.toISOString().split('T')[0],
          description: `Customer Payment ${i}`,
          amount: Math.random() * 10000 + 5000,
          type: 'credit' as const,
          category: 'customer_receipts',
          is_transfer: false
        });
        
        if (Math.random() > 0.3) {
          mockTransactions.push({
            id: `tx${i + 100}`,
            date: date.toISOString().split('T')[0],
            description: `Expense Payment ${i}`,
            amount: Math.random() * 8000 + 3000,
            type: 'debit' as const,
            category: 'supplier_payments',
            is_transfer: false
          });
        }
      }
      
      const cashFlowAnalysis = await AIService.analyzeCashFlow(mockTransactions, options.include_forecast);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'cashflow' + JSON.stringify(req.body))
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'cashflow',
        cashFlowAnalysis,
        inputHash,
        'claude-sonnet-4-20250514',
        2000,
        4000,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'cashflow',
        6,
        200,
        Date.now() - (req as any).startTime,
        6000
      );
      
      res.json({
        success: true,
        data: cashFlowAnalysis
      });
    } catch (error) {
      console.error('Error analyzing cash flow:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'cashflow',
        6,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CASHFLOW_ANALYSIS_FAILED',
          message: 'Failed to analyze cash flow',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getRevenueAnalysis(req: Request, res: Response) {
    try {
      const { document_id } = req.params;

      // Mock transactions data
      const mockTransactions = [];
      const startDate = new Date(2025, 0, 1);

      for (let i = 0; i < 80; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        mockTransactions.push({
          id: `tx${i}`,
          date: date.toISOString().split('T')[0],
          description: `Customer ${Math.floor(i / 10)} Payment`,
          amount: Math.random() * 15000 + 8000,
          type: 'credit' as const,
          category: 'customer_receipts',
          is_transfer: false
        });
      }
      
      const revenueAnalysis = await AIService.analyzeRevenue(mockTransactions);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'revenue' + JSON.stringify(req.body))
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'revenue',
        revenueAnalysis,
        inputHash,
        'claude-sonnet-4-20250514',
        1500,
        3000,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'revenue',
        5,
        200,
        Date.now() - (req as any).startTime,
        4500
      );
      
      res.json({
        success: true,
        data: revenueAnalysis
      });
    } catch (error) {
      console.error('Error analyzing revenue:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'revenue',
        5,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'REVENUE_ANALYSIS_FAILED',
          message: 'Failed to analyze revenue',
          details: (error as any).message
        }
      });
    }
  }
  
  static async getAnomalyDetection(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      const { sensitivity = 'medium', context = 'general' } = req.body;
      
      // Mock data
      const mockData = {
        transactions: Array.from({ length: 100 }, (_, i) => ({
          id: `tx${i}`,
          date: `2025-0${(i % 3) + 1}-${(i % 28) + 1}`,
          description: i === 50 ? 'Large Transaction' : `Transaction ${i}`,
          amount: i === 50 ? 284000 : Math.random() * 10000 + 500,
          type: i % 2 === 0 ? 'credit' : 'debit',
          category: i % 2 === 0 ? 'customer_receipts' : 'supplier_payments'
        })),
        income_statement: {
          revenue: 1847350,
          cogs: 1066000,
          gross_profit: 781350,
          operating_expenses: 436800,
          ebitda: 344550,
          net_profit: 200412
        },
        balance_sheet: {
          cash: 721740,
          trade_receivables: 485000,
          inventory: 142000,
          total_current_assets: 1386740,
          total_assets: 1670740,
          trade_payables: 312000,
          total_current_liabilities: 555000,
          total_liabilities: 840000,
          total_equity: 830740
        }
      };
      
      const anomalyAnalysis = await AIService.detectAnomalies(mockData, sensitivity, context);
      
      // Create cache key
      const inputHash = crypto.createHash('sha256')
        .update(document_id + 'anomalies' + JSON.stringify(req.body))
        .digest('hex');
      
      await DocumentService.saveAnalysis(
        document_id,
        'anomalies',
        anomalyAnalysis,
        inputHash,
        'claude-sonnet-4-20250514',
        1800,
        2800,
        Date.now() - (req as any).startTime
      );
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'anomalies',
        6,
        200,
        Date.now() - (req as any).startTime,
        4600
      );
      
      res.json({
        success: true,
        data: anomalyAnalysis
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'anomalies',
        6,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ANOMALY_DETECTION_FAILED',
          message: 'Failed to detect anomalies',
          details: (error as any).message
        }
      });
    }
  }
}
