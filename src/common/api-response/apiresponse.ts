export function apiResponse(statusCode: number, message: string, data?: any) {
    return {
        statusCode,
        message,
        data,
    }
}