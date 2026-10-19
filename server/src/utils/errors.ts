export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(
        message = 'Validation failed',
        details?: unknown,
    ) {
        super(message, 400, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

export class InvalidStatusTransitionError extends AppError {
    constructor(from: string, to: string) {
        super(
            `Cannot transition project from ${from} to ${to}`,
            409,
        );
    }
}