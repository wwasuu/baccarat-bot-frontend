import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  Button,
  Container,
  Header,
  Icon,
  Progress,
  Divider,
  Card,
} from "semantic-ui-react";
import { useHistory, useLocation } from "react-router-dom";
import Chart from "react-apexcharts";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import numeral from "numeral";
import {
  initiateSocket,
  disconnectSocket,
  subscribeToChat,
} from "../utils/socket-io";
import {
  balance_set,
  bot_setting_set,
  bot_setting_init,
  auth_setbot,
  bot_setting_clear,
  bot_transaction_set
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

  // useEffect(() => {
  //   initiateSocket("user2");
  //   subscribeToChat((err, data) => {
  //     if (err) return;
  //       console.log(data)
  //   });
  //   return () => {
  //     disconnectSocket();
  //   };
  // }, []);

  useEffect(() => {
    initBotState();
    getUserBotTransaction()
  }, []);

  async function getUserBotTransaction() {
    let bot_id = auth.bot_id;
    if (!bot_id) {
      return
    }
    try {
      const {
        data: { data, success },
      } = await axios.get(`https://api.ibot.bet/user_bot_transaction/${bot_id}`);
      let transaction = [0];
      let newData = data.sort(compare);
      newData.forEach((element) => {
        transaction.push(element.wallet - element.bot.init_wallet);
      });

      console.log(transaction)
    
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

  useEffect(() => {
    getWallet();
    getUserBot();
  }, [auth.isLoggedIn]);

  function initBotState() {
    if (location.pathname === "/bot") {
      setBotState("START");
    }
  }

  async function getUserBot() {
    try {
      if (!auth.isLoggedIn) return;
      const id = auth.id;
      const {
        data: { data, success },
      } = await axios.get(`https://api.ibot.bet/user_bot/${id}`);
      if (success && data.bot != null) {
        dispatch(
          bot_setting_init({
            ...data.bot,
          })
        );

        dispatch(auth_setbot({ ...data.bot }));
        setBotState("START");
        history.push("/bot");
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
            init_wallet: data.myWallet.MAIN_WALLET.chips.credit
          })
        );
      }
    } catch (error) {
      console.log("error while call getWallet()", error);
    }
  }

  async function start() {
    try {
      const bot_id = botSetting.id
      if (bot_id) {
        const {
          data: { data, success },
        } = await axios.post("https://api.ibot.bet/start", {
          username: auth.username,
        });
        setBotState("START");
      } else {
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
          setBotState("START");
          history.push("/bot");
        }
      }
    } catch (error) {
      console.log("Error while call start()", error);
    }
  }

  async function pause() {
    try {
      const res = axios.post("https://api.ibot.bet/pause", {
        username: auth.username,
      });
      setBotState("PAUSE");
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
      setTimeout(() => {
        history.push("/setting");
      }, 1000)
    } catch (error) {
      console.log("Error while call stop()", error);
    }
  }

  function calculateProfit() {
    return numeral(balance - botSetting.init_wallet).format("0,0");
  }

  function calculateProfitTarget() {
    return numeral(botSetting.profit_threshold - botSetting.init_wallet).format("0,0");
  }

  function calculateProgressPercent() {
    const target = botSetting.profit_threshold - botSetting.init_wallet
    const current = balance - botSetting.init_wallet
    return Math.round((100 * current) / target)
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
        width: 1,
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
    <Container text fluid>
      <p style={{ marginBottom: 0 }}>เครดิต</p>
      <Header size="huge" style={{ color: "#fff", marginTop: 0 }}>
        <CountUp end={balance} separator="," decimals={2} />
      </Header>
      <div style={{ marginBottom: 24 }}>
        {(botState === "SETTING" || botState === "PAUSE") && (
          <Button color="teal" icon labelPosition="left" onClick={start}>
            เริ่ม
            <Icon name="play" />
          </Button>
        )}
        {(botState === "START") && (
          
            <Button color="yellow" icon labelPosition="left" onClick={pause}>
              <Icon name="pause" />
              หยุด
            </Button>
        )}
        { (botState === "START" || botState === "PAUSE")
          && <Button color="red" icon labelPosition="left" onClick={stop}>
          <Icon name="close" />
          ปิด
        </Button>
        }
      </div>
      <div
        className="progress-info"
      >
        {botState === "START" || botState === "PAUSE" ? (
          <div>
            {calculateProfit()}/{calculateProfitTarget()} ({calculateProgressPercent()}%)
          </div>
        ) : (
          <div>0/0 (0%)</div>
        )}
      </div>
      { (botState === "START" || botState === "PAUSE")
        ?
        <Progress percent={calculateProgressPercent()} active progress color="teal" size="small" />
        :
        <Progress percent={0} active progress color="teal" size="small" />
      }
      
      {(botState === "START" || botState === "PAUSE") && (
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
                <Card.Meta>{numeral(botSetting.init_bet).format("0,0")}</Card.Meta>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  กำไรเป้าหมาย
                </Card.Description>
                <Card.Meta>{botSetting.profit_percent}%</Card.Meta>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  Stop Loss
                </Card.Description>
                <Card.Meta>{botSetting.loss_percent}%</Card.Meta>
              </Card.Content>
            </Card>
          </Card.Group>
        </>
      )}
    </Container>
  );
};

export default BotInformation;
