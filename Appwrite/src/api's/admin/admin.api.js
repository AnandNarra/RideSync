import axios from "axios";

const URL = "http://localhost:5000";

export const getAllDriverRequests = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${URL}/api/v1/drivers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateDriverRequestStatus = async ({ driverId, status, rejectedReason }) => {
  const token = localStorage.getItem("token");
  const payload = { status };
  if (rejectedReason) {
    payload.rejectedReason = rejectedReason;
  }

  const { data } = await axios.patch(
    `${URL}/api/v1/drivers/${driverId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};


