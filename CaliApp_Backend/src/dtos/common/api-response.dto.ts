export interface SuccessResponseDTO<T> {
  success: true;
  data: T;
  meta?: any;
}

export interface ErrorResponseDTO {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
