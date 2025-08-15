import { Mastra } from '@mastra/core';

// 创建一个基础的Mastra实例用于开发环境
export const mastra = new Mastra({
  // 基础配置
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4111,
    host: process.env.HOST || '0.0.0.0',
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
  },

  // 暂时注释掉agents，先让基础服务运行起来
  // agents: {},
  // tools: {},  
  // workflows: {},

  // 遥测配置
  telemetry: {
    serviceName: 'code-review-agent',
    enabled: false, // 开发环境下关闭
  },
});

export default mastra;