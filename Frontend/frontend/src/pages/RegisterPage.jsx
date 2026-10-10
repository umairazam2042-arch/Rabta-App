import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthTabs from '../components/auth/AuthTabs'
import OtpModal from '../components/auth/OtpModal'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'
import useAuth from '../hooks/useAuth'
import { registerUser, sendSignupOtp } from '../services/auth.service'
import { validateRegister } from '../utils/validators'
import getErrorMessage from '../utils/getErrorMessage'

const RegisterPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', dob: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // null = OTP wala box band. { token, email } = box khula hua
  const [otpSession, setOtpSession] = useState(null)

  // Aaj ki date (YYYY-MM-DD): date picker mein future ki date select nahi hogi
  const today = new Date().toISOString().split('T')[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  // Email par OTP bhejo (pehli baar bhi, aur Resend par bhi yehi chalta hai)
  const requestOtp = async () => {
    const data = await sendSignupOtp({
      username: form.username.trim(),
      email: form.email.trim(),
      dob: form.dob,
    })
    setOtpSession({ token: data.otpToken, email: data.email })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateRegister(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    setServerError('')
    try {
      await requestOtp()
    } catch (error) {
      setServerError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // OTP box mein sahi code dalne par: account banao, login karo, Home par bhejo
  // (galat OTP par ye error phenkta hai, aur OtpModal use dikhata hai)
  const handleVerify = async (otp) => {
    await registerUser({
      username: form.username.trim(),
      email: otpSession.email,
      password: form.password,
      dob: form.dob,
      otp,
      otpToken: otpSession.token,
    })

    try {
      await login(otpSession.email, form.password)
      navigate('/', { replace: true })
    } catch {
      // Account ban chuka hai, sirf login nahi hua: user ko login page par bhej do
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-muted">We will send a code to your email to verify it.</p>
      </div>

      <AuthTabs />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Alert message={serverError} />
        <Input
          id="username"
          name="username"
          label="Username"
          placeholder="Enter a unique username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="example@gmail.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          id="dob"
          name="dob"
          type="date"
          label="Date of birth"
          max={today}
          value={form.dob}
          onChange={handleChange}
          error={errors.dob}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button type="submit" loading={isSubmitting}>
          Continue
        </Button>
      </form>

      <p className="text-center text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:text-brand-dark">
          Log in
        </Link>
      </p>

      {otpSession && (
        <OtpModal
          email={otpSession.email}
          onVerify={handleVerify}
          onResend={requestOtp}
          onClose={() => setOtpSession(null)}
        />
      )}
    </div>
  )
}

export default RegisterPage