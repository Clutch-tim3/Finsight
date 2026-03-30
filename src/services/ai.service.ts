import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import redis from '../config/redis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export class AIService {
  static async generateCompletion(prompt: string, temperature: number = 0.1, maxTokens: number = 4000): Promise<string> {
    const cacheKey = crypto.createHash('sha256').update(prompt + temperature + maxTokens).digest('hex');
    
    // Check cache
    const cachedResponse = await redis.get(`ai_cache:${cacheKey}`);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const message = await anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      
      // Cache the response
      await redis.setex(`ai_cache:${cacheKey}`, CACHE_TTL, response);
      
      return response;
    } catch (error) {
      console.error('Claude API error:', error);
      
      // Retry once with higher temperature
      if (temperature < 0.3) {
        return this.generateCompletion(prompt, temperature + 0.2, maxTokens);
      }
      
      throw new Error('AI processing failed. Please try again later.');
    }
  }
  
  static async extractData(text: string, documentType: string = 'auto'): Promise<any> {
    const prompt = this.createExtractionPrompt(text, documentType);
    const response = await this.generateCompletion(prompt, 0.1, 2000);
    return this.parseJSONResponse(response);
  }
  
  static async analyzeRatios(ratiosData: any, industry: string, includeInterpretations: boolean = true): Promise<any> {
    const prompt = this.createRatiosAnalysisPrompt(ratiosData, industry, includeInterpretations);
    const response = await this.generateCompletion(prompt, 0.3, 4000);
    return this.parseJSONResponse(response);
  }
  
  static async analyzeCashFlow(transactions: any[], includeForecast: boolean = true): Promise<any> {
    const prompt = this.createCashFlowAnalysisPrompt(transactions, includeForecast);
    const response = await this.generateCompletion(prompt, 0.3, 5000);
    return this.parseJSONResponse(response);
  }
  
  static async analyzeRevenue(transactions: any[]): Promise<any> {
    const prompt = this.createRevenueAnalysisPrompt(transactions);
    const response = await this.generateCompletion(prompt, 0.3, 4000);
    return this.parseJSONResponse(response);
  }
  
  static async detectAnomalies(data: any, sensitivity: string = 'medium', context: string = 'general'): Promise<any> {
    const prompt = this.createAnomalyDetectionPrompt(data, sensitivity, context);
    const response = await this.generateCompletion(prompt, 0.2, 4000);
    return this.parseJSONResponse(response);
  }
  
  static async assessCreditworthiness(data: any, options: any = {}): Promise<any> {
    const prompt = this.createCreditworthinessPrompt(data, options);
    const response = await this.generateCompletion(prompt, 0.3, 5000);
    return this.parseJSONResponse(response);
  }
  
  static async generateCommentary(data: any, options: any = {}): Promise<any> {
    const prompt = this.createCommentaryPrompt(data, options);
    const response = await this.generateCompletion(prompt, 0.3, 6000);
    return this.parseJSONResponse(response);
  }
  
  static async calculateHealthScore(ratios: any, growthRate: number = 0): Promise<any> {
    const prompt = this.createHealthScorePrompt(ratios, growthRate);
    const response = await this.generateCompletion(prompt, 0.1, 3000);
    return this.parseJSONResponse(response);
  }
  
  static async generateLendingReport(data: any, options: any = {}): Promise<any> {
    const prompt = this.createLendingReportPrompt(data, options);
    const response = await this.generateCompletion(prompt, 0.3, 8000);
    return this.parseJSONResponse(response);
  }
  
  private static createExtractionPrompt(text: string, documentType: string): string {
    return `Extract structured financial data from the following document text:

${text}

Document Type Hint: ${documentType}

Return JSON format only. Do not include any additional text.`;
  }
  
  private static createRatiosAnalysisPrompt(ratiosData: any, industry: string, includeInterpretations: boolean): string {
    return `Analyze the following financial ratios for a ${industry} business:

${JSON.stringify(ratiosData, null, 2)}

${includeInterpretations ? 'Provide detailed interpretations for each ratio including whether it is good, average, or poor for the industry. Use green/amber/red ratings.' : ''}

Return JSON format only with analysis results.`;
  }
  
  private static createCashFlowAnalysisPrompt(transactions: any[], includeForecast: boolean): string {
    return `Analyze the following bank statement transactions:

${JSON.stringify(transactions, null, 2)}

${includeForecast ? 'Include a 3-month cash flow forecast with confidence ranges.' : ''}

Provide:
1. Cash flow quality assessment (consistency, volatility, trend)
2. Inflow analysis (concentration, payment timing)
3. Outflow analysis (top categories, fixed vs variable)
4. Cash runway calculation
5. Seasonality detection
6. ${includeForecast ? '3-month forecast' : ''}

Return JSON format only.`;
  }
  
  private static createRevenueAnalysisPrompt(transactions: any[]): string {
    return `Analyze revenue patterns from the following transactions:

${JSON.stringify(transactions, null, 2)}

Identify:
1. Revenue summary (total, monthly average, ARR)
2. Revenue quality assessment
3. Recurring vs project-based revenue split
4. Revenue concentration (top customers)
5. Growth rates and trends
6. Revenue anomalies

Return JSON format only.`;
  }
  
  private static createAnomalyDetectionPrompt(data: any, sensitivity: string, context: string): string {
    return `Detect anomalies and red flags in the following financial data:

${JSON.stringify(data, null, 2)}

Sensitivity: ${sensitivity} (${sensitivity === 'high' ? 'detect even subtle anomalies' : sensitivity === 'low' ? 'only detect clear anomalies' : 'detect significant anomalies'})
Context: ${context}

Check for:
- Revenue spikes/gaps
- Unusual expense patterns
- Cash flow inconsistencies
- Fraud risk signals
- Credit risk indicators

Return JSON format with anomalies, risk scores, and recommendations.`;
  }
  
  private static createCreditworthinessPrompt(data: any, options: any): string {
    return `Assess the creditworthiness of this business for ${options.loan_purpose || 'general lending'}:

${JSON.stringify(data, null, 2)}

${options.loan_amount_requested ? `Loan Amount Requested: ${options.loan_amount_requested} ${options.loan_currency || 'ZAR'}` : ''}
${options.loan_term_months ? `Loan Term: ${options.loan_term_months} months` : ''}
${options.estimated_monthly_repayment ? `Monthly Repayment: ${options.estimated_monthly_repayment} ${options.loan_currency || 'ZAR'}` : ''}

${options.lender_context ? `Lender Context: ${options.lender_context}` : ''}

Provide:
1. Overall credit grade and score (0-100)
2. 5 C's of credit assessment
3. Lending recommendation (APPROVE/APPROVE_WITH_CONDITIONS/REFER/DECLINE)
4. Key strengths and risks
5. Recommended conditions
6. Data quality notes

Return JSON format only.`;
  }
  
  private static createCommentaryPrompt(data: any, options: any): string {
    return `Write a ${options.word_count || 'standard'} financial commentary in ${options.style || 'management_summary'} style with ${options.tone || 'professional'} tone.

Business: ${options.business_name || 'The business'}
Period: ${options.period_label || 'the period'}

${options.audience ? `Audience: ${options.audience}` : ''}

Financial Data:
${JSON.stringify(data, null, 2)}

${options.include_recommendations ? 'Include recommendations for improvement.' : ''}

Return JSON with:
- headline: summary headline
- body: commentary with paragraphs separated by \\n\\n
- key_metrics_table: array of { metric, value }

${options.style === 'credit_memo' ? 'Focus on creditworthiness and repayment capacity.' : ''}
${options.style === 'investor_update' ? 'Focus on growth potential and ROI.' : ''}
${options.style === 'board_pack' ? 'Be concise and strategic.' : ''}

Return JSON format only.`;
  }
  
  private static createHealthScorePrompt(ratios: any, growthRate: number): string {
    return `Calculate a Financial Health Score (0-100) based on the following ratios and ${growthRate}% growth rate:

${JSON.stringify(ratios, null, 2)}

Weighting:
- Profitability: 25 points
- Liquidity: 25 points  
- Solvency: 20 points
- Efficiency: 15 points
- Growth & Trajectory: 15 points

Return JSON with:
- health_score: number 0-100
- health_label: text description
- health_rating: green/amber/red/excellent
- score_breakdown: detailed breakdown by category
- score_interpretation: narrative explanation
- top_3_improvements: recommended actions to improve score
- potential_score: score if all improvements are implemented
- potential_label: label for potential score

Return JSON format only.`;
  }
  
  private static createLendingReportPrompt(data: any, options: any): string {
    return `Generate a comprehensive lending report for this business:

${JSON.stringify(data, null, 2)}

Options:
${JSON.stringify(options, null, 2)}

Include:
1. Executive summary with recommendation
2. Business overview
3. Financial performance analysis
4. Cash flow analysis
5. 5 C's credit assessment
6. Risk factors and mitigants
7. Anomaly flags
8. Recommended terms and conditions
9. Supporting data tables
10. Health score breakdown

Return JSON format with structured sections.`;
  }
  
  private static parseJSONResponse(response: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try to parse entire response
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.error('Response received:', response);
      
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
