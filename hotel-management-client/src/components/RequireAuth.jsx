import { useEffect } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequiredAuth = () => {
  let token = window.localStorage.getItem("the_token") || null;
  const location = useLocation();
  useEffect(() => {
    token = localStorage.getItem("the_token") || null;
  }, [location.pathname]);

  return token ? (
    <Outlet />
  ) : (
    <Navigate to={"/signup"} state-={{ from: location }} replace />
  );
};

export default RequiredAuth;
