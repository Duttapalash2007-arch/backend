import app from './app.js';
import { connectDB } from './config/db.js';
import { envConfig } from './config/env.js';
import { logger } from './utils/logger.js';
import { dailyReportSummaryJob, cleanupOldReportsJob } from './jobs/report.job.js';
import { highRiskAlertJob, pendingReportReminderJob } from './jobs/alert.job.js';

let server;

/**
 * Start server
 */
const startServer = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('MongoDB connected');

    logger.info('Starting scheduled jobs...');
    dailyReportSummaryJob();
    cleanupOldReportsJob();
    highRiskAlertJob();
    pendingReportReminderJob();
    logger.info('Scheduled jobs started');
  } catch (error) {
    logger.error('MongoDB connection failed during startup:', error.message);
    logger.warn('Server will start anyway; DB-backed routes will retry the connection on request.');
  }

  server = app.listen(envConfig.port, () => {
    logger.info(`Server running on port ${envConfig.port}`);
    logger.info(`Environment: ${envConfig.nodeEnv}`);
    logger.info('-----------------------------------');
    logger.info('Healthcare Assistant Backend Ready');
    logger.info('-----------------------------------');
  });
};

/**
 * Handle process termination
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

export default app;
