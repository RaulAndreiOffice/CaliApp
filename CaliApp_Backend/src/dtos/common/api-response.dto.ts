export interface SuccessResponseDTO<T> {
  success: true;
  data: T;
  meta?: any;
}
