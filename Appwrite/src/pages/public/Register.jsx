import { Button } from "@/Components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { useRegister } from "@/api's/user/user.query"

import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"


export function Register() {

  const [Name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate();



  const { mutateAsync, isPending } = useRegister();



  async function handleRegister() {
    try {
      await mutateAsync({
        name: Name,
        fullName,
        email,
        phoneNumber,
        password,
      });

      navigate('/login')

    } catch (error) {
      toast.error("Registration failed ❌", {
        description:
          error.response?.data?.message || "Something went wrong",
      });
    }
  }



  return (
    <>
      <div className=" min-h-screen flex  items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Register to your account</CardTitle>
            <CardDescription>
              Enter your email below to Register to your account
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={() => navigate('/login')}>Login</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">

                <div className="grid gap-2">
                  <Label htmlFor="email">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your Name"
                    required onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Enter your FullName"
                    required
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>


                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="text"
                    placeholder="Enter your phoneNumber"
                    required
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>

                  </div>
                  <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={handleRegister}
              disabled={isPending}
            >
              {isPending ? "Registering..." : "Register"}
            </Button>

            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </Card>

      </div>
    </>

  )
}
