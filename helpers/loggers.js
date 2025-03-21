import fs from 'fs';
import path from 'path';

const logFile = 'logs/crud_operations.txt';

// Đảm bảo thư mục logs tồn tại
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

export const writeLog = (action, status, details) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${action} - ${status}: ${details}\n`;
    
    fs.appendFileSync(logFile, logMessage);
}; 