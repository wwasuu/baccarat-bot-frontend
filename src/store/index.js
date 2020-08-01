import { createStore, compose, combineReducers } from "redux";

const auth_login = (payload) => ({
  type: "AUTH/LOGIN",
  payload: payload,
});

const auth_loading = () => ({
  type: "AUTH/LOADING",
});

const initialStateAuth = {
  id: "",
  bot_id: "",
  username: "",
  isLoggedIn: false,
  error: null,
  loading: false,
};

const auth = (state = initialStateAuth, action) => {
  switch (action.type) {
    case "AUTH/LOGIN":
      state = {
        id: action.payload.id,
        bot_id: action.payload.bot_id,
        username: action.payload.username,
        isLoggedIn: true,
        error: null,
        loading: false,
      };
      break;
    case "AUTH/LOADING":
      state = {
        id: "",
        bot_id: "",
        username: "",
        isLoggedIn: false,
        error: null,
        loading: true,
      };
      break;
    default:
      state = { ...state };
      break;
  }
  return state;
};

const rootReducer = combineReducers({
  auth,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers());

export default store;

export { auth_login, auth_loading };
