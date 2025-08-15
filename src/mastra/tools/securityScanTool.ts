import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const securityScanTool = createTool({
  id: 'security-scan-tool',
  description: 'Scans code for security vulnerabilities and risks',
  inputSchema: z.object({
    code: z.string().describe('Source code to scan for security issues'),
    language: z.string().describe('Programming language of the code'),
    scanType: z.enum(['injection', 'xss', 'auth', 'crypto', 'all']).describe('Type of security scan to perform'),
  }),
  outputSchema: z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Overall risk level'),
    vulnerabilities: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      location: z.string().optional(),
      cwe: z.string().optional(), // Common Weakness Enumeration
      recommendation: z.string(),
      example: z.string().optional(),
    })).describe('List of identified vulnerabilities'),
    securityScore: z.number().min(0).max(10).describe('Security score from 0-10'),
    recommendations: z.array(z.string()).describe('Security improvement recommendations'),
  }),
  execute: async ({ context }) => {
    const { code, language, scanType } = context;
    
    const vulnerabilities = [];
    let securityScore = 9; // Start with high security score
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // SQL Injection checks
    if (scanType === 'injection' || scanType === 'all') {
      const sqlPatterns = [
        /SELECT\s+\*\s+FROM\s+\w+\s+WHERE\s+\w+\s*=\s*['"]?\$\w+['"]?/gi,
        /INSERT\s+INTO\s+\w+.*\$\w+/gi,
        /UPDATE\s+\w+\s+SET.*\$\w+/gi,
        /DELETE\s+FROM\s+\w+\s+WHERE.*\$\w+/gi,
      ];
      
      sqlPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'high' as const,
            description: 'Potential SQL injection vulnerability detected',
            cwe: 'CWE-89',
            recommendation: 'Use parameterized queries or prepared statements',
            example: 'Use $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?"); instead of direct concatenation',
          });
          securityScore -= 2;
          riskLevel = 'high';
        }
      });
    }
    
    // XSS checks
    if (scanType === 'xss' || scanType === 'all') {
      const xssPatterns = [
        /innerHTML\s*=\s*[^;]+\$\w+/gi,
        /document\.write\s*\([^)]*\$\w+/gi,
        /eval\s*\([^)]*\$\w+/gi,
        /outerHTML\s*=\s*[^;]+\$\w+/gi,
      ];
      
      xssPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          vulnerabilities.push({
            type: 'Cross-Site Scripting (XSS)',
            severity: 'medium' as const,
            description: 'Potential XSS vulnerability through unsafe DOM manipulation',
            cwe: 'CWE-79',
            recommendation: 'Sanitize user input and use textContent instead of innerHTML',
            example: 'Use element.textContent = userInput; instead of element.innerHTML = userInput;',
          });
          securityScore -= 1.5;
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      });
    }
    
    // Authentication checks
    if (scanType === 'auth' || scanType === 'all') {
      if (code.includes('password') && !code.includes('hash') && !code.includes('bcrypt')) {
        vulnerabilities.push({
          type: 'Weak Password Handling',
          severity: 'high' as const,
          description: 'Password appears to be stored or compared in plain text',
          cwe: 'CWE-256',
          recommendation: 'Use proper password hashing algorithms like bcrypt, scrypt, or Argon2',
          example: 'const hashedPassword = await bcrypt.hash(password, 10);',
        });
        securityScore -= 2;
        riskLevel = 'high';
      }
    }
    
    // Cryptography checks
    if (scanType === 'crypto' || scanType === 'all') {
      const weakCryptoPatterns = [
        /MD5\s*\(/gi,
        /SHA1\s*\(/gi,
        /DES\s*\(/gi,
        /RC4\s*\(/gi,
      ];
      
      weakCryptoPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          vulnerabilities.push({
            type: 'Weak Cryptographic Algorithm',
            severity: 'medium' as const,
            description: 'Usage of cryptographically weak algorithm detected',
            cwe: 'CWE-327',
            recommendation: 'Use strong cryptographic algorithms like SHA-256, AES, or newer',
            example: 'Use crypto.createHash("sha256") instead of MD5 or SHA1',
          });
          securityScore -= 1;
        }
      });
    }
    
    // General security checks
    if (scanType === 'all') {
      // Check for hardcoded secrets
      const secretPatterns = [
        /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi,
        /password\s*[=:]\s*['"][^'"]+['"]/gi,
        /token\s*[=:]\s*['"][^'"]+['"]/gi,
        /secret\s*[=:]\s*['"][^'"]+['"]/gi,
      ];
      
      secretPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          vulnerabilities.push({
            type: 'Hardcoded Secrets',
            severity: 'critical' as const,
            description: 'Hardcoded API keys, passwords, or secrets detected',
            cwe: 'CWE-798',
            recommendation: 'Use environment variables or secure configuration management',
            example: 'const apiKey = process.env.API_KEY; instead of const apiKey = "abc123";',
          });
          securityScore -= 3;
          riskLevel = 'critical';
        }
      });
      
      // Check for unsafe functions
      if (code.includes('eval(') || code.includes('exec(') || code.includes('system(')) {
        vulnerabilities.push({
          type: 'Code Injection',
          severity: 'high' as const,
          description: 'Usage of dangerous functions that can lead to code injection',
          cwe: 'CWE-94',
          recommendation: 'Avoid using eval, exec, or system functions with user input',
          example: 'Use safer alternatives or properly validate and sanitize input',
        });
        securityScore -= 2;
        if (riskLevel !== 'critical') riskLevel = 'high';
      }
    }
    
    // Determine final risk level based on vulnerabilities
    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
    
    if (criticalCount > 0) {
      riskLevel = 'critical';
    } else if (highCount > 0) {
      riskLevel = 'high';
    } else if (mediumCount > 0) {
      riskLevel = 'medium';
    }
    
    // Generate recommendations
    const recommendations = [
      'Implement input validation and sanitization',
      'Use parameterized queries for database operations',
      'Keep dependencies and frameworks up to date',
      'Enable security headers (CSP, HSTS, etc.)',
      'Implement proper error handling to avoid information disclosure',
      'Use secure coding practices and regular security training',
      'Perform regular security audits and penetration testing',
    ];
    
    // Add specific recommendations based on found vulnerabilities
    if (vulnerabilities.some(v => v.type.includes('SQL'))) {
      recommendations.unshift('Immediately review and fix SQL injection vulnerabilities');
    }
    if (vulnerabilities.some(v => v.type.includes('XSS'))) {
      recommendations.unshift('Implement proper output encoding and CSP headers');
    }
    if (vulnerabilities.some(v => v.type.includes('Hardcoded'))) {
      recommendations.unshift('Remove all hardcoded secrets and use secure configuration management');
    }
    
    return {
      riskLevel,
      vulnerabilities,
      securityScore: Math.max(0, Math.min(10, securityScore)),
      recommendations: recommendations.slice(0, 6), // Limit to 6 recommendations
    };
  },
});

export default securityScanTool;