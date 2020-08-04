import axios from "axios";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Divider,
  Header,
  Icon,
  Modal,
  Progress,
} from "semantic-ui-react";
import BotGraph from "./BotGraphs";
import {
  auth_setbot,
  balance_set,
  bot_clear,
  bot_setting_clear,
  bot_setting_init,
  bot_setting_set,
  bot_transaction_set,
  error_bot_setting_set,
} from "../store";

function compare(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

const BotInformation = () => {
  const location = useLocation();
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const balance = useSelector((state) => state.balance);
  const botSetting = useSelector((state) => state.botSetting);
  var botTransaction = useSelector((state) => state.botTransaction);
  const dispatch = useDispatch();
  const [botState, setBotState] = useState("SETTING");
  const [isShownConfirmPause, setIsShownConfirmPause] = useState(false);
  const [isShownConfirmStop, setIsShownConfirmStop] = useState(false);
  const [betSide, setBetSide] = useState(["PLAYER/BANKER", "PLAYER", "BANKER"]);

  useEffect(() => {
    getUserBotTransaction();
  }, []);

  useEffect(() => {
    getUserBot();
  }, [auth.isLoggedIn]);

  async function getUserBotTransaction() {
    let bot_id = auth.bot_id;
    if (!bot_id) {
      return;
    }
    try {
      const {
        data: { data, success },
      } = await axios.get(
        `https://api.ibot.bet/user_bot_transaction/${bot_id}`
      );
      let transaction = [0];
      let newData = data.sort(compare);
      newData.forEach((element) => {
        transaction.push(element.wallet - element.bot.init_wallet);
      });

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
      const id = auth.id;
      const [{ data: botData }, { data: walletData }] = await Promise.all([
        axios.get(`https://api.ibot.bet/user_bot/${id}`),
        axios.get(`https://api.ibot.bet/wallet/${id}`),
      ]);
      if (botData.success && botData.data.bot) {
        dispatch(
          balance_set(walletData.data.myWallet.MAIN_WALLET.chips.credit)
        );
        dispatch(
          bot_setting_init({
            ...botData.data.bot,
          })
        );
        dispatch(auth_setbot({ ...botData.data.bot }));
        history.push("/bot");
      } else {
        getWallet();
      }
    } catch (error) {
      console.log("error while call get user bot()", error);
    }
  }

  async function getWallet() {
    try {
      if (!auth.isLoggedIn) return;
      const id = auth.id;
      const {
        data: { data, success },
      } = await axios.get(`https://api.ibot.bet/wallet/${id}`);
      if (success) {
        dispatch(balance_set(data.myWallet.MAIN_WALLET.chips.credit));
        dispatch(
          bot_setting_init({
            ...botSetting,
            init_wallet: data.myWallet.MAIN_WALLET.chips.credit,
          })
        );
      }
    } catch (error) {
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
      dispatch(error_bot_setting_set(tmpError));
      return;
    }
    try {
      const {
        data: { data, success },
      } = await axios.post("https://api.ibot.bet/bot", {
        ...botSetting,
        username: auth.username,
      });
      if (success) {
        dispatch(
          bot_setting_init({
            ...data,
          })
        );
        dispatch(auth_setbot({ ...data }));
        history.push("/bot");
      }
    } catch (error) {
      console.log("Error while call create()", error);
    }
  }

  async function start() {
    try {
      const bot_id = botSetting.id;
      if (bot_id) {
        const {
          data: { success },
        } = await axios.post("https://api.ibot.bet/start", {
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
  }

  async function pause() {
    try {
      const {
        data: { success },
      } = axios.post("https://api.ibot.bet/pause", {
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
  }

  async function stop() {
    try {
      const res = axios.post("https://api.ibot.bet/stop", {
        username: auth.username,
      });
      dispatch(bot_setting_clear());
      dispatch(bot_clear());
      setIsShownConfirmStop(false);
      history.push("/setting");
    } catch (error) {
      console.log("Error while call stop()", error);
    }
  }

  function calculateProfit() {
    if (balance <= botSetting.init_wallet) return 0;
    return numeral(balance - botSetting.init_wallet).format("0,0");
  }

  function calculateProfitTarget() {
    return numeral(botSetting.profit_threshold - botSetting.init_wallet).format(
      "0,0"
    );
  }

  function calculateLoss() {
    if (balance > botSetting.init_wallet) return 0;
    return numeral(Math.abs(balance - botSetting.init_wallet)).format("0,0");
  }

  function calculateLossTarget() {
    return numeral(botSetting.init_wallet - botSetting.loss_threshold).format(
      "0,0"
    );
  }

  function calculateProgressPercent() {
    if (balance < botSetting.init_wallet) return 0;
    const target = botSetting.profit_threshold - botSetting.init_wallet;
    const current = balance - botSetting.init_wallet;
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
        return "การเดินเงินแบบ X sytem";
      default:
        return "";
    }
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
        width: 0,
      },
      grid: {
        show: false,
      },
      colors: ["#00b5ad"],
      xaxis: {
        labels: {
          show: false,
        },
        tooltip: {
          show: false,
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
          show: false,
        },
        crosshairs: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      title: {
        text: "กราฟรายได้",
        align: "left",
        style: {
          color: "#fff",
        },
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <>
      <Container text fluid>
        <p style={{ marginBottom: 0 }}>เครดิต</p>
        <Header size="huge" style={{ color: "#fff", marginTop: 0 }}>
          <CountUp end={balance} separator="," decimals={2} />
        </Header>
        <div style={{ marginBottom: 24 }}>
          {!botSetting.id && (
            <Button color="blue" icon labelPosition="left" onClick={create}>
              สร้าง
              <Icon name="save" />
            </Button>
          )}
          {botSetting.status === 2 && (
            <Button color="teal" icon labelPosition="left" onClick={start}>
              เริ่ม
              <Icon name="play" />
            </Button>
          )}
          {botSetting.status === 1 && (
            <Button color="yellow" icon labelPosition="left" onClick={pause}>
              <Icon name="pause" />
              หยุด
            </Button>
          )}
          {(botSetting.status === 1 || botSetting.status === 2) && (
            <Button
              color="red"
              icon
              labelPosition="left"
              onClick={setIsShownConfirmStop}
            >
              <Icon name="close" />
              ปิด
            </Button>
          )}
        </div>
        <div className="progress-info">
          {botSetting.status === 1 || botSetting.status === 2 ? (
            <div>
              {calculateProfit()}/{calculateProfitTarget()} (
              {calculateProgressPercent()}%)
            </div>
          ) : (
            <div>0/0 (0%)</div>
          )}
        </div>
        {botSetting.status === 1 || botSetting.status === 2 ? (
          <Progress
            percent={calculateProgressPercent()}
            active
            progress
            color="teal"
            size="small"
          />
        ) : (
          <Progress percent={0} active progress color="teal" size="small" />
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
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    รูปแบบการเติมเงิน
                  </Card.Description>
                  <Card.Meta>{renderMoneySystem()}</Card.Meta>
                </Card.Content>
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
    </>
  );
};

export default BotInformation;
