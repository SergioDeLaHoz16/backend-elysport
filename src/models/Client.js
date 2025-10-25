import { Person } from "./Person.js"

export class Client extends Person {
  constructor(data) {
    super(data)
    this.weight = data.profile?.weight
    this.height = data.profile?.height
    this.bmi = data.profile?.bmi
    this.fitnessGoal = data.profile?.fitnessGoal
    this.medicalNotes = data.profile?.medicalNotes
  }

  calculateBMI() {
    if (this.weight && this.height) {
      const heightInMeters = this.height / 100
      this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(2)
      return this.bmi
    }
    return null
  }

  getBMICategory() {
    if (!this.bmi) return "Unknown"
    const bmiValue = Number.parseFloat(this.bmi)
    if (bmiValue < 18.5) return "Underweight"
    if (bmiValue < 25) return "Normal"
    if (bmiValue < 30) return "Overweight"
    return "Obese"
  }

  getInfo() {
    return {
      ...super.getInfo(),
      weight: this.weight,
      height: this.height,
      bmi: this.bmi,
      bmiCategory: this.getBMICategory(),
      fitnessGoal: this.fitnessGoal,
      medicalNotes: this.medicalNotes,
    }
  }

  updatePhysicalData(weight, height) {
    this.weight = weight
    this.height = height
    this.calculateBMI()
  }
}
