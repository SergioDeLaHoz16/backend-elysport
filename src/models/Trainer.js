import { Person } from "./Person.js"

export class Trainer extends Person {
  constructor(data) {
    super(data)
    this.specialization = data.profile?.specialization
    this.certifications = data.profile?.certifications
  }

  getInfo() {
    return {
      ...super.getInfo(),
      specialization: this.specialization,
      certifications: this.certifications,
    }
  }
}
