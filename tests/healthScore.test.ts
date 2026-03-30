import { HealthScoreCalculator } from '../src/utils/healthScoreCalculator';
import { RatioCalculator } from '../src/utils/ratioCalculator';

describe('HealthScoreCalculator', () => {
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

  describe('calculateHealthScore', () => {
    it('should calculate a valid health score between 0 and 100', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const healthScore = HealthScoreCalculator.calculateHealthScore(ratios, 12.7);
      
      expect(healthScore.health_score).toBeGreaterThanOrEqual(0);
      expect(healthScore.health_score).toBeLessThanOrEqual(100);
    });

    it('should return a valid health rating', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const healthScore = HealthScoreCalculator.calculateHealthScore(ratios, 12.7);
      
      expect(['red', 'amber', 'green', 'excellent']).toContain(healthScore.health_rating);
    });

    it('should include score breakdown by category', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const healthScore = HealthScoreCalculator.calculateHealthScore(ratios, 12.7);
      
      expect(healthScore.score_breakdown.profitability).toBeDefined();
      expect(healthScore.score_breakdown.liquidity).toBeDefined();
      expect(healthScore.score_breakdown.solvency).toBeDefined();
      expect(healthScore.score_breakdown.efficiency).toBeDefined();
      expect(healthScore.score_breakdown.growth_trajectory).toBeDefined();
    });

    it('should include top improvement suggestions', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const healthScore = HealthScoreCalculator.calculateHealthScore(ratios, 12.7);
      
      expect(healthScore.top_3_improvements).toBeInstanceOf(Array);
      expect(healthScore.top_3_improvements.length).toBeLessThanOrEqual(3);
      expect(healthScore.top_3_improvements[0]).toHaveProperty('action');
      expect(healthScore.top_3_improvements[0]).toHaveProperty('potential_score_impact');
      expect(healthScore.top_3_improvements[0]).toHaveProperty('priority');
    });

    it('should include potential score with improvements', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const healthScore = HealthScoreCalculator.calculateHealthScore(ratios, 12.7);
      
      expect(healthScore.potential_score).toBeGreaterThanOrEqual(healthScore.health_score);
      expect(healthScore.potential_score).toBeLessThanOrEqual(100);
    });

    it('should calculate higher scores for better performance', () => {
      const goodRatios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      const badRatios = RatioCalculator.calculateRatios(
        { ...mockIncomeStatement, revenue: 500000, net_profit: -10000 },
        { ...mockBalanceSheet, total_assets: 300000, total_liabilities: 250000 },
        { ...mockCashFlow, operating_cash_flow: -50000 }
      );

      const goodScore = HealthScoreCalculator.calculateHealthScore(goodRatios, 12.7);
      const badScore = HealthScoreCalculator.calculateHealthScore(badRatios, -5);

      expect(goodScore.health_score).toBeGreaterThan(badScore.health_score);
    });
  });
});
