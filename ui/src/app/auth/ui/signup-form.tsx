"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { CircleCheckBig, CircleX } from "lucide-react"
import { useRouter } from "next/navigation"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { signUpWithEmailAndPassword, continueWithGoogle, authError } = useAuth()
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter()

  const passwordsMatch = password !== "" && confirm !== "" && password === confirm;


  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!passwordsMatch) return; 

    const error = await signUpWithEmailAndPassword(email, password, name)
    if (!error) {
      router.push('/')
    }
    setPassword("");
    setConfirm("");
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={ handleSignUp }>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" name="name" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="john.doe@example.com"
                required
                className={
                  authError?.code === 'auth/email-already-in-use'
                  ? 'border-red-500 border-2' 
                  : '' 
                }
              />
              {authError?.code === "auth/email-already-in-use" && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <CircleX size={16} className="text-red-500" />
                  <span>This email is already registered.</span>
                </div>
              )}
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
              id="password"
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />

              {password !== "" && confirm !== "" && !passwordsMatch && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <CircleX size={16} className="text-red-500" />
                  <span>Passwords do not match.</span>
                </div>
              )}

              {password !== "" && confirm !== "" && passwordsMatch && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                  <CircleCheckBig size={16} className="text-green-600" />
                  <span>Passwords match.</span>
                </div>
              )}

              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
              id="confirm-password"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <Field>
              <Button type="submit" disabled={!passwordsMatch} className="cursor-pointer">Create Account</Button>
              <Button className="cursor-pointer" variant="outline" type="button" onClick={ continueWithGoogle }>
                Sign up with Google
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account? <Link href={'/auth/signin'}>Sign In</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}