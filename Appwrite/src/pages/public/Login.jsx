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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { useLogin } from "@/api's/user/user.query";
import { toast } from "sonner";
import { setAccessToken } from "@/utils/tokens";



function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  

  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  const setaccessToken = useAuthStore((state) => state.setAccessToken)



  function handleNavigateToRegisterPage() {
    navigate("/register");
  }

  async function handleLogInUser() {
    if (!email || !password) {
      toast.warning("Email and password are required");
      return;
    }

    try {
      const data = await mutateAsync({
        email,
        password,
      });

      // Update Zustand auth store
      setCurrentUser(data.user);
      setaccessToken(data.accessToken)
      setAccessToken(data.accessToken)

      // Navigate based on user role
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error("Login failed ❌", {
        description:
          error.response?.data?.message || "Invalid email or password",
      });
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
          <Button onClick={handleLogInUser} className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
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
