import prisma from '../config/database';
import { ParsedFinancials } from '../types/financials.types';
import { AIService } from './ai.service';

export class DocumentService {
  static async createDocument(sourceFormat: string, filename?: string, fileSize?: number): Promise<string> {
    const document = await prisma.financialDocument.create({
      data: {
        source_format: sourceFormat,
        filename: filename,
        file_size_bytes: fileSize,
        parsed_data: {},
        extraction_confidence: 'low',
        extraction_warnings: [],
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
      }
    });
    
    return document.id;
  }
  
  static async getDocument(id: string) {
    return prisma.financialDocument.findUnique({
      where: { id },
      include: { analyses: true }
    });
  }
  
  static async updateDocument(id: string, data: any) {
    return prisma.financialDocument.update({
      where: { id },
      data
    });
  }
  
  static async deleteDocument(id: string) {
    return prisma.financialDocument.delete({
      where: { id }
    });
  }
  
  static async getDocumentsByBusinessName(businessName: string) {
    return prisma.financialDocument.findMany({
      where: { business_name: businessName },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }
  
  static async saveAnalysis(
    documentId: string,
    analysisType: string,
    result: any,
    inputHash: string,
    modelUsed: string = 'claude-sonnet-4-20250514',
    tokensInput?: number,
    tokensOutput?: number,
    durationMs?: number,
    fromCache: boolean = false
  ) {
    try {
      return await prisma.analysis.create({
        data: {
          document_id: documentId,
          analysis_type: analysisType,
          input_hash: inputHash,
          result,
          model_used: modelUsed,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          duration_ms: durationMs,
          from_cache: fromCache
        }
      });
    } catch (error) {
      // If duplicate key, update existing analysis
      if (error.code === 'P2002') {
        return await prisma.analysis.update({
          where: { input_hash: inputHash },
          data: {
            result,
            model_used: modelUsed,
            tokens_input: tokensInput,
            tokens_output: tokensOutput,
            duration_ms: durationMs,
            from_cache: fromCache
          }
        });
      }
      
      throw error;
    }
  }
  
  static async getAnalysis(documentId: string, analysisType: string, inputHash: string) {
    return prisma.analysis.findFirst({
      where: {
        document_id: documentId,
        analysis_type: analysisType,
        input_hash: inputHash
      }
    });
  }
  
  static async getAnalysesByDocument(documentId: string) {
    return prisma.analysis.findMany({
      where: { document_id: documentId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  static async saveApiUsage(apiKeyHash: string, tier: string, endpoint: string, requestWeight: number, responseStatus: number, durationMs: number, tokensUsed?: number, fromCache: boolean = false) {
    return prisma.apiUsage.create({
      data: {
        api_key_hash: apiKeyHash,
        tier,
        endpoint,
        request_weight: requestWeight,
        response_status: responseStatus,
        duration_ms: durationMs,
        tokens_used: tokensUsed,
        from_cache: fromCache
      }
    });
  }
  
  static async getApiUsageByKey(apiKeyHash: string, startDate: Date, endDate: Date) {
    return prisma.apiUsage.findMany({
      where: {
        api_key_hash: apiKeyHash,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  static async cleanupExpiredDocuments() {
    const now = new Date();
    return prisma.financialDocument.deleteMany({
      where: {
        expires_at: { lte: now }
      }
    });
  }
}
