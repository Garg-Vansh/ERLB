export const getSystemMetrics = () => {
  const memory = process.memoryUsage();

  return {
    uptimeSeconds: process.uptime(),
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external
    },
    timestamp: new Date().toISOString()
  };
};
