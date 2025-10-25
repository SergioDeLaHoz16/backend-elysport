import { BasePayment } from "./Payment.js"

export class NequiPayment extends BasePayment {
  constructor(data) {
    super(data)
    this.method = "NEQUI"
  }

  process() {
    return {
      ...this.getInfo(),
      processingMethod: "Nequi mobile payment",
      instructions: "Transfer to Nequi number: 300-123-4567",
    }
  }

  validate() {
    return this.transactionId && this.transactionId.length > 0
  }
}
