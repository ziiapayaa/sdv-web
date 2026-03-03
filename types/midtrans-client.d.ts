declare module 'midtrans-client' {
  export class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    transaction: {
      refund(orderId: string, parameters: any): Promise<any>;
    };
  }
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(parameter: any): Promise<any>;
  }
}
