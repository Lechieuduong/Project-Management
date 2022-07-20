import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let message;

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            message = {
                statusCode: 500,
                message: 'Internal Server Error'
            }
        } else {
            message = exception.getResponse();
        }

        response
            .status(status)
            .json(message);
    }
}