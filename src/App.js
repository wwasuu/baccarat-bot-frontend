import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import Login from "./pages/auth/login";
import Bot from "./pages/bot";
import Setting from "./pages/setting";
import { auth_login } from "./store";

function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  useEffect(() => {
    validateAuth();
  }, []);

  function validateAuth() {
    const auth = Cookies.get("auth");
    if (auth) {
      const data = JSON.parse(auth);
      dispatch(
        auth_login({
          bot_id: data.bot_id,
          id: data.id,
          username: data.username,
        })
      );

      history.push("/setting");
    } else {
      history.push("/login");
    }
  }

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
      <Route exact path="/login" component={Login} />
      <Route exact path="/setting" component={Setting} />
      <Route exact path="/bot" component={Bot} />
    </Switch>
  );
}

export default App;
