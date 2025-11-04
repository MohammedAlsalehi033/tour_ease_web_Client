export interface ResponseModel<T> {
  success: boolean;
  count: number;
  data: T[] | T;
}