import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`)
  })
  console.error("\n💡 Please check your .env file and ensure all required variables are set.")
  process.exit(1)
}

console.log("✅ Environment variables loaded successfully")

export default process.env
