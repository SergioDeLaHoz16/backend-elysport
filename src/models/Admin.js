import { Person } from "./Person.js"

export class Admin extends Person {
  constructor(data) {
    super(data)
    this.permissions = ["all"]
  }

  getInfo() {
    return {
      ...super.getInfo(),
      permissions: this.permissions,
    }
  }

  hasPermission(permission) {
    return this.permissions.includes("all") || this.permissions.includes(permission)
  }
}
