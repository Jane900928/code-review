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
  workflows: {
    comprehensiveReviewWorkflow,
    quickReviewWorkflow,
  },
  agents: {
    codeReviewAgent,
    securityAgent,
    performanceAgent,
    qualityAgent,
  },
  deployer: new CloudflareDeployer({
    projectName: "mastra-code-workers",
    env: {
      ENVIRONMENT: "production",
    },
  }),
});