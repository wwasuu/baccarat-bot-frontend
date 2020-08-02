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

const auth_setbot = (payload) => ({
  type: "AUTH/SET_BOT",
  payload,
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
  payload,
});

const initialBalanceState = 0;

const bot_setting_set = (payload) => ({
  type: "BOT_SETTING/SET",
  payload: payload,
});

const bot_setting_clear = () => ({
  type: "BOT_SETTING/CLEAR",
});

const bot_setting_init = (payload) => ({
  type: "BOT_SETTING/INIT",
  payload: payload,
});

const initialBotSettingState = {
  bet_side: 1,
  money_system: 1,
  profit_percent: 1,
  loss_percent: 1,
  profit_threshold: 0,
  loss_threshold: 0,
  init_wallet: 0,
  init_bet: 50,
  max_turn: 0,
  bot_type: 1,
};

const auth = (state = initialAuthState, action) => {
  switch (action.type) {
    case "AUTH/SET_BOT":
      state = {
        ...state,
        bot_id: action.payload.id,
      };
      break;
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
        profit_threshold:
          action.payload.init_wallet +
          action.payload.init_wallet * (state.profit_percent / 100),
        loss_threshold:
          action.payload.init_wallet -
          action.payload.init_wallet * (state.loss_percent / 100),
      };
      break;
    case "BOT_SETTING/SET":
      state = {
        ...action.payload,
        profit_threshold:
          action.payload.init_wallet +
          action.payload.init_wallet * (state.profit_percent / 100),
        loss_threshold:
          action.payload.init_wallet -
          action.payload.init_wallet * (state.loss_percent / 100),
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

const initialBotTransaction = [];

const bot_transaction_set = (payload) => ({
  type: "BOT_TRANSACTION/SET",
  payload: payload,
});

const botTransaction = (state = initialBotTransaction, action) => {
  switch (action.type) {
    case "BOT_TRANSACTION/SET":
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
  balance,
  botTransaction,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers());

export default store;

export {
  auth_login,
  auth_loading,
  bot_setting_set,
  auth_logout,
  balance_set,
  bot_setting_init,
  bot_transaction_set,
  auth_setbot,
  bot_setting_clear
};
