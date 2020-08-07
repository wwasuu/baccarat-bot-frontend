import React, { useState } from "react"
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Header, Modal, Icon } from "semantic-ui-react";
import Cookies from "js-cookie";
import { auth_logout } from "../store";

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isShownConfirmLogout, setIsShownConfirmLogout] = useState(false)
  function logout() {
    dispatch(auth_logout());
    Cookies.remove("auth")
    history.push("/login");
  }
  return (
    <>
    <div className="navbar">
      <img src="/logo.png" alt="logo" />
      <Button circular color="teal" size="medium" basic icon="log out" onClick={() => setIsShownConfirmLogout(true)} />
    </div>
    <Modal
        basic
        onClose={() => setIsShownConfirmLogout(false)}
        onOpen={() => setIsShownConfirmLogout(true)}
        open={isShownConfirmLogout}
        size="small"
        closeOnDimmerClick={false}
      >
        <Header icon>คุณต้องการออกจากระบบใช่หรือใช่ไหม</Header>
        <Modal.Actions>
          <Button onClick={() => setIsShownConfirmLogout(false)}>
            <Icon name="remove" /> ไม่ใช่
          </Button>
          <Button color="teal" onClick={logout}>
            <Icon name="checkmark" /> ใช่
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Navbar;
