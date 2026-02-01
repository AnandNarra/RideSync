import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser, registerUser } from "./user.api";


export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      toast.success("Registration successful 🎉", {
        description: "You can now login to your account",
      });
    },

    onError: (error) => {
      toast.error("Registration failed ❌", {
        description:
          error.response?.data?.message || "Something went wrong",
      });
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful 🚀", {
        description: `Welcome back, ${data.user.name}`,
      });
    },

    onError: (error) => {
      toast.error("Login failed ❌", {
        description:
          error.response?.data?.message || "Invalid credentials",
      });
    },
  });
};
