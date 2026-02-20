import { getAccessToken, removeAccessToken, setAccessToken } from "@/utils/tokens";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/token/refresh/`, {}, { withCredentials: true })
                const newAccessToken = response.data.accessToken;
                setAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return axiosInstance(originalRequest);

            } catch (error) {
                removeAccessToken()
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return Promise.reject(error)
            }
        }

        if (error.response?.status === 403) {
            console.error("Permission Denied:", error.response.data.message);
        }


        return Promise.reject(error);

    }

)

export default axiosInstance