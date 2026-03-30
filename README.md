# FinSightIQ API

The most powerful AI-driven business financial intelligence API available to developers globally. Send us any financial document — PDF bank statement, Excel management accounts, QuickBooks export — and get back structured financial intelligence.

## Overview

FinSightIQ API solves the structural problems in SME financial analysis:
- **Document Chaos**: Accepts ANY financial document format from ANY source
- **Analysis Bottleneck**: Replaces manual 45-90 minute reviews with 10-second API calls
- **Lack of Composability**: No platform-specific integrations required

## Features

- **Document Parsing**: Support for PDF, Excel, CSV, JSON, and raw text
- **Ratio Analysis**: 30+ financial ratios across 6 categories with benchmarks
- **Cash Flow Analysis**: Pattern detection, runway calculation, forecasting
- **Revenue Analysis**: Growth trends, concentration, quality assessment
- **Anomaly Detection**: Red flag detection for fraud and credit risk
- **Creditworthiness**: 5 C's assessment with lending recommendations
- **Health Score**: Composite score (0-100) with methodology transparency
- **Commentary**: AI-generated financial narratives in multiple styles
- **Benchmarking**: Industry peer comparisons across 20 sectors

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Anthropic API key (for AI features)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd finsightiq-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Database setup
npm run prisma:migrate
npm run seed

# Start development server
npm run dev
```

### Using Docker

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

## API Documentation

API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/openapi.yaml`

### Authentication

All API endpoints require an API key passed via the `X-RapidAPI-Key` header:

```http
X-RapidAPI-Key: your-api-key-here
```

### Example Usage

#### Upload Document and Get Analysis

```javascript
// JavaScript (Node.js) example
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_KEY = 'your-api-key';
const BASE_URL = 'http://localhost:3000';

async function analyzeDocument() {
  // Step 1: Upload document
  const formData = new FormData();
  formData.append('file', fs.createReadStream('bank_statement.pdf'));
  formData.append('document_type', 'bank_statement');
  formData.append('business_name', 'Prodigy Sports Platform');

  const uploadResponse = await axios.post(`${BASE_URL}/v1/documents/upload`, formData, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      ...formData.getHeaders()
    }
  });

  const { document_id } = uploadResponse.data.data;

  // Step 2: Get financial ratios
  const ratiosResponse = await axios.post(`${BASE_URL}/v1/documents/${document_id}/ratios`, {
    industry: 'professional_services',
    include_interpretations: true,
    include_benchmarks: true
  }, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  console.log('Ratios Analysis:', ratiosResponse.data.data);
}

analyzeDocument().catch(console.error);
```

#### Python Example

```python
import requests
import json

API_KEY = 'your-api-key'
BASE_URL = 'http://localhost:3000'

def analyze_document():
    # Step 1: Upload document
    files = {'file': open('bank_statement.pdf', 'rb')}
    data = {
        'document_type': 'bank_statement',
        'business_name': 'Prodigy Sports Platform'
    }
    
    headers = {'X-RapidAPI-Key': API_KEY}
    
    upload_response = requests.post(
        f'{BASE_URL}/v1/documents/upload',
        files=files,
        data=data,
        headers=headers
    )
    
    document_id = upload_response.json()['data']['document_id']
    
    # Step 2: Get health score
    health_response = requests.post(
        f'{BASE_URL}/v1/documents/{document_id}/health-score',
        headers={
            'X-RapidAPI-Key': API_KEY,
            'Content-Type': 'application/json'
        },
        json={}
    )
    
    print('Health Score:', health_response.json()['data'])

analyze_document()
```

### cURL Example

```bash
# Upload document
curl -X POST "http://localhost:3000/v1/documents/upload" \
  -H "X-RapidAPI-Key: your-api-key" \
  -F "file=@bank_statement.pdf" \
  -F "document_type=bank_statement" \
  -F "business_name=Prodigy Sports Platform"

# Get creditworthiness assessment
curl -X POST "http://localhost:3000/v1/documents/clx9k2.../creditworthiness" \
  -H "X-RapidAPI-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_purpose": "working_capital",
    "loan_amount_requested": 500000,
    "loan_currency": "ZAR",
    "loan_term_months": 24,
    "estimated_monthly_repayment": 25000
  }'
```

## API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/health` | GET | Health check and service status |
| `/v1/documents/upload` | POST | Upload and parse financial document |
| `/v1/documents/:id` | GET | Get document metadata and status |
| `/v1/documents/:id/delete` | DELETE | Delete document and all analyses |
| `/v1/documents/:id/ratios` | POST | Calculate financial ratios |
| `/v1/documents/:id/health-score` | POST | Get composite health score |
| `/v1/documents/:id/creditworthiness` | POST | Creditworthiness assessment |
| `/v1/documents/:id/commentary` | POST | Generate financial commentary |
| `/v1/documents/:id/cashflow` | POST | Cash flow analysis |
| `/v1/documents/:id/revenue` | POST | Revenue trend analysis |
| `/v1/documents/:id/anomalies` | POST | Anomaly and red flag detection |

### Response Format

All API endpoints follow the same response format:

```json
{
  "success": true,
  "data": { ... },
  "error": { ... },
  "meta": {
    "request_id": "req_...",
    "version": "1.0.0",
    "processing_ms": 4231,
    "from_cache": false,
    "document_id": "clx9k2..."
  }
}
```

## Rate Limiting

| Tier | Monthly Requests | Requests/Second | Features |
|------|------------------|-----------------|----------|
| FREE | 20 | 1 | Upload + ratios only |
| STARTER | 300 | 3 | All analysis endpoints |
| PRO | 2,000 | 10 | All + lending report |
| LENDER | 20,000 | 50 | All + batch + priority |
| ENTERPRISE | Unlimited | 100 | Custom SLAs + white-label |

## Architecture

### Tech Stack
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5 (strict mode)
- **Framework**: Express.js 4
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache**: Redis 7 (ioredis)
- **Queue**: BullMQ (async processing)
- **AI**: Anthropic Claude API
- **Document Parse**: pdf-parse + Tesseract.js
- **Excel/CSV**: SheetJS (xlsx)
- **Image**: Sharp for preprocessing

### Processing Pipeline

1. **Document Upload & Parse**: Detects format, routes to correct parser
2. **AI Extraction**: Extracts structured data from raw content
3. **Validation & Storage**: Validates data, stores in database
4. **Analysis**: Routes to appropriate analysis engine
5. **Caching**: Results cached for 24 hours
6. **Delivery**: Returns structured JSON response

## Quality & Security

- **TypeScript strict mode**: Zero implicit any
- **Data privacy**: Auto-purge after 72 hours
- **Encryption**: API keys hashed at rest
- **CORS**: Configurable origins
- **Rate limiting**: Redis-based sliding window
- **Validation**: Zod schema validation
- **Security**: Helmet, hpp, xss-clean

## License

MIT License

## Support

For support:
- Visit our [Documentation](http://localhost:3000/api-docs)
- Check our [Issues](https://github.com/finsightiq/api/issues)
- Contact us at support@finsightiq.com
