const getErrorMessage = (error) => {
  // Backend ne jawab diya lekin error ke saath
  if (error.response) {
    const { message, errors } = error.response.data || {}
    if (Array.isArray(errors) && errors.length > 0) return errors.join('. ')
    return message || 'Something went wrong'
  }
  // Request gayi lekin jawab nahi aaya (backend band hai, ya internet nahi)
  if (error.request) return 'Cannot reach the server. Please try again.'

  return error.message || 'Something went wrong'
}

export default getErrorMessage