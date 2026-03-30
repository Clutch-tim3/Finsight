import { HealthScore, RatiosData } from '../types/financials.types';

export class HealthScoreCalculator {
  static calculateHealthScore(ratios: RatiosData, growthRate: number = 0): HealthScore {
    const profitabilityScore = this.calculateProfitabilityScore(ratios.profitability);
    const liquidityScore = this.calculateLiquidityScore(ratios.liquidity);
    const solvencyScore = this.calculateSolvencyScore(ratios.leverage);
    const efficiencyScore = this.calculateEfficiencyScore(ratios.efficiency);
    const growthScore = this.calculateGrowthScore(growthRate);
    
    const totalScore = profitabilityScore + liquidityScore + solvencyScore + efficiencyScore + growthScore;
    
    const scoreBreakdown = {
      profitability: { score: profitabilityScore, max: 25, pct: Math.round((profitabilityScore / 25) * 100) },
      liquidity: { score: liquidityScore, max: 25, pct: Math.round((liquidityScore / 25) * 100) },
      solvency: { score: solvencyScore, max: 20, pct: Math.round((solvencyScore / 20) * 100) },
      efficiency: { score: efficiencyScore, max: 15, pct: Math.round((efficiencyScore / 15) * 100) },
      growth_trajectory: { score: growthScore, max: 15, pct: Math.round((growthScore / 15) * 100) }
    };
    
    const healthRating = this.getHealthRating(totalScore);
    const healthLabel = this.getHealthLabel(totalScore);
    
    return {
      health_score: totalScore,
      health_label: healthLabel,
      health_rating: healthRating,
      score_breakdown: scoreBreakdown,
      score_interpretation: this.getScoreInterpretation(totalScore, scoreBreakdown),
      top_3_improvements: this.getTopImprovements(ratios, growthRate),
      potential_score: this.calculatePotentialScore(totalScore, scoreBreakdown),
      potential_label: this.getHealthLabel(this.calculatePotentialScore(totalScore, scoreBreakdown))
    };
  }
  
  private static calculateProfitabilityScore(profitability: any): number {
    const weights = {
      gross_profit_margin: 0.3,
      ebitda_margin: 0.3,
      net_profit_margin: 0.4
    };
    
    let score = 0;
    
    score += this.normalizeRatio(profitability.gross_profit_margin.value, 0, 100) * weights.gross_profit_margin * 25;
    score += this.normalizeRatio(profitability.ebitda_margin.value, 0, 100) * weights.ebitda_margin * 25;
    score += this.normalizeRatio(profitability.net_profit_margin.value, 0, 100) * weights.net_profit_margin * 25;
    
    return Math.round(score);
  }
  
  private static calculateLiquidityScore(liquidity: any): number {
    const weights = {
      current_ratio: 0.4,
      quick_ratio: 0.3,
      working_capital: 0.3
    };
    
    let score = 0;
    
    score += this.normalizeRatio(liquidity.current_ratio.value, 0, 5) * weights.current_ratio * 25;
    score += this.normalizeRatio(liquidity.quick_ratio.value, 0, 5) * weights.quick_ratio * 25;
    score += this.normalizeRatio(Math.min(liquidity.working_capital_to_revenue.value, 50), -20, 50) * weights.working_capital * 25;
    
    return Math.round(score);
  }
  
  private static calculateSolvencyScore(leverage: any): number {
    const weights = {
      debt_to_equity: 0.4,
      debt_service_coverage: 0.4,
      interest_coverage: 0.2
    };
    
    let score = 0;
    
    score += (1 - this.normalizeRatio(leverage.debt_to_equity.value, 0, 3)) * weights.debt_to_equity * 20;
    score += this.normalizeRatio(leverage.debt_service_coverage.value, 0, 5) * weights.debt_service_coverage * 20;
    score += this.normalizeRatio(leverage.interest_coverage.value, 0, 10) * weights.interest_coverage * 20;
    
    return Math.round(score);
  }
  
