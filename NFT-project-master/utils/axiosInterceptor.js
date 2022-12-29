import axios from "axios";

console.log("env call", process.env.NEXT_PUBLIC_SERVER_URL);
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}`
});
axiosInstance.interceptors.request.use((req) => {
  req.headers = {
    ...req.headers
  };

  return req;
});
export default axiosInstance;
