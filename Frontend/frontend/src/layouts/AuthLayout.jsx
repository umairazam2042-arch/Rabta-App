import React from 'react'
import { Outlet } from 'react-router'
import Logo from '../components/common/Logo'
import { APP_NAME } from '../config/constants'

// Login aur Register dono is layout ke andar dikhte hain (<Outlet /> ki jagah)
const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="flex flex-col justify-between gap-10 bg-ink p-8 text-white lg:w-1/2 lg:p-16">
        <Logo light />
        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight lg:text-5xl">
            Share moments with the people who matter.
          </h1>
          <p className="mt-4 max-w-sm text-lg text-slate-300">
            Post photos, follow friends and keep up with everyone in one calm feed.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AuthLayout