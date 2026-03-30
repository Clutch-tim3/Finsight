export type DocumentType = 'bank_statement' | 'management_accounts' | 'income_statement' | 'balance_sheet' | 'cash_flow' | 'raw_figures';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  is_transfer?: boolean;
  is_cash?: boolean;
}

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest_expense: number;
  pbt: number;
  tax: number;
  net_profit: number;
}

export interface BalanceSheet {
  cash: number;
  trade_receivables: number;
  inventory: number;
  other_current_assets: number;
  total_current_assets: number;
  fixed_assets: number;
  total_assets: number;
  trade_payables: number;
  short_term_debt: number;
  other_current_liabilities: number;
  total_current_liabilities: number;
  long_term_debt: number;
  total_liabilities: number;
  total_equity: number;
}

export interface CashFlow {
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  net_cash_flow: number;
  free_cash_flow: number;
  capex: number;
}

export interface ParsedFinancials {
  document_type: DocumentType;
  period_start: string | null;
  period_end: string | null;
  currency: string;
  business_name: string | null;
  bank_name: string | null;
  account_number_masked: string | null;
  transactions: Transaction[];
  income_statement: IncomeStatement | null;
  balance_sheet: BalanceSheet | null;
  cash_flow: CashFlow | null;
  raw_text: string;
  extraction_confidence: 'high' | 'medium' | 'low';
  extraction_warnings: string[];
}

export interface Metric {
  value: number;
  formatted: string;
  rating?: 'green' | 'amber' | 'red';
  interpretation?: string;
  benchmark?: BenchmarkData;
  trend?: TrendData;
}

export interface BenchmarkData {
  industry: string;
  industry_median: number;
  vs_benchmark: string;
  benchmark_rating: string;
}

export interface TrendData {
  prior_period: number;
  change: number;
  direction: 'improving' | 'declining' | 'stable';
}

export interface RatiosData {
  profitability: {
    gross_profit_margin: Metric;
    ebitda_margin: Metric;
    operating_profit_margin: Metric;
    net_profit_margin: Metric;
    return_on_assets: Metric;
    return_on_equity: Metric;
    return_on_capital_employed: Metric;
  };
  liquidity: {
    current_ratio: Metric;
    quick_ratio: Metric;
    cash_ratio: Metric;
    operating_cash_flow_ratio: Metric;
    working_capital: Metric;
    working_capital_to_revenue: Metric;
  };
  leverage: {
    debt_to_equity: Metric;
    debt_to_assets: Metric;
    interest_coverage: Metric;
    debt_service_coverage: Metric;
    net_debt_to_ebitda: Metric;
    equity_multiplier: Metric;
  };
  efficiency: {
    asset_turnover: Metric;
    inventory_turnover: Metric;
    inventory_days: Metric;
    debtor_days: Metric;
    creditor_days: Metric;
    cash_conversion_cycle: Metric;
    fixed_asset_turnover: Metric;
  };
  cash_flow: {
    operating_cash_flow_margin: Metric;
    cash_flow_to_debt: Metric;
    capex_to_revenue: Metric;
    free_cash_flow: Metric;
    free_cash_flow_margin: Metric;
  };
}

export interface CashFlowAnalysis {
  cashflow_summary: CashFlowSummary;
  monthly_breakdown: MonthlyBreakdown[];
  cash_flow_quality: CashFlowQuality;
  inflow_analysis: InflowAnalysis;
  outflow_analysis: OutflowAnalysis;
  runway: RunwayAnalysis;
  seasonality: SeasonalityAnalysis;
  forecast: CashFlowForecast;
}

export interface CashFlowSummary {
  period: string;
  total_inflows: number;
  total_outflows: number;
  net_cash_movement: number;
  opening_balance: number;
  closing_balance: number;
  average_monthly_inflow: number;
  average_monthly_outflow: number;
  average_monthly_net: number;
}

export interface MonthlyBreakdown {
  month: string;
  inflows: number;
  outflows: number;
  net: number;
  closing_balance: number;
  vs_prior_month_pct: number | null;
}

export interface CashFlowQuality {
  consistency_score: number;
  volatility: 'low' | 'moderate' | 'high' | 'very_high';
  volatility_coefficient: number;
  trend: 'improving' | 'declining' | 'stable';
  trend_pct: number;
  commentary: string;
}

export interface InflowAnalysis {
  primary_inflow_type: string;
  inflow_concentration: {
    top_10_payers_pct: number;
    concentration_risk: 'low' | 'moderate' | 'high';
    commentary: string;
  };
  payment_timing: {
    typical_receipt_day: string;
    end_of_month_concentration_pct: number;
    commentary: string;
  };
}

export interface OutflowAnalysis {
  top_expense_categories: ExpenseCategory[];
  fixed_vs_variable: {
    estimated_fixed_costs_monthly: number;
    estimated_variable_costs_monthly: number;
    fixed_pct: number;
    commentary: string;
  };
}

export interface ExpenseCategory {
  category: string;
  monthly_avg: number;
  pct_of_outflows: number;
}