  private static calculateEfficiencyScore(efficiency: any): number {
    const weights = {
      debtor_days: 0.4,
      creditor_days: 0.3,
      cash_conversion_cycle: 0.3
    };
    
    let score = 0;
    
    score += (1 - this.normalizeRatio(efficiency.debtor_days.value, 0, 120)) * weights.debtor_days * 15;
    score += this.normalizeRatio(efficiency.creditor_days.value, 0, 90) * weights.creditor_days * 15;
    score += (1 - this.normalizeRatio(efficiency.cash_conversion_cycle.value, 0, 90)) * weights.cash_conversion_cycle * 15;
    
    return Math.round(score);
  }
  
  private static calculateGrowthScore(growthRate: number): number {
    const normalizedGrowth = this.normalizeRatio(growthRate, -20, 50);
    return Math.round(normalizedGrowth * 15);
  }
  
  private static normalizeRatio(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
  
  private static getHealthRating(score: number): 'red' | 'amber' | 'green' | 'excellent' {
    if (score <= 40) return 'red';
    if (score <= 60) return 'amber';
    if (score <= 80) return 'green';
    return 'excellent';
  }
  
  private static getHealthLabel(score: number): string {
    if (score <= 40) return 'Poor Financial Health';
    if (score <= 60) return 'Fair Financial Health';
    if (score <= 80) return 'Good Financial Health';
    return 'Excellent Financial Health';
  }
  
  private static getScoreInterpretation(score: number, breakdown: any): string {
    const strengths = [];
    const weaknesses = [];
    
    if (breakdown.profitability.pct >= 80) strengths.push('profitability');
    if (breakdown.liquidity.pct >= 80) strengths.push('liquidity');
    if (breakdown.solvency.pct >= 80) strengths.push('solvency');
    if (breakdown.efficiency.pct >= 80) strengths.push('efficiency');
    if (breakdown.growth_trajectory.pct >= 80) strengths.push('growth');
    
    if (breakdown.profitability.pct < 60) weaknesses.push('profitability');
    if (breakdown.liquidity.pct < 60) weaknesses.push('liquidity');
    if (breakdown.solvency.pct < 60) weaknesses.push('solvency');
    if (breakdown.efficiency.pct < 60) weaknesses.push('efficiency');
    if (breakdown.growth_trajectory.pct < 60) weaknesses.push('growth');
    
    let interpretation = `A score of ${score} indicates `;
    
    if (score >= 80) {
      interpretation += 'excellent financial health. The business demonstrates strong performance across all key dimensions.';
    } else if (score >= 60) {
      interpretation += 'good financial health with solid fundamentals.';
    } else if (score >= 40) {
      interpretation += 'fair financial health but with significant areas for improvement.';
    } else {
      interpretation += 'poor financial health requiring immediate attention.';
    }
    
    if (strengths.length > 0) {
      interpretation += ` The business particularly excels in ${strengths.join(', ')}.`;
    }
    
    if (weaknesses.length > 0) {
      interpretation += ` Areas that need improvement include ${weaknesses.join(', ')}.`;
    }
    
    return interpretation;
  }
  
  private static getTopImprovements(ratios: RatiosData, growthRate: number): any[] {
    const improvements = [];
    
    if (ratios.liquidity.working_capital_to_revenue.value < 10) {
      improvements.push({
        action: 'Build cash reserve to 2-3 months of expenses',
        potential_score_impact: 4,
        priority: 'high'
      });
    }
    
    if (ratios.efficiency.debtor_days.value > 30) {
      improvements.push({
        action: 'Reduce debtor days from current level to industry median',
        potential_score_impact: 3,
        priority: 'medium'
      });
    }
    
    if (ratios.leverage.debt_to_equity.value > 1.0) {
      improvements.push({
        action: 'Reduce debt-to-equity ratio through equity injection or debt repayment',
        potential_score_impact: 3,
        priority: 'medium'
      });
    }
    
    if (growthRate < 5) {
      improvements.push({
        action: 'Implement growth strategies to increase revenue by 10-15%',
        potential_score_impact: 2,
        priority: 'low'
      });
    }
    
    return improvements.slice(0, 3);
  }
  
  private static calculatePotentialScore(currentScore: number, breakdown: any): number {
    let potential = currentScore;
    
    if (breakdown.liquidity.pct < 80) potential += 4;
    if (breakdown.efficiency.pct < 80) potential += 3;
    if (breakdown.leverage.pct < 80) potential += 3;
    if (breakdown.growth_trajectory.pct < 80) potential += 2;
    
    return Math.min(100, potential);
  }
}
