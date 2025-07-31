// ====================
// 6. Custom Exception Filter (patient-exception.filter.ts)
// ====================
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class PatientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PatientExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        errors = (errorResponse as any).errors || null;
      } else {
        message = errorResponse as string;
      }
    } else if (exception instanceof MongoError) {
      // Handle MongoDB specific errors
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry found';

        // Extract field name from duplicate key error
        const field = Object.keys((exception as any).keyPattern || {})[0];
        if (field) {
          message = `A patient with this ${field} already exists`;
        }
      }
    } else if (exception instanceof Error) {
      // Handle validation errors and other generic errors
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation failed';
        errors = this.formatValidationErrors(exception);
      } else if (exception.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID format';
      }
    }

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatValidationErrors(error: any): any {
    const formattedErrors: any = {};

    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        formattedErrors[key] = error.errors[key].message;
      });
    }

    return formattedErrors;
  }
}
