import jwt from "jsonwebtoken"

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

// These functions are kept for backward compatibility but should use Supabase

// import prisma from "./prisma.js"

// export const saveRefreshToken = async (userId, token) => {
//   const decoded = jwt.decode(token)
//   const expiresAt = new Date(decoded.exp * 1000)
//
//   await prisma.refreshToken.create({
//     data: {
//       userId,
//       token,
//       expiresAt,
//     },
//   })
// }

// export const deleteRefreshToken = async (token) => {
//   await prisma.refreshToken.delete({
//     where: { token },
//   })
// }

// export const deleteAllUserRefreshTokens = async (userId) => {
//   await prisma.refreshToken.deleteMany({
//     where: { userId },
//   })
// }
