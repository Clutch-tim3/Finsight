export const COMMENTARY_PROMPT = `You are a senior financial analyst writing a professional financial commentary. Please analyze the provided financial data and write a ${wordCount} commentary in ${style} style with ${tone} tone.

Audience: ${audience}
Business Name: ${businessName}
Period: ${periodLabel}

Financial Data:
${JSON.stringify(financialData, null, 2)}

Include:
1. A clear headline that summarises the performance
2. Key financial highlights and trends
3. Analysis of profitability, liquidity, and cash flow
4. Risks and opportunities
5. Recommendations for improvement (if ${includeRecommendations})
6. A table of key metrics at the end

${style === 'credit_memo' ? 'This is for a lending decision - focus on creditworthiness, repayment capacity, and risk factors.' : ''}
${style === 'investor_update' ? 'Focus on growth potential, return on investment, and future prospects.' : ''}
${style === 'board_pack' ? 'Be concise and strategic, highlighting key performance indicators and strategic implications.' : ''}

Structure the response in JSON format with:
- "headline": string
- "body": string (with paragraphs separated by \\n\\n)
- "key_metrics_table": array of { "metric": string, "value": string }

Do not include any other formatting.`;
