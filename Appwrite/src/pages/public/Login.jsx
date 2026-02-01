import { Button } from "@/Components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import AppwriteAccount from "@/appwrite/AccountServices";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { getUserByAuthId } from "@/utils/userDetailesTableOps";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const appwriteAccount = new AppwriteAccount();

  function handleNavigateToRegisterPage() {
    navigate("/register");
  }

  async function handleLogInUser() {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      const result = await appwriteAccount.createAppwriteLogin(email, password);
      
      console.log(result, "anand");
      const authUser = await appwriteAccount.getAppwriteUser();
      console.log("zustand store ", authUser);
      useAuthStore.getState().setCurrentUser(authUser);
      const profile = await getUserByAuthId(authUser.$id);
      console.log("profile", profile);


      if (!profile) {
        alert("User profile not found");
        return;
      }
      if (profile.role === "admin") {
        console.log("admin");  
        navigate('/admin');
        return ''
      } else {
        console.log("user dashboard");
        
        navigate("/findaRide", { replace: true });
        return ''
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }

  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={handleNavigateToRegisterPage}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button onClick={handleLogInUser} className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
