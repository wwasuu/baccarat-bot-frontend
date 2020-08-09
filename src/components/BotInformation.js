import axios from "axios";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
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
} from "semantic-ui-react";
import {
  BOT_URL,
  PAUSE_URL,
  START_URL,
  STOP_URL,
  USER_BOT_TRANSACTION_URL,
  USER_BOT_URL,
  WALLET_URL,
} from "../constants";
import {
  auth_setbot,
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
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const botSetting = useSelector((state) => state.botSetting);
  const wallet = useSelector((state) => state.wallet);
  var botTransaction = useSelector((state) => state.botTransaction);
  const dispatch = useDispatch();
  const errorBotSetting = useSelector((state) => state.errorBotSetting);
  const [
    isShownConfirmResetMoneySystem,
    setIsShownConfirmResetMoneySystem,
  ] = useState(false);
  const [isShownConfirmStop, setIsShownConfirmStop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playData, setPlayData] = useState([])

  useEffect(() => {
    getUserBotTransaction();
    const room = `user${auth.id}`;
    socket.on(room, (data) => {
      console.log(data)
      if(data.action === "bet_result"){
        setPlayData(data.playData)
        setBotData(data.botObj)
      }else if(data.action === "restart_result"){
        if(data.data.success){
          setPlayData(data.data.data.playData)
        }
        
      }
    })
  }, []);

  useEffect(() => {
    getUserBot();
  }, [auth.isLoggedIn]);

  async function setBotData(data){
    console.log(data)
    dispatch(
      bot_setting_init({
        ...botSetting,
        is_infinite: data.is_infinite,
        profit_wallet: data.profit_wallet,
        deposite_count: data.deposite_count
      })
    );
  }

  async function getUserBotTransaction() {
    let bot_id = auth.bot_id;
    if (!bot_id) {
      return;
    }
    try {
      const {
        data: { data },
      } = await axios.get(`${USER_BOT_TRANSACTION_URL}/${bot_id}`);
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
        axios.get(`${USER_BOT_URL}/${id}`),
        axios.get(`${WALLET_URL}/${id}`),
      ]);
      if (botData.success && botData.data.bot) {
        dispatch(wallet_set(walletData.data));
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
      } = await axios.get(`${WALLET_URL}/${id}`);
      if (success) {
        dispatch(wallet_set(data));
        dispatch(
          bot_setting_init({
            ...botSetting,
            init_wallet: data.play_wallet,
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
        is_infinite: true,
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
    if (wallet.play_wallet <= botSetting.init_wallet + botSetting.profit_wallet) return 0;
    return numeral(wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet).format("0,0");
  }

  function calculateProfitTarget() {
    return numeral(botSetting.profit_threshold - botSetting.init_wallet).format(
      "0,0"
    );
  }

  function calculateLoss() {
    if (wallet.play_wallet > botSetting.init_wallet + botSetting.profit_wallet) return 0;
    return numeral(Math.abs(wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet)).format("0,0");
  }

  function calculateLossTarget() {
    return numeral(botSetting.init_wallet - botSetting.loss_threshold).format(
      "0,0"
    );
  }

  function calculateProfitProgressPercent() {
    if (wallet.play_wallet < botSetting.init_wallet + botSetting.profit_wallet) return 0;
    const target = botSetting.profit_threshold - botSetting.init_wallet;
    const current = wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet;
    return Math.round((100 * current) / target);
  }

  function calculateLossProgressPercent() {
    if (wallet.play_wallet > botSetting.init_wallet + botSetting.profit_wallet) return 0;
    const target = botSetting.init_wallet - botSetting.loss_threshold;
    const current = wallet.play_wallet - botSetting.init_wallet - botSetting.profit_wallet;
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

  // function renderLabouchere() {
  //   if (!botSetting.data) return "";
  //   return botSetting.data
  //     .replace("[", "")
  //     .replace("]", "")
  //     .split(",")
  //     .join(", ");
  // }

  function renderLabouchere() {
    let str = ''
    for(let i = 0; i< playData.length; i++)
    {
      if(i !== playData.length - 1){
        str += `${playData[i].toFixed(1)}, `
      }else{
        str += `${playData[i].toFixed(1)}`
      }
    } 
    // return playData.join(', ')
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
        <div className="bot-info-float">
          <div className="wallet-container">
            <div>
              <p style={{ marginBottom: 0 }}>กระเป๋าหลัก</p>
              <Header size="large" style={{ color: "#fff", marginTop: 0 }}>
                <CountUp end={wallet.all_wallet} separator="," decimals={2} /> <div className="withdraw-label">ถอน 0 ครั้ง</div>
              </Header>
            </div>

            <div>
              <p style={{ marginBottom: 0 }}>กระเป๋าลงทุน</p>
              <Header size="large" style={{ color: "#fff", marginTop: 0 }}>
                <CountUp end={wallet.play_wallet - botSetting.profit_wallet} separator="," decimals={2} />
              </Header>
            </div>
            <div>
              <p style={{ marginBottom: 0 }}>กระเป๋ากำไร</p>
              <Header size="large" style={{ color: "#fff", marginTop: 0 }}>
                <CountUp
                  end={botSetting.profit_wallet}
                  separator=","
                  decimals={2}
                />
              </Header>
            </div>
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
                หยุด
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
              </Card>
              <Card>
                <Card.Content>
                  <Card.Description style={{ marginBottom: 8 }}>
                    รูปแบบการเติมเงิน
                  </Card.Description>
                  <Card.Meta>{renderMoneySystem()}</Card.Meta>
                </Card.Content>
                {botSetting.id &&
          (botSetting.money_system === 4) && (
            <Card.Content extra>
                  <Button
                    color="teal"
                    icon
                    labelPosition="left"
                    fluid
                    loading={isLoading}
                    onClick={() => setIsShownConfirmResetMoneySystem(true)}
                    disabled={botSetting.status === 1 || botSetting.status === 3}
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
    </>
  );
};

export default BotInformation;
