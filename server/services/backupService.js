const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.createDatabaseBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  const filename = `backup-${timestamp}.gz`;
  const filepath = path.join(backupDir, filename);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const mongoUri = process.env.MONGODB_URI;
  return new Promise((resolve, reject) => {
    exec(`mongodump --uri="${mongoUri}" --archive="${filepath}" --gzip`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Backup failed: ${error.message}`));
        return;
      }
      resolve({ filename, filepath, size: fs.statSync(filepath).size, createdAt: new Date() });
    });
  });
};

exports.listBackups = async () => {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir)
    .filter((f) => f.endsWith('.gz'))
    .map((f) => {
      const filepath = path.join(backupDir, f);
      const stats = fs.statSync(filepath);
      return { filename: f, filepath, size: stats.size, createdAt: stats.birthtime };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return files;
};

exports.restoreBackup = async (filename) => {
  const filepath = path.join(__dirname, '../../backups', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found');
  }

  const mongoUri = process.env.MONGODB_URI;
  return new Promise((resolve, reject) => {
    exec(`mongorestore --uri="${mongoUri}" --archive="${filepath}" --gzip --drop`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Restore failed: ${error.message}`));
        return;
      }
      resolve({ message: 'Backup restored successfully', filename });
    });
  });
};
