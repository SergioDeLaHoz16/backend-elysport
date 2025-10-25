export const sanitizeUser = (user) => {
  const { password, ...sanitized } = user
  return sanitized
}

export const sanitizeUsers = (users) => {
  return users.map(sanitizeUser)
}
