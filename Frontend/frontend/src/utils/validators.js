export const USERNAME_REGEX = /^[a-z0-9_.]+$/
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/
export const MIN_AGE = 13

// Date of birth se umar nikalne ka helper
export const calculateAge = (dob) => {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

// Login form: errors ka object wapis deta hai (khali object = sab theek)
export const validateLogin = ({ identifier, password }) => {
  const errors = {}

  if (!identifier.trim()) errors.identifier = 'Username or email is required'
  if (!password) errors.password = 'Password is required'

  return errors
}

// Register form
export const validateRegister = ({ username, email, password, dob }) => {
  const errors = {}
  const name = username.trim().toLowerCase()

  if (!name) errors.username = 'Username is required'
  else if (name.length < 3) errors.username = 'Username must be at least 3 characters'
  else if (name.length > 30) errors.username = 'Username must be at most 30 characters'
  else if (!USERNAME_REGEX.test(name))
    errors.username = 'Only letters, numbers, underscore and dot are allowed'

  if (!email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'Please enter a valid email'

  if (!password) errors.password = 'Password is required'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters'

  if (!dob) {
    errors.dob = 'Date of birth is required'
  } else {
    const dobDate = new Date(dob)
    if (dobDate > new Date()) errors.dob = 'Date of birth cannot be in the future'
    else if (calculateAge(dobDate) < MIN_AGE)
      errors.dob = `You must be at least ${MIN_AGE} years old`
  }

  return errors
}