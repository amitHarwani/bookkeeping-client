export class ApiErrorResponse {
    constructor(
        public statusCode: number,
        public message: string,
        public errors: Array<any>,
        public stack: string
    ) {}
}
export class ApiError {
    constructor(
        public errorMessage: string,
        public errorResponse?: ApiErrorResponse
    ) {}
}
