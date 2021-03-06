import axios from "axios";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import _ from "lodash";
import { useHistory } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Divider,
  Header,
  Icon,
  Modal,
  Progress,
  Popup,
} from "semantic-ui-react";
import {
  BOT_URL,
  PAUSE_URL,
  START_URL,
  STOP_URL,
  USER_BOT_TRANSACTION_URL,
  USER_BOT_URL,
  WALLET_URL,
  SET_OPPOSITE_URL,
  BOT_INFO,
  SET_BET_SIDE_URL,
} from "../constants";
import {
  wallet_set,
  bot_clear,
  bot_setting_clear,
  bot_setting_init,
  bot_setting_set,
  bot_transaction_set,
  error_bot_setting_set,
} from "../store";
import { socket } from "../utils/socket";
import BotGraph from "./BotGraphs";
import "../styles/app.scss";

const BotInformation = (props) => {
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const botSetting = useSelector((state) => state.botSetting);
  const wallet = useSelector((state) => state.wallet);
  const botTransaction = useSelector((state) => state.botTransaction);
  const [rawData, setRawData] = useState([]);
  const dispatch = useDispatch();
  const errorBotSetting = useSelector((state) => state.errorBotSetting);
  const [dataMap, setDataMap] = useState({});
  const [
    isShownConfirmResetMoneySystem,
    setIsShownConfirmResetMoneySystem,
  ] = useState(false);
  const [isShownConfirmResetBetSide, setIsShownConfirmResetBetSide] = useState(
    false
  );
  const [isShownConfirmStop, setIsShownConfirmStop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [playData, setPlayData] = useState([]);
  const [turnover, setTurnOver] = useState(0);

  useEffect(() => {
    const room = `user${auth.id}`;
    socket.on(room, (data) => {
      console.log(data)
      if (data.action === "bet_result") {
        setPlayData(data.playData);
        setBotData(data.botObj);
        getUserBotTransaction();
      } else if (data.action === "restart_result") {
        if (data.data.success) {
          setPlayData(data.data.data.playData);
        }
      } else if (data.action === "info") {
        // console.log(data)
        setPlayData(data.playData);
        setTurnOver(data.turnover);
        dispatch(
          bot_setting_init({
            ...botSetting,
            profit_wallet: data.botObj.profit_wallet,
            deposite_count: data.botObj.deposite_count,
            status: data.botObj.status,
            is_opposite: data.botObj.is_opposite,
            bet_side: data.botObj.bet_side,
            loss_threshold: data.botObj.loss_threshold,
            loss_percent: data.botObj.loss_percent,
          })
        );
      } else if (data.action == "bet_success") {
        // console.log(data)
        setTurnOver(data.data.turnover);
      }
    });
  }, []);

  useEffect(() => {
    getUserBotTransaction();
  }, [botSetting.id]);

  useEffect(() => {
    getUserBot();
    getBotInfo();
  }, [auth.isLoggedIn]);

  async function setBotData(data) {
    console.log(data);
    dispatch(
      bot_setting_init({
        ...botSetting,
        profit_wallet: data.profit_wallet,
        deposite_count: data.deposite_count,
        status: data.status,
        is_opposite: data.is_opposite,
        loss_threshold: data.loss_threshold,
        loss_percent: data.loss_percent,
        bet_side: data.bet_side
      })
    );
  }

  async function getUserBotTransaction() {
    let bot_id = botSetting.id;
    if (!bot_id) {
      return;
    }
    try {
      const {
        data: { data },
      } = await axios.get(`${USER_BOT_TRANSACTION_URL}/${bot_id}`);
      // console.log(data);
      let transaction = [{ x: 0, y: 0, info: {} }];
      let transaction2 = [{ x: 0, y: 0, info: {} }];
      let i = 1;
      let dataIndex = 0;
      let indexMap = {};
      let previousValue = 0;
      let newData = _.sortBy(data, ["id"], ["ASC"]);
      console.log(newData);
      // let newData = data.sort(compare);
      setRawData(newData);
      newData.forEach((element) => {
        transaction.push({ x: i, y: element.wallet - element.bot.init_wallet });
        indexMap[i] = dataIndex;
        // if(element.wallet - element.bot.init_wallet == 0){
        //   transaction.push({ x: i, y: 0});
        //   transaction2.push({ x: i, y: 0});
        //   indexMap[i] = dataIndex;
        // }
        // else if(element.wallet - element.bot.init_wallet >= 0){
        //   if(previousValue < 0){
        //     transaction.push({ x: i, y: 0});
        //     transaction2.push({ x: i, y: 0});
        //     i++
        //   }

        //   transaction.push({ x: i, y: element.wallet - element.bot.init_wallet});
        //   transaction2.push({ x: i, y: 0});
        //   indexMap[i] = dataIndex;
        // }else{
        //   if(previousValue > 0){
        //     transaction.push({ x: i+0.5, y: 0});
        //     transaction2.push({ x: i+0.5, y: 0});
        //     i++
        //   }

        //   transaction2.push({ x: i, y: element.wallet - element.bot.init_wallet});
        //   transaction.push({ x: i, y: 0});
        //   indexMap[i] = dataIndex;
        // }
        // previousValue = element.wallet - element.bot.init_wallet
        i++;
        dataIndex++;
      });

      // let newData = _.sortBy(data, ["id"], ["ASC"]);
      // console.log(indexMap)
      setDataMap(indexMap);
      // console.log(transaction)
      dispatch(
        bot_transaction_set([
          {
            name: "series1",
            data: [...transaction],
          },
        ])
      );
    } catch (error) {
      console.log("error while call getUserBotTransaction()", error);
    }
  }

  async function getUserBot() {
    try {
      if (!auth.isLoggedIn) return;
      if (botSetting.bot_id) return;
      setIsLoadingWallet(true);
      const id = auth.id;
      const [{ data: botData }, { data: walletData }] = await Promise.all([
        axios.get(`${USER_BOT_URL}/${id}`),
        axios.get(`${WALLET_URL}/${id}`),
      ]);
      if (botData.success && botData.data.bot) {
        setIsLoadingWallet(false);
        dispatch(wallet_set(walletData.data));
        dispatch(
          bot_setting_init({
            ...botData.data.bot,
          })
        );
        history.push("/bot");
      } else {
        getWallet();
      }
    } catch (error) {
      setIsLoadingWallet(false);
      console.log("error while call getUserBot()", error);
    }
  }

  async function getBotInfo() {
    try {
      if (!auth.isLoggedIn) return;
      if (botSetting.bot_id) return;
      setIsLoadingWallet(true);
      const id = auth.id;
      const [{ data: botData }] = await Promise.all([
        axios.get(`${BOT_INFO}/${id}`),
      ]);
    } catch (error) {
      console.log("error while call getBotInfo()", error);
    }
  }

  async function getWallet() {
    try {
      if (!auth.isLoggedIn) return;
      setIsLoadingWallet(true);
      const id = auth.id;
      const {
        data: { data, success },
      } = await axios.get(`${WALLET_URL}/${id}`);
      if (success) {
        setIsLoadingWallet(false);
        dispatch(wallet_set(data));
        dispatch(
          bot_setting_init({
            ...botSetting,
            init_wallet: data.play_wallet,
          })
        );
      }
    } catch (error) {
      setIsLoadingWallet(false);
      console.log("error while call getWallet()", error);
    }
  }

  async function create() {
    let tmpError = [];
    if (!botSetting.loss_percent || !botSetting.profit_percent) {
      if (!botSetting.profit_percent) {
        tmpError.push("PROFIT");
      }
      if (!botSetting.loss_percent) {
        tmpError.push("LOSS");
      }
      if (errorBotSetting.includes("LOSS_OVER_LIMIT")) {
        tmpError.push("LOSS_OVER_LIMIT");
      }
      dispatch(error_bot_setting_set(tmpError));
      return;
    }
    if (errorBotSetting.length) {
      return;
    }
    try {
      setIsLoading(true);
      const {
        data: { data, success },
      } = await axios.post(BOT_URL, {
        ...botSetting,
        username: auth.username,
      });
      if (success) {
        dispatch(
          bot_setting_init({
            ...data,
          })
        );
        history.push("/bot");
      }
    } catch (error) {
      console.log("Error while call create()", error);
    }
    setIsLoading(false);
  }

  async function start() {
    try {
      const bot_id = botSetting.id;
      if (bot_id) {
        setIsLoading(true);
        const {
          data: { success },
        } = await axios.post(START_URL, {
          username: auth.username,
        });
        if (success) {
          dispatch(
            bot_setting_set({
              ...botSetting,
              status: 1,
            })
          );
        }
      }
    } catch (error) {
      console.log("Error while call start()", error);
    }
    setIsLoading(false);
  }

  async function pause() {
    try {
      setIsLoading(true);
      const {
        data: { success },
      } = await axios.post(PAUSE_URL, {
        username: auth.username,
      });
      if (success) {
        dispatch(
          bot_setting_set({
            ...botSetting,
            status: 2,
          })
        );
      }
    } catch (error) {
      console.log("Error while call pause()", error);
    }
    setIsLoading(false);
  }

  async function stop() {
    try {
      setIsLoading(true);
      const res = await axios.post(STOP_URL, {
        username: auth.username,
      });
      dispatch(bot_setting_clear());
      dispatch(bot_clear());
      setIsShownConfirmStop(false);
      history.push("/setting");
    } catch (error) {
      console.log("Error while call stop()", error);
    }
    setIsLoading(false);
  }

  function calculateProfit() {
    if (wallet.play_wallet <= botSetting.init_wallet + botSetting.profit_wallet)
      return 0;
    return numeral(
      wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet
    ).format("0,0");
  }

  function calculateProfitTarget() {
    return numeral(botSetting.profit_threshold - botSetting.init_wallet).format(
      "0,0"
    );
  }

  function calculateLoss() {
    if (wallet.play_wallet > botSetting.init_wallet + botSetting.profit_wallet)
      return 0;
    return numeral(
      Math.abs(
        wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet
      )
    ).format("0,0");
  }

  function calculateLossTarget() {
    return numeral(botSetting.init_wallet - botSetting.loss_threshold).format(
      "0,0"
    );
  }

  function calculateProfitProgressPercent() {
    if (wallet.play_wallet < botSetting.init_wallet + botSetting.profit_wallet)
      return 0;
    const target = botSetting.profit_threshold - botSetting.init_wallet;
    const current =
      wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet;
    if ((100 * current) / target < 1) return 0;
    return Math.round((100 * current) / target);
  }

  function calculateLossProgressPercent() {
    if (wallet.play_wallet > botSetting.init_wallet + botSetting.profit_wallet)
      return 0;
    const target = botSetting.init_wallet - botSetting.loss_threshold;
    const current = Math.abs(
      wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet
    );
    return Math.round((100 * current) / target);
  }

  function renderBetSide() {
    switch (botSetting.bet_side) {
      case 1:
        return "Player/Banker";
      case 2:
        return "Player เท่านั้น";
      case 3:
        return "Banker เท่านั้น";
      default:
        return "";
    }
  }

  function renderMoneySystem() {
    switch (botSetting.money_system) {
      case 1:
        return "เติมเงินคงที่";
      case 2:
        return "การเดินเงินแบบทบ 5 ไม้ มาติงเกลพิเศษ";
      case 3:
        return "การเดินเงินแบบลาบูแชร์";
      case 4:
        return "การเดินเงินแบบ X system";
      default:
        return "";
    }
  }

  function renderLabouchere() {
    let str = "";
    for (let i = 0; i < playData.length; i++) {
      if (playData[i] === undefined || playData[i] === null) {
        continue;
      }
      if (i !== playData.length - 1) {
        str += `${playData[i].toFixed(1)}, `;
      } else {
        str += `${playData[i].toFixed(1)}`;
      }
    }
    return str;
  }

  function restartWithProfit() {
    socket.emit("restart", { action: "restart", userId: auth.id, type: 1 });
    setIsShownConfirmResetMoneySystem(false);
  }

  function restartWithProfitAndLoss() {
    socket.emit("restart", { action: "restart", userId: auth.id, type: 2 });
    setIsShownConfirmResetMoneySystem(false);
  }

  const chart = {
    options: {
      chart: {
        toolbar: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 1,
      },
      grid: {
        show: false,
      },
      colors: ["#00b5ad", "#bb2e59"],
      xaxis: {
        labels: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        crosshairs: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        crosshairs: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 100],
          colorStops: [],
        },
      },
      title: {
        text: "กราฟรายได้",
        align: "left",
        style: {
          color: "#fff",
        },
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          let realIndex = Object.keys(dataMap).findIndex(
            (item) => item == dataPointIndex
          );

          if (realIndex == -1) {
            return "<div></div>";
          }
          // console.log(realIndex, dataMap[dataPointIndex]);
          let realData = dataMap[dataPointIndex];

          if (dataPointIndex != 0) {
            // console.log(defaultGraph)
            // console.log("seriesIndex", seriesIndex)
            // console.log("dataPointIndex", dataPointIndex)

            var pad = "00";
            var date = new Date(rawData[realData].createdAt);
            var h = (pad + date.getHours()).slice(-pad.length);
            var m = (pad + date.getMinutes()).slice(-pad.length);
            var s = (pad + date.getSeconds()).slice(-pad.length);
            if (series[seriesIndex][dataPointIndex] == 0) {
              return "<div></div>";
            } else {
              if (series[seriesIndex][dataPointIndex] >= 0) {
                return `<div class="graph-tooltip">
              <div class="title">เวลา:</div><div class="title">${`${h}:${m}:${s}`}
              </div>
              <div>ห้องที่:</div><div>${
                rawData[realData].bot_transaction.table_title
              }
              </div>
              <div>ตาที่:</div><div>${`${rawData[realData].bot_transaction.shoe}-${rawData[realData].bot_transaction.round}`}
              </div>
              <div>กำไร:</div><div><span class="profit">${
                series[seriesIndex][dataPointIndex]
              }</span> บาท
              </div>
              <div>สวนบอท:</div><div><span>${
                rawData[realData].user_bet ==
                rawData[realData].bot_transaction.bet
                  ? "ไม่"
                  : "ใช่"
              }</span>
              </div>`;
              } else {
                return `<div class="graph-tooltip-loss">
              <div class="title">เวลา:</div><div class="title">${`${h}:${m}:${s}`}
              </div>
              <div>ห้องที่:</div><div>${
                rawData[realData].bot_transaction.table_title
              }
              </div>
              <div>ตาที่:</div><div>${`${rawData[realData].bot_transaction.shoe}-${rawData[realData].bot_transaction.round}`}
              </div>
              <div>กำไร:</div><div><span class="loss">${
                series[seriesIndex][dataPointIndex]
              }</span> บาท
              </div>
              <div>สวนบอท:</div><div><span>${
                rawData[realData].user_bet ==
                rawData[realData].bot_transaction.bet
                  ? "ไม่"
                  : "ใช่"
              }</span>
              </div>`;
              }
            }
          }
        },
        x: {
          show: false,
        },
      },
    },
  };

  async function betOpposite(isOpposite) {
    try {
      setIsLoading(true);
      const {
        data: { success },
      } = await axios.post(SET_OPPOSITE_URL, {
        username: auth.username,
        is_opposite: isOpposite,
      });
      if (success) {
        dispatch(
          bot_setting_set({
            ...botSetting,
            is_opposite: isOpposite,
          })
        );
      }
    } catch (error) {
      console.log(
        "BotInfomation Component | Error while call betOpposite()",
        error
      );
    }
    setIsLoading(false);
  }

  function renderBetOppositeButton() {
    if (botSetting.is_opposite) {
      return (
        <Button
          color="red"
          onClick={() => betOpposite(false)}
          disabled={botSetting.status != 2}
        >
          <i className="fal fa-chart-line-down fa-lg" />
        </Button>
      );
    }
    return (
      <Button
        color="teal"
        onClick={() => betOpposite(true)}
        disabled={botSetting.status != 2}
      >
        <i className="fal fa-chart-line fa-lg" />
      </Button>
    );
  }

  async function changeBetSide(bet_side) {
    try {
      setIsLoading(true);

      const {
        data: { success },
      } = await axios.post(SET_BET_SIDE_URL, {
        username: auth.username,
        bet_side,
      });
      if (success) {
        dispatch(
          bot_setting_set({
            ...botSetting,
            bet_side: bet_side,
          })
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.log(
        "BotInfomation Component | Error while call changeBetSide()",
        error
      );
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoadingWallet && (
        <div className="wallet-loader">
          <Icon name="spinner" loading size="big" />
          <p>...กำลังโหลดข้อมูล</p>
        </div>
      )}
      <Container text fluid>
        {!props.isShownProgressBar && (
          <div className="bot-info-float-collapse">
            <Icon
              className="collapse-button collapse-button-hidden"
              name="angle up"
              onClick={() => props.setIsShownProgressBar(true)}
            />
          </div>
        )}
        {props.isShownProgressBar && (
          <div className="bot-info-float">
            <div className="wallet-container">
              <Icon
                className="collapse-button"
                name="angle down"
                onClick={() => props.setIsShownProgressBar(false)}
              />
              <div>
                <p style={{ marginBottom: 0 }}>กระเป๋าหลัก</p>
                <Header size="large" style={{ color: "#fff", marginTop: 0 }}>
                  <CountUp end={wallet.all_wallet} separator="," decimals={2} />
                  {botSetting.id && (
                    <>
                      <div className="withdraw-label">
                        ถอน{" "}
                        {numeral(botSetting.deposite_count).format("0,0") || 0}{" "}
                        ครั้ง (
                        {numeral(botSetting.profit_wallet).format("0,0") || 0}{" "}
                        บาท) / เทรินโอเวอร์{"  "}
                        {numeral(turnover).format("0,0") || 0}
                      </div>
                    </>
                  )}
                </Header>
              </div>
              <div>
                <Popup
                  position="left"
                  content={
                    botSetting.is_opposite
                      ? "กดเพื่อเล่นตามบอท"
                      : "กดเพื่อเล่นสวนบอท"
                  }
                  trigger={renderBetOppositeButton()}
                />
              </div>
              {/* {botSetting.id && (
                <>
                  <div>
                    <p style={{ marginBottom: 0 }}>กระเป๋าลงทุน</p>
                    <Header
                      size="large"
                      style={{ color: "#fff", marginTop: 0 }}
                    >
                      <CountUp
                        end={wallet.play_wallet - botSetting.profit_wallet}
                        separator=","
                        decimals={2}
                      />
                    </Header>
                  </div>
                  <div>
                    <p style={{ marginBottom: 0 }}>กระเป๋ากำไร</p>
                    <Header
                      size="large"
                      style={{ color: "#fff", marginTop: 0 }}
                    >
                      <CountUp
                        end={botSetting.profit_wallet}
                        separator=","
                        decimals={2}
                      />
                    </Header>
                  </div>
                </>
              )} */}
            </div>
            <div style={{ marginBottom: 24 }}>
              {!botSetting.id && (
                <Button
                  color="blue"
                  icon
                  labelPosition="left"
                  onClick={create}
                  loading={isLoading}
                >
                  สร้าง
                  <Icon name="save" />
                </Button>
              )}
              {botSetting.status === 2 && (
                <Button
                  color="teal"
                  icon
                  labelPosition="left"
                  onClick={start}
                  loading={isLoading}
                >
                  เริ่ม
                  <Icon name="play" />
                </Button>
              )}
              {botSetting.status === 1 && (
                <Button
                  color="yellow"
                  icon
                  labelPosition="left"
                  onClick={pause}
                  loading={isLoading}
                >
                  <Icon name="pause" />
                  พัก
                </Button>
              )}
              {(botSetting.status === 1 || botSetting.status === 2) && (
                <Button
                  color="red"
                  icon
                  labelPosition="left"
                  onClick={setIsShownConfirmStop}
                  loading={isLoading}
                >
                  <Icon name="close" />
                  ปิด
                </Button>
              )}
            </div>
            <div className="progress-info">
              {botSetting.status === 1 || botSetting.status === 2 ? (
                <>
                  <div>
                    {calculateLoss()}/{calculateLossTarget()} (
                    {calculateLossProgressPercent()}%)
                  </div>
                  <div>
                    {calculateProfit()}/{calculateProfitTarget()} (
                    {calculateProfitProgressPercent()}%)
                  </div>
                </>
              ) : (
                <>
                  <div>0/0 (0%)</div>
                  <div>0/0 (0%)</div>
                </>
              )}
            </div>
            {botSetting.status === 1 || botSetting.status === 2 ? (
              <div className="progress-container">
                <div className="progress-item progress-item--negative">
                  <Progress
                    percent={calculateLossProgressPercent()}
                    active
                    color="red"
                    size="small"
                  />
                </div>
                <div className="progress-item progress-item--positive">
                  <Progress
                    percent={calculateProfitProgressPercent()}
                    active
                    color="teal"
                    size="small"
                  />
                </div>
              </div>
            ) : (
              <Progress percent={0} active color="teal" size="small" />
            )}
          </div>
        )}
        {botSetting.id &&
          (botSetting.money_system === 3 || botSetting.money_system === 4) && (
            <Card fluid>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  ลาบูแชร์
                </Card.Description>
                <Card.Meta>{renderLabouchere()}</Card.Meta>
              </Card.Content>
            </Card>
          )}
        {!botSetting.id && <BotGraph />}
        {(botSetting.status === 1 || botSetting.status === 2) && (
          <>
            <Divider section />
            <Card fluid>
              <Chart
                type="area"
                options={chart.options}
                series={botTransaction}
                height="240"
              />
            </Card>
            <Divider section />
            <p>การตั้งค่า</p>
            <Card.Group>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    รูปแบบการเล่น
                  </Card.Description>
                  <Card.Meta>{renderBetSide()}</Card.Meta>
                </Card.Content>
                {botSetting.id && (
                  <Card.Content extra>
                    <Button
                      color="teal"
                      icon
                      labelPosition="left"
                      fluid
                      loading={isLoading}
                      disabled={
                        botSetting.status === 1 || botSetting.status === 3
                      }
                      onClick={() => setIsShownConfirmResetBetSide(true)}
                    >
                      เปลี่ยน
                      <Icon name="undo" />
                    </Button>
                  </Card.Content>
                )}
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    รูปแบบการเติมเงิน
                  </Card.Description>
                  <Card.Meta>{renderMoneySystem()}</Card.Meta>
                </Card.Content>
                {botSetting.id && botSetting.money_system === 4 && (
                  <Card.Content extra>
                    <Button
                      color="teal"
                      icon
                      labelPosition="left"
                      fluid
                      loading={isLoading}
                      onClick={() => setIsShownConfirmResetMoneySystem(true)}
                      disabled={
                        botSetting.status === 1 || botSetting.status === 3
                      }
                    >
                      รีสตาร์ท
                      <Icon name="undo" />
                    </Button>
                  </Card.Content>
                )}
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    ชิพเริ่มต้น
                  </Card.Description>
                  <Card.Meta>
                    {numeral(botSetting.init_bet).format("0,0")}
                  </Card.Meta>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    ถอนกำไรเข้ากระเป๋ากำไรและเริ่มเล่นใหม่
                  </Card.Description>
                  <Card.Meta>
                    {botSetting.is_infinite ? "ใช่" : "ไม่ใช่"}
                  </Card.Meta>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    กำไรเป้าหมาย
                  </Card.Description>
                  <Card.Meta>
                    {botSetting.profit_percent}% ({calculateProfit()}/
                    {calculateProfitTarget()})
                  </Card.Meta>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    Stop Loss
                  </Card.Description>
                  <Card.Meta>
                    {botSetting.loss_percent}% ({calculateLoss()}/
                    {calculateLossTarget()})
                  </Card.Meta>
                </Card.Content>
              </Card>
            </Card.Group>
          </>
        )}
      </Container>
      <Modal
        basic
        onClose={() => setIsShownConfirmStop(false)}
        onOpen={() => setIsShownConfirmStop(true)}
        open={isShownConfirmStop}
        size="small"
        closeOnDimmerClick={false}
      >
        <Header icon>คุณต้องการปิดบอทใช่หรือใช่ไหม</Header>
        <Modal.Actions>
          <Button onClick={() => setIsShownConfirmStop(false)}>
            <Icon name="remove" /> ไม่ใช่
          </Button>
          <Button color="teal" onClick={stop}>
            <Icon name="checkmark" /> ใช่
          </Button>
        </Modal.Actions>
      </Modal>
      <Modal
        basic
        onClose={() => setIsShownConfirmResetMoneySystem(false)}
        onOpen={() => setIsShownConfirmResetMoneySystem(true)}
        open={isShownConfirmResetMoneySystem}
        size="small"
        closeOnDimmerClick={false}
      >
        <Header icon>เลือกรูปแบบการรีสตาร์ท</Header>
        <Modal.Actions>
          <Button onClick={() => setIsShownConfirmResetMoneySystem(false)}>
            <Icon name="remove" /> ยกเลิก
          </Button>
          <Button color="teal" onClick={restartWithProfit}>
            <Icon name="checkmark" />
            แบบกำไร
          </Button>
          <Button color="teal" onClick={restartWithProfitAndLoss}>
            <Icon name="checkmark" />
            แบบกำไร + ขาดทุน
          </Button>
        </Modal.Actions>
      </Modal>

      <Modal
        basic
        onClose={() => setIsShownConfirmResetBetSide(false)}
        onOpen={() => setIsShownConfirmResetBetSide(true)}
        open={isShownConfirmResetBetSide}
        size="small"
        closeOnDimmerClick={false}
      >
        <Header icon>เลือกรูปแบบการเล่น</Header>
        <Modal.Actions>
          <Button onClick={() => setIsShownConfirmResetBetSide(false)}>
            <Icon name="remove" /> ยกเลิก
          </Button>
          {botSetting.bet_side !== 1 && (
            <Button color="teal" onClick={() => changeBetSide(1)}>
              <Icon name="checkmark" />
              Player/Banker
            </Button>
          )}
          {botSetting.bet_side !== 2 && (
            <Button color="teal" onClick={() => changeBetSide(2)}>
              <Icon name="checkmark" />
              Player Only
            </Button>
          )}
          {botSetting.bet_side !== 3 && (
            <Button color="teal" onClick={() => changeBetSide(3)}>
              <Icon name="checkmark" />
              Banker Only
            </Button>
          )}
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default BotInformation;
