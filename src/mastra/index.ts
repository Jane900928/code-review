import { Mastra } from '@mastra/core';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';

// Import agents
import { codeReviewAgent } from './agents/codeReviewAgent.js';
import { securityAgent } from './agents/securityAgent.js';
import { performanceAgent } from './agents/performanceAgent.js';
import { qualityAgent } from './agents/qualityAgent.js';

// Import tools
import { codeAnalysisTool } from './tools/codeAnalysisTool.js';
import { securityScanTool } from './tools/securityScanTool.js';

// Import workflows
import { comprehensiveReviewWorkflow } from './workflows/comprehensiveReviewWorkflow.js';
import { quickReviewWorkflow } from './workflows/quickReviewWorkflow.js';

export const mastra = new Mastra({
  // Register all agents
  agents: {
    codeReviewAgent,
    securityAgent,
    performanceAgent,
    qualityAgent,
  },

  // Register all tools  
  tools: {
    codeAnalysisTool,
    securityScanTool,
  },

  // Register all workflows
  workflows: {
    comprehensiveReviewWorkflow,
    quickReviewWorkflow,
  },

  // Server configuration for development
  server: {
    port: process.env.PORT || 4111,
    host: process.env.HOST || '0.0.0.0',
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
  },

  // Conditionally add deployer only for build/deploy commands
  ...(process.env.NODE_ENV === 'production' && {
    deployer: new CloudflareDeployer({
      projectName: 'code-review-agent',
      scope: process.env.CLOUDFLARE_ACCOUNT_ID,
      auth: {
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
      },
      workerNamespace: 'code-review',
      routes: process.env.CLOUDFLARE_ZONE_NAME ? [
        {
          pattern: '*',
          zone_name: process.env.CLOUDFLARE_ZONE_NAME,
          custom_domain: process.env.CLOUDFLARE_CUSTOM_DOMAIN === 'true',
        },
      ] : undefined,
      env: {
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      },
    }),
  }),

  // Enable telemetry for monitoring (optional)
  telemetry: {
    serviceName: 'code-review-agent',
    enabled: process.env.ENABLE_TELEMETRY === 'true',
    sampling: {
      type: 'ratio',
      probability: 0.1,
    },
  },
});

export default mastra;