import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser, registerUser, submitDriverRequest, getMyDriverStatus, logout } from "./user.api";
import { setAccessToken } from "@/utils/tokens";


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
      setAccessToken(data.accessToken);
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

export const useSubmitDriverRequest = () => {
  return useMutation({
    mutationFn: submitDriverRequest,

    onSuccess: (data) => {
      toast.success("Driver request submitted successfully! 🚗", {
        description: "Your request is pending admin approval",
      });
    },

    onError: (error) => {
      toast.error("Failed to submit driver request ❌", {
        description:
          error.response?.data?.message || "Something went wrong",
      });
    },
  });
};

export const useGetMyDriverStatus = () => {
  return useQuery({
    queryKey: ["my-driver-status"],
    queryFn: getMyDriverStatus,
    retry: false,
    // If endpoint doesn't exist (404), treat as no status
    onError: (error) => {
      if (error.response?.status === 404) {
        return { data: { status: 'none' } };
      }
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};
