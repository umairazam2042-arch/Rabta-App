import React, { useEffect, useRef, useState } from 'react'
import { MailCheck, X } from 'lucide-react'
import Button from '../common/Button'
import useCountdown from '../../hooks/useCountdown'
import getErrorMessage from '../../utils/getErrorMessage'
import maskEmail from '../../utils/maskEmail'

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

const emptyDigits = () => Array(OTP_LENGTH).fill('')

const OtpModal = ({ email, onVerify, onResend, onClose }) => {
  const dialogRef = useRef(null)
  const inputRefs = useRef([])

  const [digits, setDigits] = useState(emptyDigits)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(`OTP sent to ${maskEmail(email)}. Please check your inbox.`)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { secondsLeft, start } = useCountdown(RESEND_SECONDS)

  const otp = digits.join('')

  // Dikhte hi dialog kholo aur pehle khane mein cursor rakho
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    inputRefs.current[0]?.focus()
  }, [])

  // Poora code (paste ya autofill) ek saath khanon mein bharo
  const fillDigits = (text) => {
    const chars = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
    if (chars.length === 0) return

    const next = emptyDigits()
    chars.forEach((char, i) => {
      next[i] = char
    })
    setDigits(next)
    inputRefs.current[Math.min(chars.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '')
    setError('')

    // Poora code ek saath aaya (autofill)
    if (cleaned.length >= OTP_LENGTH) {
      fillDigits(cleaned)
      return
    }

    const digit = cleaned.slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    setError('')
    fillDigits(e.clipboardData.getData('text'))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')
    try {
      await onVerify(otp)
    } catch (err) {
      setError(getErrorMessage(err)) // jaise "Incorrect OTP"
      setDigits(emptyDigits())
      start(0) // galat OTP par Resend foran available
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    try {
      await onResend()
      setNotice(`A new OTP has been sent to ${maskEmail(email)}`)
      setDigits(emptyDigits())
      start(RESEND_SECONDS)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="otp-title"
      className="m-auto w-[min(92vw,26rem)] rounded-3xl p-0 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="relative flex flex-col items-center gap-5 p-8 text-center">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close and change email"
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-xl text-muted hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
          <MailCheck size={28} />
        </span>

        <div>
          <h2 id="otp-title" className="text-2xl font-bold">
            Verify your email
          </h2>
          <p className="mt-2 text-muted">
            Enter the 6-digit code we sent to{' '}
            <span className="font-semibold text-ink">{maskEmail(email)}</span>
          </p>
        </div>

        {notice && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {notice}
          </p>
        )}

        <fieldset className="flex flex-col items-center gap-3">
          <legend className="sr-only">6-digit verification code</legend>

          <div className="flex gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                value={digit}
                aria-label={`Digit ${index + 1}`}
                aria-invalid={error ? 'true' : 'false'}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={`size-12 rounded-xl border bg-white text-center text-xl font-bold outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${
                  error ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            ))}
          </div>

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </fieldset>

        <Button type="submit" loading={isVerifying} disabled={otp.length < OTP_LENGTH}>
          Verify &amp; create account
        </Button>

        <p className="text-sm text-muted">
          Did not get the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || isResending}
            className="font-semibold text-brand hover:text-brand-dark disabled:cursor-not-allowed disabled:text-muted disabled:hover:text-muted"
          >
            {isResending
              ? 'Sending...'
              : secondsLeft > 0
                ? `Resend OTP in ${secondsLeft}s`
                : 'Resend OTP'}
          </button>
        </p>
      </form>
    </dialog>
  )
}

export default OtpModal