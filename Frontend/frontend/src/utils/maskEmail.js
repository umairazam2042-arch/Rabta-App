// ali_khan@gmail.com -> al******@gmail.com
const maskEmail = (email) => {
  const [name, domain] = email.split('@')
  if (!domain) return email

  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`
}

export default maskEmail