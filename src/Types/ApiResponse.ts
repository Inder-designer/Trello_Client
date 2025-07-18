export interface ApiResponse {
    statusCode: number,
    success: boolean,
    message: string,
    data: any
}

export interface ErrResponse {
    status: number,
    data: {
        success: boolean,
        message: string,
    }
}