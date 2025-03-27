import fs from 'fs';
import path from 'path';

const loggerMiddleware = (logsDir) => {
  // Ensure the logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();
    const originalEnd = res.end;

    // Override response.end to log after response completion
    res.end = function (chunk, encoding, callback) {
      const duration = Date.now() - startTime;
      const logEntry = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;

      // Log request to access.log
      fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);

      // Log detailed CRUD operations
      if (req.url.startsWith('/students')) {
        const crudLog = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;
        const crudLogPath = res.statusCode == 200 ? 'crud_success.log' : 'crud_error.log';
        fs.appendFileSync(path.join(logsDir, crudLogPath), crudLog);
      }

      // Call the original response.end
      originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  };
};

export default loggerMiddleware;