import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser, registerUser, submitDriverRequest, getMyDriverStatus, logout, getMyProfile, updateUserProfile } from "./user.api";
import { setAccessToken } from "@/utils/tokens";
import useAuthStore from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";


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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitDriverRequest,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-driver-status"] });
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
  const user = useAuthStore(state => state.user);
  return useQuery({
    queryKey: ["my-driver-status", user?._id],
    queryFn: getMyDriverStatus,
    enabled: !!user?._id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetch on every mount
    onError: (error) => {
      if (error.response?.status === 404) {
        return { data: { status: 'none' } };
      }
    },
  });
};

export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetch on every mount
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    mutationFn: updateUserProfile,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Profile updated! 🚀", {
        description: data.message
      });
    },

    onError: (error) => {
      toast.error("Update failed ❌", {
        description: error.response?.data?.message || "Internal server error"
      });
    }
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};
