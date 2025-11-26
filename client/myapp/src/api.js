// import axios from 'axios';

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
// });

// // interceptor to attach token
// API.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default API;




import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// interceptor to attach token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  // Only parse if token exists and is valid
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
  }

  return config;
});

export default API;
