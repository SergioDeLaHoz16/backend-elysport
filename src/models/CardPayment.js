import { BasePayment } from "./Payment.js"

export class CardPayment extends BasePayment {
  constructor(data) {
    super(data)
    this.method = "CARD"
  }

  process() {
    return {
      ...this.getInfo(),
      processingMethod: "Credit/Debit card payment",
      instructions: "Payment processed through card terminal",
    }
  }

  validate() {
    return this.transactionId && this.transactionId.length >= 6
  }
}
