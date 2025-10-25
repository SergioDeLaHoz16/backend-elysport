import { BasePayment } from "./Payment.js"

export class CashPayment extends BasePayment {
  constructor(data) {
    super(data)
    this.method = "CASH"
  }

  process() {
    return {
      ...this.getInfo(),
      processingMethod: "Cash payment",
      instructions: "Payment received in cash at reception",
    }
  }

  validate() {
    return true // Cash always valid when received
  }
}
