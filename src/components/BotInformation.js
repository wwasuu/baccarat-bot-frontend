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
import { useHistory } from "react-router-dom";
import Chart from "react-apexcharts";
import axios from "axios"
import { useSelector } from 'react-redux'

const BotInformation = () => {
  const history = useHistory();
  const [balance, setBalance] = useState(0.00)
  const auth = useSelector(state => state.auth)

  useEffect(() => {
    getWallet()
  }, [auth])

  function play() {
    history.push("/bot");
  }

  async function getWallet() {
    try {
      if (!auth) return
      const id = auth.id
      const {  data: { data, success } } = await axios.get(`https://api.ibot.bet/wallet/${id}`)
      if (success) {
        setBalance(data.myWallet.MAIN_WALLET.chips.credit)
      }
    } catch (error) {
      console.log("error while call getWallet()", error)
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
        {/* <Button icon>
          <Icon name="arrow left" />
        </Button> */}
        <Button color="teal" icon labelPosition="left" onClick={play}>
          เริ่ม
          <Icon name="play" />
        </Button>
        <Button color="yellow" icon labelPosition="left">
          <Icon name="pause" />
          หยุด
        </Button>
        <Button color="red" icon labelPosition="left">
          <Icon name="close" />
          ปิด
        </Button>
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
      <Progress percent={80} active progress color="teal" size="small" />
      <Divider section />
      <Card fluid>
        <Chart
          type="area"
          options={chart.options}
          series={chart.series}
          height="240"
        />
      </Card>
      <Divider section />
      <p>การเชื่อมต่อ</p>
      <Card.Group>
        <Card>
          <Card.Content>
            <Card.Description style={{ marginBottom: 8 }}>
              ZEAN AI
            </Card.Description>
            <Card.Meta>เชื่อมต่อแล้ว</Card.Meta>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Description style={{ marginBottom: 8 }}>
              TRUTHBET
            </Card.Description>
            <Card.Meta>เชื่อมต่อแล้ว</Card.Meta>
          </Card.Content>
        </Card>
      </Card.Group>
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
    </Container>
  );
};

export default BotInformation;
