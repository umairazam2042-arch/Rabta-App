import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthTabs from '../components/auth/AuthTabs'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import useAuth from '../hooks/useAuth'
import { validateLogin } from '../utils/validators'
import getErrorMessage from '../utils/getErrorMessage'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('') // backend ka error (jaise Invalid credentials)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateLogin(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    setServerError('')
    try {
      await login(form.identifier.trim(), form.password)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-muted">Log in to see what your friends posted.</p>
      </div>

      <AuthTabs />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Alert message={serverError} />
        <Input
          id="identifier"
          name="identifier"
          label="Username or email"
          placeholder="Enter your username or email"
          autoComplete="username"
          value={form.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="text-center text-muted">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default LoginPage