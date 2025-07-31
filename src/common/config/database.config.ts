// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
    // uri: process.env.MONGODB_URI || 'mongodb+srv://younesserbai:osHjcggXenJ2W2ee@peditrackdb.woxoz7b.mongodb.net/PediTrack',
  // options: {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
  //   connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),
  // },
  // Remove the debug option
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
}));
