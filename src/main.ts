import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.use(cookieParser());
  
  // Configure helmet with cross-origin resource policy
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Enable CORS with comprehensive configuration
  app.enableCors({
    origin: [
      // 'http://localhost:3001',
      // 'http://localhost:3000',
      // 'http://localhost:3005',
      process.env.FRONTEND_URL || 'http://localhost:5174',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition']
  });

  // IMPORTANT: Apply CORS middleware BEFORE serving static files
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    // Set CORS headers for static files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });

  // Serve static files from the 'uploads' directory AFTER CORS middleware
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Alternative: Use NestJS static assets (choose one of the two approaches above)
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  //   setHeaders: (res) => {
  //     res.header('Access-Control-Allow-Origin', '*');
  //     res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  //   }
  // });

  mongoose.connection.once('open', () => {
    console.log('Connected. Collections:', Object.keys(mongoose.connection.collections));
  });

  // Try multiple ports if the default one is in use
  const ports = [3005, 3006, 3007, 3008, 3009];
  const defaultPort = parseInt(process.env.PORT) || 3005;

  let currentPort = defaultPort;
  let serverStarted = false;

  // First try the default port
  try {
    await app.listen(currentPort);
    serverStarted = true;
    console.log(`Application is running on port ${currentPort}`);
    console.log(`Static files served at: http://localhost:${currentPort}/uploads/`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${currentPort} is already in use. Trying alternative ports...`,
      );
    } else {
      throw error;
    }
  }

  // If default port failed, try alternatives
  if (!serverStarted) {
    for (const port of ports) {
      if (port === defaultPort) continue;

      try {
        await app.listen(port);
        console.log(`Application is running on port ${port}`);
        console.log(`Static files served at: http://localhost:${port}/uploads/`);
        serverStarted = true;
        break;
      } catch (error) {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use.`);
        } else {
          throw error;
        }
      }
    }
  }
  if (!serverStarted) {
    console.error(
      `Could not find an available port. Please manually specify an open port using the PORT environment variable.`,
    );
    process.exit(1);
  }
}

bootstrap();