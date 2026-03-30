import { RatioCalculator } from '../src/utils/ratioCalculator';

describe('RatioCalculator', () => {
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

  describe('calculateRatios', () => {
    it('should calculate all profitability ratios', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.profitability.gross_profit_margin.value).toBeGreaterThan(0);
      expect(ratios.profitability.ebitda_margin.value).toBeGreaterThan(0);
      expect(ratios.profitability.net_profit_margin.value).toBeGreaterThan(0);
    });

    it('should calculate all liquidity ratios', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.liquidity.current_ratio.value).toBeGreaterThan(0);
      expect(ratios.liquidity.quick_ratio.value).toBeGreaterThan(0);
      expect(ratios.liquidity.working_capital.value).toBeGreaterThan(0);
    });

    it('should calculate all leverage ratios', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.leverage.debt_to_equity.value).toBeGreaterThan(0);
      expect(ratios.leverage.interest_coverage.value).toBeGreaterThan(0);
      expect(ratios.leverage.debt_service_coverage.value).toBeGreaterThan(0);
    });

    it('should calculate all efficiency ratios', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.efficiency.debtor_days.value).toBeGreaterThan(0);
      expect(ratios.efficiency.creditor_days.value).toBeGreaterThan(0);
      expect(ratios.efficiency.cash_conversion_cycle.value).toBeGreaterThan(0);
    });

    it('should calculate all cash flow ratios', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.cash_flow.operating_cash_flow_margin.value).toBeGreaterThan(0);
      expect(ratios.cash_flow.free_cash_flow.value).toBeGreaterThan(0);
    });

    it('should format values correctly', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(ratios.profitability.gross_profit_margin.formatted).toContain('%');
      expect(ratios.liquidity.current_ratio.formatted).toContain('x');
      expect(ratios.efficiency.debtor_days.formatted).toContain('days');
    });

    it('should assign appropriate ratings', () => {
      const ratios = RatioCalculator.calculateRatios(
        mockIncomeStatement,
        mockBalanceSheet,
        mockCashFlow
      );

      expect(['green', 'amber', 'red']).toContain(ratios.profitability.gross_profit_margin.rating);
    });
  });
});
