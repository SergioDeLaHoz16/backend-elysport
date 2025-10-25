// Observer Pattern for notifications
export class NotificationSubject {
  constructor() {
    this.observers = []
  }

  attach(observer) {
    this.observers.push(observer)
  }

  detach(observer) {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  async notify(event) {
    for (const observer of this.observers) {
      await observer.update(event)
    }
  }
}
