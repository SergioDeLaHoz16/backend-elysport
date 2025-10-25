// Base class for all person types (Abstract Factory Pattern)
export class Person {
  constructor(data) {
    this.id = data.id
    this.email = data.email
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.phone = data.phone
    this.role = data.role
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.profile = data.profile
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`
  }

  getInfo() {
    return {
      id: this.id,
      fullName: this.getFullName(),
      email: this.email,
      phone: this.phone,
      role: this.role,
      isActive: this.isActive,
    }
  }

  activate() {
    this.isActive = true
  }

  deactivate() {
    this.isActive = false
  }
}
