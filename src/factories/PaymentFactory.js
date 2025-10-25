import { NequiPayment } from "../models/NequiPayment.js"
import { DaviplataPayment } from "../models/DaviplataPayment.js"
import { CashPayment } from "../models/CashPayment.js"
import { CardPayment } from "../models/CardPayment.js"

// Factory Method Pattern for creating payment instances
export class PaymentFactory {
  static createPayment(paymentData) {
    switch (paymentData.method) {
      case "NEQUI":
        return new NequiPayment(paymentData)
      case "DAVIPLATA":
        return new DaviplataPayment(paymentData)
      case "CASH":
        return new CashPayment(paymentData)
      case "CARD":
        return new CardPayment(paymentData)
      default:
        throw new Error(`Unknown payment method: ${paymentData.method}`)
    }
  }

  static createPayments(paymentsData) {
    return paymentsData.map((paymentData) => this.createPayment(paymentData))
  }
}
