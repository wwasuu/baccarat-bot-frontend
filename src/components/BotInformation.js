import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useLocation } from "react-router-dom";
import {
  Button,
  Container,
  Header,
  Icon,
  Progress,
  Divider,
  Card,
} from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import Chart from "react-apexcharts";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { balance_set, bot_setting_set, bot_setting_init, auth_setbot } from "../store";

const BotInformation = () => {
  const location = useLocation();
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const balance = useSelector((state) => state.balance);
  const botSetting = useSelector((state) => state.botSetting);
  const botTransaction = useSelector((state) => state.botTransaction);
  const dispatch = useDispatch();
  const [botState, setBotState] = useState("SETTING");

  useEffect(() => {
    initBotState();
  }, []);

  useEffect(() => {
    getWallet();
    getUserBot()
  }, [auth.isLoggedIn]);

  function initBotState() {
    if (location.pathname === "/bot") {
      setBotState("START");
    }
    
  }

  async function getUserBot(){
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
        
        dispatch(
          auth_setbot({...data.bot})
        )
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
            init_wallet: data.myWallet.MAIN_WALLET.chips.credit,
          })
        );
      }
    } catch (error) {
      console.log("error while call getWallet()", error);
    }
  }

  async function start() {
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
            ...data
          })
        );
        
        dispatch(
          auth_setbot({...data})
        )
        setBotState("START");
        history.push("/bot");
      }
    } catch (error) {
      console.log("Error while call start()", error);
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
    series: [
      {
        name: "series1",
        data: [1, 2, -1, -2, 3, 4, 3],
      },
    ],
  };

  return (
    <Container text fluid>
      <p style={{ marginBottom: 0 }}>เครดิต</p>
      <Header size="huge" style={{ color: "#fff", marginTop: 0 }}>
        <CountUp end={balance} separator="," decimals={2} />
      </Header>
      <div style={{ marginBottom: 24 }}>
        {botState === "SETTING" && (
          <Button color="teal" icon labelPosition="left" onClick={start}>
            เริ่ม
            <Icon name="play" />
          </Button>
        )}
        {(botState === "START" || botState === "STOP") && (
          <>
            <Button color="yellow" icon labelPosition="left">
              <Icon name="pause" />
              หยุด
            </Button>
            <Button color="red" icon labelPosition="left">
              <Icon name="close" />
              ปิด
            </Button>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div>ถอน: 0 ครั้ง (0 บาท)</div>
        <div>0/0 (0%)</div>
      </div>
      <Progress percent={0} active progress color="teal" size="small" />
      {(botState === "START" || botState === "STOP") && (
        <>
          <Divider section />
          <Card fluid>
            <Chart
              type="area"
              options={chart.options}
              series={ [
                {
                  name: "series1",
                  data: botTransaction,
                },
              ]}
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
                <Card.Meta>PLAYER/BANKER</Card.Meta>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  รูปแบบการเติมเงิน
                </Card.Description>
                <Card.Meta>Zean System</Card.Meta>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  ชิพเริ่มต้น
                </Card.Description>
                <Card.Meta>Zean System</Card.Meta>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Description style={{ marginBottom: 8 }}>
                  กำไรเป้าหมาย
                </Card.Description>
                <Card.Meta>5%</Card.Meta>
              </Card.Content>
            </Card>
          </Card.Group>
        </>
      )}
    </Container>
  );
};

export default BotInformation;
