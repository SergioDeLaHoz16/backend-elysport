import { Client } from "../models/Client.js"
import { Trainer } from "../models/Trainer.js"
import { Admin } from "../models/Admin.js"

// Factory Pattern for creating person instances
export class PersonFactory {
  static createPerson(userData) {
    switch (userData.role) {
      case "CLIENT":
        return new Client(userData)
      case "TRAINER":
        return new Trainer(userData)
      case "ADMIN":
        return new Admin(userData)
      default:
        throw new Error(`Unknown role: ${userData.role}`)
    }
  }

  static createPersons(usersData) {
    return usersData.map((userData) => this.createPerson(userData))
  }
}
