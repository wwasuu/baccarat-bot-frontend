import { createStore, compose, combineReducers } from "redux";

const auth_login = (payload) => ({
  type: "AUTH/LOGIN",
  payload,
});

const auth_logout = () => ({
  type: "AUTH/LOGOUT",
});

const auth_loading = () => ({
  type: "AUTH/LOADING",
});

const initialAuthState = {
  id: "",
  bot_id: "",
  username: "",
  isLoggedIn: false,
  error: null,
  loading: false,
};

const balance_set = (payload) => ({
    type: "BALANCE/SET",
    payload
  });

const initialBalanceState = 0
  
const bot_setting_set = (payload) => ({
  type: "BOT_SETTING/SET",
  payload: payload,
});

const bot_setting_init = (payload) => ({
  type: "BOT_SETTING/INIT",
  payload: payload,
});

const initialBotSettingState = {
  bet_side: 1,
  money_system: 1,
  profit: 1,
  loss: 1,
  profit_threshold: 0,
  loss_threshold: 0,
  init_wallet: 0,
  init_bet: 50,
  max_turn: 0,
  bot_type: 1,
};

const auth = (state = initialAuthState, action) => {
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
    case "AUTH/LOGOUT":
      state = initialAuthState;
      break;
    default:
      state = { ...state };
      break;
  }
  return state;
};

const botSetting = (state = initialBotSettingState, action) => {
  switch (action.type) {
    case "BOT_SETTING/INIT":
      state = {
        ...action.payload,
        profit_threshold: action.payload.init_wallet + (action.payload.init_wallet * (state.profit / 100)),
        loss_threshold: action.payload.init_wallet - (action.payload.init_wallet * (state.profit / 100)) ,
      };
      break;
    case "BOT_SETTING/SET":
      state = {
        ...action.payload,
        profit_threshold: state.init_wallet + (state.init_wallet * (state.profit / 100)),
        loss_threshold: state.init_wallet - (state.init_wallet * (state.profit / 100)) ,
      };
      break;
    case "BOT_SETTING/CLEAR":
      state = initialBotSettingState;
      break;
    default:
      state = { ...state };
      break;
  }
  return state;
};

const balance = (state = initialBalanceState, action) => {
    switch (action.type) {
      case "BALANCE/SET":
        state = action.payload;
        break;
      default:
        state = state;
        break;
    }
    return state;
  };

const rootReducer = combineReducers({
  auth,
  botSetting,
  balance
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers());

export default store;

export { auth_login, auth_loading, bot_setting_set, auth_logout, balance_set, bot_setting_init };
