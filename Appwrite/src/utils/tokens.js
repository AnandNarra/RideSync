const setAccessToken = (accessToken) => {
    localStorage.setItem('access-token', accessToken);
}

const getAccessToken = () => {
    return localStorage.getItem("access-token");
}



 const removeAccessToken = () =>
  localStorage.removeItem("access-token");


export {setAccessToken, getAccessToken , removeAccessToken};