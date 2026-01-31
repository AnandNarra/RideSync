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
import AppwriteAccount from "@/appwrite/AccountServices"
import { createUserDetailes } from "@/utils/userDetailesTableOps"


import { useState } from "react"
import { useNavigate } from "react-router"


export function Register() {

  const [Name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate();

  const appWriteAccount = new AppwriteAccount()


  async function handleRegister() {
    console.log(email, password, Name);

    const result = await appWriteAccount.createAppwriteAccount( email, Name, password)

    console.log("result :- ",result)
    
    const dbResult = await createUserDetailes({

      $id: result.$id,
      Name,
      fullName,
      email,
      phoneNumber
    })

    console.log("db result :- ",dbResult)
    if (dbResult.success === false) {
      alert("Database save failed...")
      result
    }

    navigate('/login')
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
            <Button type="button" className="w-full" onClick={handleRegister}>
              Register
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
