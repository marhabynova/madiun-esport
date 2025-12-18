export const AppError = {
    Validation: class Validation extends Error {
        public statusCode = 400
        constructor(message = 'Validation error') {
            super(message)
            this.name = 'ValidationError'
        }
    },
    NotFound: class NotFound extends Error {
        public statusCode = 404
        constructor(message = 'Not found') {
            super(message)
            this.name = 'NotFoundError'
        }
    },
    Forbidden: class Forbidden extends Error {
        public statusCode = 403
        constructor(message = 'Forbidden') {
            super(message)
            this.name = 'ForbiddenError'
        }
    },
    Conflict: class Conflict extends Error {
        public statusCode = 409
        constructor(message = 'Conflict') {
            super(message)
            this.name = 'ConflictError'
        }
    },
    Internal: class Internal extends Error {
        public statusCode = 500
        constructor(message = 'Internal error') {
            super(message)
            this.name = 'InternalError'
        }
    },
}

export type AppErrorType = InstanceType<typeof AppError.Validation> | InstanceType<typeof AppError.Internal>

// Usage examples:
// throw new AppError.NotFound('Match not found')
// handler can map `.statusCode` to HTTP response
