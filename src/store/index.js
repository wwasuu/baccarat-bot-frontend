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

const bot_clear = () => ({
  type: "AUTH/CLEAR_BOT",
});

const initialAuthState = {
  id: "",
  bot_id: "",
  username: "",
  isLoggedIn: false,
  error: null,
  loading: false,
};

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
  profit_percent: "",
  loss_percent: "",
  profit_threshold: 0,
  loss_threshold: 0,
  init_wallet: 0,
  init_bet: 50,
  max_turn: 0,
  bot_type: 1,
  id: undefined,
  is_infinite: false,
  is_opposite: false
};

const auth = (state = initialAuthState, action) => {
  switch (action.type) {
    case "AUTH/SET_BOT":
      state = {
        ...state,
        bot_id: action.payload.id,
      };
      break;
    case "AUTH/CLEAR_BOT":
      state = {
        ...state,
        bot_id: null,
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
      return {
        ...state,
        ...action.payload,
      };
    case "BOT_SETTING/SET":
      return {
        ...state,
        ...action.payload,
      };
    case "BOT_SETTING/CLEAR":
      return initialBotSettingState;
    default:
      // console.log(state)
      return state;
  }
};

const initialBotTransaction = [];

const bot_transaction_set = (payload) => ({
  type: "BOT_TRANSACTION/SET",
  payload: payload,
});

const botTransaction = (state = initialBotTransaction, action) => {
  switch (action.type) {
    case "BOT_TRANSACTION/SET":
      return action.payload;
    default:
      return state;
  }
};

const initialErrorBotSetting = [];

const error_bot_setting_set = (payload) => ({
  type: "ERROR_BOT_SETTING/SET",
  payload: payload,
});

const error_bot_setting_clear = () => ({
  type: "ERROR_BOT_SETTING/CLEAR",
});

const errorBotSetting = (state = initialErrorBotSetting, action) => {
  switch (action.type) {
    case "ERROR_BOT_SETTING/SET":
      return action.payload;
    case "ERROR_BOT_SETTING/CLEAR":
      return initialErrorBotSetting;
    default:
      return state;
  }
};

const initialWallet = {
  profit_wallet: 0,
  all_wallet: 0,
  play_wallet: 0,
};

const wallet_set = (payload) => ({
  type: "WALLET/SET",
  payload: payload,
});

const wallet_clear = () => ({
  type: "WALLET/CLEAR",
});

const wallet = (state = initialWallet, action) => {
  switch (action.type) {
    case "WALLET/SET":
      return { ...state, ...action.payload };
    case "WALLET/CLEAR":
      return initialWallet;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  auth,
  botSetting,
  botTransaction,
  errorBotSetting,
  wallet,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers());

export default store;

export {
  auth_login,
  auth_loading,
  bot_setting_set,
  auth_logout,
  bot_setting_init,
  bot_transaction_set,
  auth_setbot,
  bot_setting_clear,
  error_bot_setting_set,
  error_bot_setting_clear,
  bot_clear,
  wallet_set,
  wallet_clear,
};
