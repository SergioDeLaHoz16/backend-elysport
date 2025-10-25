import { BasePayment } from "./Payment.js"

export class DaviplataPayment extends BasePayment {
  constructor(data) {
    super(data)
    this.method = "DAVIPLATA"
  }

  process() {
    return {
      ...this.getInfo(),
      processingMethod: "Daviplata mobile payment",
      instructions: "Transfer to Daviplata number: 310-987-6543",
    }
  }

  validate() {
    return this.transactionId && this.transactionId.length > 0
  }
}
