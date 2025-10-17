/**
 * URL Generator for ABAP Keyword Documentation
 * Maps individual .md files to official SAP ABAP documentation URLs
 */

import { BaseUrlGenerator } from './BaseUrlGenerator.js';
import { DocUrlConfig } from '../metadata.js';

/**
 * ABAP URL Generator for official SAP documentation
 * Converts .md filenames to proper help.sap.com URLs
 */
export class AbapUrlGenerator extends BaseUrlGenerator {
  
  generateSourceSpecificUrl(context: any): string | null {
    
    // Extract filename without extension
    let filename = context.relFile.replace(/\.md$/, '');
    
    // Remove 'md/' prefix if present (from sources/abap-docs/docs/7.58/md/)
    filename = filename.replace(/^md\//, '');
    
    // Convert .md filename back to .html for SAP documentation
    const htmlFile = filename + '.html';
    
    // Get version from config or default to latest (which now points to cloud version)
    const version = this.extractVersion() || 'latest';
    
    // Build SAP help URL
    const baseUrl = this.getAbapBaseUrl(version);
    const fullUrl = `${baseUrl}/${htmlFile}`;
    
    // Add anchor if provided
    return context.anchor ? `${fullUrl}#${context.anchor}` : fullUrl;
  }
  
  /**
   * Extract ABAP version from config
   */
  private extractVersion(): string | null {
    const libraryId = this.libraryId || '';
    const pathPattern = this.config.pathPattern || '';
    const baseUrl = this.config.baseUrl || '';
    const combined = `${libraryId}|${pathPattern}|${baseUrl}`.toLowerCase();
    
    if (combined.includes('latest') || combined.includes('cloud')) {
      return 'latest';
    }
    
    const decimalSources = [baseUrl, pathPattern, libraryId];
    for (const source of decimalSources) {
      const match = source?.match(/(?:\/|_|-)(\d+\.\d+)(?=(?:\/|_|-|\.|$))/);
      if (match) {
        return match[1];
      }
    }
    
    const compactSources = [libraryId, pathPattern, baseUrl];
    for (const source of compactSources) {
      const match = source?.match(/(?:\/|_|-)(\d{3})(?=(?:\/|_|-|\.|$))/);
      if (match) {
        const digits = match[1];
        return `${digits[0]}.${digits.slice(1)}`;
      }
    }
    
    return null;
  }
  
  /**
   * Get base URL for ABAP documentation based on version
   */
  private getAbapBaseUrl(version: string): string {
    // Handle latest version - use the newest cloud version
    const normalized = version.toLowerCase();
    
    if (normalized === 'latest' || normalized === 'cloud') {
      return 'https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US';
    }
    
    const versionNum = parseFloat(version);
    if (Number.isNaN(versionNum)) {
      return 'https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US';
    }
    
    // Cloud versions (9.1x) - ABAP Cloud / SAP BTP
    if (versionNum >= 9.1) {
      return 'https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US';
    }
    
    // S/4HANA 2025 versions (8.1x)
    if (versionNum >= 8.1) {
      // Use the cloud pattern for S/4HANA 2025 as well, since they share the same doc structure
      return 'https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US';
    }
    
    // Legacy versions (7.x) - keep existing pattern
    const versionCode = version.replace('.', '');
    return `https://help.sap.com/doc/abapdocu_${versionCode}_index_htm/${version}/en-US`;
  }
}

/**
 * Generate ABAP documentation URL
 */
export function generateAbapUrl(libraryId: string, relativeFile: string, config: DocUrlConfig, anchor?: string): string | null {
  const generator = new AbapUrlGenerator(libraryId, config);
  return generator.generateSourceSpecificUrl({ 
    relFile: relativeFile, 
    content: '', 
    config, 
    libraryId,
    anchor 
  });
}
