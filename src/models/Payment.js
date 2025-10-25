// Base Payment class
export class BasePayment {
  constructor(data) {
    this.id = data.id
    this.userId = data.userId
    this.subscriptionId = data.subscriptionId
    this.amount = data.amount
    this.method = data.method
    this.status = data.status
    this.transactionId = data.transactionId
    this.notes = data.notes
    this.createdAt = data.createdAt
  }

  getInfo() {
    return {
      id: this.id,
      userId: this.userId,
      subscriptionId: this.subscriptionId,
      amount: this.amount,
      method: this.method,
      status: this.status,
      transactionId: this.transactionId,
      notes: this.notes,
      createdAt: this.createdAt,
    }
  }

  process() {
    throw new Error("Process method must be implemented")
  }
}
