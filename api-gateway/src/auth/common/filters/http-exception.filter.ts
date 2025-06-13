// This file is identical to the one in your monolith.
// For brevity, I will omit the code, but you should copy it here.
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        // ... same code as your monolith
    }
}