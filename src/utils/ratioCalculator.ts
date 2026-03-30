import { IncomeStatement, BalanceSheet, CashFlow, RatiosData, Metric } from '../types/financials.types';

export class RatioCalculator {
  static calculateRatios(incomeStatement: IncomeStatement, balanceSheet: BalanceSheet, cashFlow: CashFlow): RatiosData {
    const revenue = incomeStatement.revenue;
    const grossProfit = incomeStatement.gross_profit;
    const ebitda = incomeStatement.ebitda;
    const operatingProfit = incomeStatement.ebit;
    const netProfit = incomeStatement.net_profit;
    const interestExpense = incomeStatement.interest_expense;
    
    const currentAssets = balanceSheet.total_current_assets;
    const currentLiabilities = balanceSheet.total_current_liabilities;
    const inventory = balanceSheet.inventory;
    const cash = balanceSheet.cash;
    const tradeReceivables = balanceSheet.trade_receivables;
    const tradePayables = balanceSheet.trade_payables;
    const totalAssets = balanceSheet.total_assets;
    const totalEquity = balanceSheet.total_equity;
    const totalDebt = balanceSheet.short_term_debt + balanceSheet.long_term_debt;
    const fixedAssets = balanceSheet.fixed_assets;
    
    const operatingCashFlow = cashFlow.operating_cash_flow;
    const capex = cashFlow.capex;
    const freeCashFlow = cashFlow.free_cash_flow;
    
    const cogs = incomeStatement.cogs;
    
    const profitability = {
      gross_profit_margin: this.createMetric((grossProfit / revenue) * 100, 'percentage'),
      ebitda_margin: this.createMetric((ebitda / revenue) * 100, 'percentage'),
      operating_profit_margin: this.createMetric((operatingProfit / revenue) * 100, 'percentage'),
      net_profit_margin: this.createMetric((netProfit / revenue) * 100, 'percentage'),
      return_on_assets: this.createMetric((netProfit / totalAssets) * 100, 'percentage'),
      return_on_equity: this.createMetric((netProfit / totalEquity) * 100, 'percentage'),
      return_on_capital_employed: this.createMetric((operatingProfit / (totalDebt + totalEquity)) * 100, 'percentage')
    };
    
    const liquidity = {
      current_ratio: this.createMetric(currentAssets / currentLiabilities, 'ratio'),
      quick_ratio: this.createMetric((currentAssets - inventory) / currentLiabilities, 'ratio'),
      cash_ratio: this.createMetric(cash / currentLiabilities, 'ratio'),
      operating_cash_flow_ratio: this.createMetric(operatingCashFlow / currentLiabilities, 'ratio'),
      working_capital: this.createMetric(currentAssets - currentLiabilities, 'currency'),
      working_capital_to_revenue: this.createMetric(((currentAssets - currentLiabilities) / revenue) * 100, 'percentage')
    };
    
    const leverage = {
      debt_to_equity: this.createMetric(totalDebt / totalEquity, 'ratio'),
      debt_to_assets: this.createMetric(totalDebt / totalAssets, 'ratio'),
      interest_coverage: this.createMetric(operatingProfit / interestExpense, 'ratio'),
      debt_service_coverage: this.createMetric(operatingCashFlow / (totalDebt * 0.15), 'ratio'), // assuming 15% interest
      net_debt_to_ebitda: this.createMetric(totalDebt / ebitda, 'ratio'),
      equity_multiplier: this.createMetric(totalAssets / totalEquity, 'ratio')
    };
    
    const efficiency = {
      asset_turnover: this.createMetric(revenue / totalAssets, 'ratio'),
      inventory_turnover: this.createMetric(cogs / inventory, 'ratio'),
      inventory_days: this.createMetric(365 / (cogs / inventory), 'days'),
      debtor_days: this.createMetric((tradeReceivables / revenue) * 365, 'days'),
      creditor_days: this.createMetric((tradePayables / cogs) * 365, 'days'),
      cash_conversion_cycle: this.createMetric(
        ((tradeReceivables / revenue) * 365) + (365 / (cogs / inventory)) - ((tradePayables / cogs) * 365),
        'days'
      ),
      fixed_asset_turnover: this.createMetric(revenue / fixedAssets, 'ratio')
    };
    
    const cashFlowRatios = {
      operating_cash_flow_margin: this.createMetric((operatingCashFlow / revenue) * 100, 'percentage'),
      cash_flow_to_debt: this.createMetric(operatingCashFlow / totalDebt, 'ratio'),
      capex_to_revenue: this.createMetric((capex / revenue) * 100, 'percentage'),
      free_cash_flow: this.createMetric(freeCashFlow, 'currency'),
      free_cash_flow_margin: this.createMetric((freeCashFlow / revenue) * 100, 'percentage')
    };
    
    return {
      profitability,
      liquidity,
      leverage,
      efficiency,
      cash_flow: cashFlowRatios
    };
  }
  
  private static createMetric(value: number, type: 'percentage' | 'ratio' | 'currency' | 'days'): Metric {
    let formatted: string;
    
    switch (type) {
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'ratio':
        formatted = `${value.toFixed(2)}x`;
        break;
      case 'currency':
        formatted = `R${value.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}`;
        break;
      case 'days':
        formatted = `${Math.round(value)} days`;
        break;
    }
    
    return {
      value,
      formatted,
      rating: this.calculateRating(value, type)
    };
  }
  
  private static calculateRating(value: number, type: string): 'green' | 'amber' | 'red' {
    switch (type) {
      case 'percentage':
        if (value >= 20) return 'green';
        if (value >= 10) return 'amber';
        return 'red';
      case 'ratio':
        if (value >= 1.5) return 'green';
        if (value >= 1.0) return 'amber';
        return 'red';
      case 'days':
        if (value <= 30) return 'green';
        if (value <= 60) return 'amber';
        return 'red';
      case 'currency':
        if (value > 0) return 'green';
        if (value === 0) return 'amber';
        return 'red';
      default:
        return 'amber';
    }
  }
}