export interface RunwayAnalysis {
  current_cash_balance: number;
  monthly_burn_rate: number;
  runway_months: number;
  runway_label: string;
  runway_rating: 'red' | 'amber' | 'green';
  with_incoming_receivables: {
    expected_receivables_30d: number;
    effective_runway_months: number;
    effective_runway_label: string;
  };
  runway_commentary: string;
}

export interface SeasonalityAnalysis {
  detected: boolean;
  pattern_confidence: 'low' | 'medium' | 'high';
  peak_months: string[];
  trough_months: string[];
  peak_vs_trough_variance_pct: number;
  commentary: string;
}

export interface CashFlowForecast {
  method: string;
  disclaimer: string;
  months: ForecastMonth[];
}

export interface ForecastMonth {
  month: string;
  forecast_inflow: number;
  forecast_outflow: number;
  forecast_net: number;
  forecast_balance: number;
  confidence_range: {
    low: number;
    high: number;
  };
}

export interface RevenueAnalysis {
  revenue_summary: RevenueSummary;
  revenue_quality: RevenueQuality;
  anomalies: RevenueAnomaly[];
}

export interface RevenueSummary {
  total_period_revenue: number;
  monthly_average: number;
  annualised_run_rate: number;
  formatted_arr: string;
  growth_rate_mom: {
    [key: string]: number;
  };
  growth_rate_yoy: number | null;
  growth_trend: 'accelerating' | 'decelerating' | 'stable';
}

export interface RevenueQuality {
  score: number;
  label: string;
  recurring_vs_project: {
    estimated_recurring_pct: number;
    estimated_project_pct: number;
    recurring_revenue_monthly_avg: number;
    commentary: string;
  };
  revenue_concentration: {
    top_3_customers_pct: number;
    top_10_customers_pct: number;
    herfindahl_index: number;
    concentration_risk: 'low' | 'moderate' | 'high';
    commentary: string;
  };
}

export interface RevenueAnomaly {
  type: string;
  date: string;
  description: string;
  flag: string;
}

export interface Anomaly {
  flag_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  type: string;
  title: string;
  date?: string;
  amount?: number;
  description: string;
  explanation: string;
  recommended_action: string;
  is_disqualifying: boolean;
}

export interface AnomalyAnalysis {
  overall_anomaly_risk: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_score: number;
  total_flags: number;
  flags: Anomaly[];
  clean_indicators: string[];
  fraud_risk_indicators: {
    structuring_risk: string;
    related_party_risk: string;
    revenue_inflation_risk: string;
    overall_fraud_risk: string;
  };
}

export interface FiveCAssessment {
  character: AssessmentComponent;
  capacity: AssessmentComponent;
  capital: AssessmentComponent;
  conditions: AssessmentComponent;
  collateral: AssessmentComponent;
}

export interface AssessmentComponent {
  score: number | null;
  rating: string;
  evidence?: string[];
  dscr?: number;
  dscr_interpretation?: string;
  affordability?: {
    loan_amount_requested: number;
    estimated_monthly_repayment: number;
    monthly_free_cash_flow_avg: number;
    repayment_as_pct_of_cashflow: number;
    affordability_rating: string;
    commentary: string;
  };
  note?: string;
}

export interface CreditworthinessAnalysis {
  overall_credit_grade: string;
  grade_description: string;
  credit_score: number;
  lending_recommendation: 'APPROVE' | 'APPROVE_WITH_CONDITIONS' | 'REFER' | 'DECLINE';
  five_c_assessment: FiveCAssessment;
  key_strengths: string[];
  key_risks: string[];
  conditions_recommended: string[];
  data_quality_notes: string[];
  comparable_risk_profile: string;
}

export interface Commentary {
  style: string;
  period: string;
  word_count: number;
  headline: string;
  body: string;
  key_metrics_table: { metric: string; value: string }[];
}

export interface HealthScore {
  health_score: number;
  health_label: string;
  health_rating: 'red' | 'amber' | 'green' | 'excellent';
  score_breakdown: {
    profitability: ScoreComponent;
    liquidity: ScoreComponent;
    solvency: ScoreComponent;
    efficiency: ScoreComponent;
    growth_trajectory: ScoreComponent;
  };
  score_interpretation: string;
  top_3_improvements: Improvement[];
  potential_score: number;
  potential_label: string;
}

export interface ScoreComponent {
  score: number;
  max: number;
  pct: number;
}

export interface Improvement {
  action: string;
  potential_score_impact: number;
  priority: 'high' | 'medium' | 'low';
}

export type Industry = 'retail_general' | 'retail_food_beverage' | 'construction' | 'professional_services' | 'technology_saas' | 'healthcare_private' | 'hospitality_restaurants' | 'hospitality_accommodation' | 'manufacturing_light' | 'manufacturing_heavy' | 'transport_logistics' | 'agriculture' | 'financial_services' | 'real_estate' | 'education_private' | 'media_entertainment' | 'wholesale_distribution' | 'automotive' | 'beauty_wellness' | 'events_sport';

export type SizeBand = 'micro' | 'small' | 'medium';

export type Country = 'global' | 'ZA' | 'GB' | 'US' | 'AU';
