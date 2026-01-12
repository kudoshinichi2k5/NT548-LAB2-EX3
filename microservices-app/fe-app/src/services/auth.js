import axios from 'axios';

const url = "";

export const registerApi = async (email, username, password) => {
  try {
    console.log(import.meta.env.VITE_API_AUTH_URL);
    const response = await axios.post(`${url}/api/user/registration`, {
      email,
      username,
      password
    });

    return response.data;
  } catch (error){
    throw error.response?.data || { message: error.message };
  }
}

export const verifyOtpApi = async (email, otpCode) => {
  try {
    const response = await axios.post(`${url}/api/user/verifyOtp`, {
      email,
      otpCode
    }) 
    return response.data;
  }
  catch (error) {
    throw error.response?.data || { message: error.message};
  }

}

export const loginApi = async (login, password) => {
    try {
    const response = await axios.post(`${url}/api/user/login`, {
      login,
      password,
    });
    
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
}

export const updateAvatarApi = async (file, accessToken) => {
  const formData = new FormData();
  formData.append("image", file); 

  const response = await axios.post(
    `${url}/api/user/updateAvatar`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


export const forgotPasswordApi = async (email) => {
  try {
    const response = await axios.post(`${url}/api/user/forgotPassword`, {
      email
    }) 
    return response.data;
  }
  catch (error) {
    throw error.response?.data || { message: error.message };
  }

}

export const resetPasswordApi = async (email, newPassword) => {
  try {
    const response = await axios.post(`${url}/api/user/resetPassword`, {
      email,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const refreshAccessTokenApi = async (refreshToken) => {
  try {
    const response = await axios.post(`${url}/api/user/refreshAccessToken`, {
      refreshToken
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const logoutApi = async (refreshToken) => {
  try {
    const response = await axios.post(`${url}/api/user/logout`, {
      refreshToken
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};