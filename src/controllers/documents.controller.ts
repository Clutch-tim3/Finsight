import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { AIService } from '../services/ai.service';
import { ParsedFinancials } from '../types/financials.types';

export class DocumentsController {
  static async uploadDocument(req: Request, res: Response) {
    try {
      const { text, json_data, document_type = 'auto', currency_hint, period_hint, business_name } = req.body;
      const file = req.file;
      
      let sourceFormat: string;
      let rawText: string;
      
      if (file) {
        // Handle file upload
        sourceFormat = this.determineSourceFormat(file.originalname, file.mimetype);
        // In real implementation, parse the file based on format
        rawText = `Mock content for ${file.originalname}`; // This would be actual file content
      } else if (json_data) {
        sourceFormat = 'json';
        rawText = JSON.stringify(json_data);
      } else if (text) {
        sourceFormat = 'raw_text';
        rawText = text;
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_INPUT',
            message: 'Either a file, text, or JSON data is required'
          }
        });
      }
      
      // Create document record
      const documentId = await DocumentService.createDocument(
        sourceFormat,
        file?.originalname,
        file?.size
      );
      
      // Extract document metadata
      const extractionResult = await AIService.extractData(rawText, document_type);
      
      // Process parsed data
      const parsedData: ParsedFinancials = {
        document_type: extractionResult.document_type || 'raw_figures',
        period_start: extractionResult.period_start,
        period_end: extractionResult.period_end,
        currency: extractionResult.currency || currency_hint || 'ZAR',
        business_name: extractionResult.business_name || business_name,
        bank_name: extractionResult.bank_name,
        account_number_masked: extractionResult.account_number_masked,
        transactions: [], // This would be populated from bank statement parsing
        income_statement: null,
        balance_sheet: null,
        cash_flow: null,
        raw_text: rawText,
        extraction_confidence: 'high', // Mocked for demo
        extraction_warnings: []
      };
      
      await DocumentService.updateDocument(documentId, {
        business_name: parsedData.business_name,
        bank_name: parsedData.bank_name,
        currency: parsedData.currency,
        period_start: parsedData.period_start ? new Date(parsedData.period_start) : null,
        period_end: parsedData.period_end ? new Date(parsedData.period_end) : null,
        period_months: extractionResult.period_months,
        parsed_data: parsedData,
        extraction_confidence: parsedData.extraction_confidence,
        extraction_warnings: parsedData.extraction_warnings
      });
      
      // Track API usage
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'upload',
        2,
        200,
        Date.now() - (req as any).startTime
      );
      
      res.json({
        success: true,
        data: {
          document_id: documentId,
          source_format: sourceFormat,
          filename: file?.originalname,
          pages: 1,
          detected_metadata: {
            document_type: parsedData.document_type,
            document_type_confidence: 'high',
            business_name: parsedData.business_name,
            bank_name: parsedData.bank_name,
            account_number_masked: parsedData.account_number_masked,
            account_type: extractionResult.account_type,
            currency: parsedData.currency,
            period_start: parsedData.period_start,
            period_end: parsedData.period_end,
            period_months: extractionResult.period_months,
            total_transactions_extracted: extractionResult.total_transactions_extracted,
            total_credits_count: extractionResult.total_credits_count,
            total_debits_count: extractionResult.total_debits_count,
            total_credits_amount: extractionResult.total_credits_amount,
            total_debits_amount: extractionResult.total_debits_amount,
            net_movement: extractionResult.net_movement
          },
          extraction_confidence: parsedData.extraction_confidence,
          extraction_warnings: parsedData.extraction_warnings,
          available_analyses: [
            'ratios', 'cashflow', 'revenue', 'anomalies',
            'creditworthiness', 'commentary', 'benchmark',
            'health_score', 'lending_report', 'full'
          ],
          expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      
      await DocumentService.saveApiUsage(
        (req as any).apiKeyHash,
        (req as any).tier,
        'upload',
        2,
        500,
        Date.now() - (req as any).startTime
      );
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload and parse document',
          details: error.message
        }
      });
    }
  }
  
  static async getDocument(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      
      const document = await DocumentService.getDocument(document_id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          document_id: document.id,
          source_format: document.source_format,
          filename: document.filename,
          file_size_bytes: document.file_size_bytes,
          business_name: document.business_name,
          bank_name: document.bank_name,
          currency: document.currency,
          period_start: document.period_start?.toISOString(),
          period_end: document.period_end?.toISOString(),
          period_months: document.period_months,
          extraction_confidence: document.extraction_confidence,
          extraction_warnings: document.extraction_warnings,
          available_analyses: document.analyses.map((a: any) => a.analysis_type),
          expires_at: document.expires_at?.toISOString(),
          created_at: document.createdAt.toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting document:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENT_FAILED',
          message: 'Failed to retrieve document',
          details: error.message
        }
      });
    }
  }
  
  static async deleteDocument(req: Request, res: Response) {
    try {
      const { document_id } = req.params;
      
      await DocumentService.deleteDocument(document_id);
      
      res.json({
        success: true,
        data: { message: 'Document deleted successfully' }
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_DOCUMENT_FAILED',
          message: 'Failed to delete document',
          details: error.message
        }
      });
    }
  }
  
  private static determineSourceFormat(filename: string, mimeType: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(ext || '')) {
      return 'bank_statement_pdf';
    } else if (['xlsx', 'xls'].includes(ext || '')) {
      return 'management_accounts';
    } else if (['csv'].includes(ext || '')) {
      return 'bank_statement_csv';
    } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return 'bank_statement_image';
    } else {
      return 'raw_text';
    }
  }
}
