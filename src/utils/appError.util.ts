export class AppError extends Error {
  public readonly statusCode: number;
  constructor(
    message: string,
    statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
