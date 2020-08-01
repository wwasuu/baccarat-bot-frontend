import React from "react"
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button } from "semantic-ui-react";
import Cookies from "js-cookie";
import { auth_logout } from "../store";

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  function logout() {
    dispatch(auth_logout());
    Cookies.remove("auth")
    history.push("/login");
  }
  return (
    <div className="navbar">
      <Button circular color="teal" size="medium" basic icon="log out" onClick={logout} />
    </div>
  );
};

export default Navbar;
