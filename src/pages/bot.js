import axios from "axios";
import React, { useEffect } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  Container,
  Grid,
  Header
} from "semantic-ui-react";
import BotInformation from "../components/BotInformation";
import Navbar from "../components/Navbar";

const Setting = () => {
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
        axisBorder: {
          show: false,
        },
        tooltip: {
          show: false,
        },
        crosshairs: {
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
        text: "ภาพรวมบอท",
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
        name: "series 1",
        // data: [1, 2, -1, -2, 3, 4, 3],
        data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
      },
    ],
  };

  useEffect(() => {
    getBotTransaction()
  }, [])

  async function getBotTransaction() {
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction");
      console.log(data);
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  return (
    <>
    <Navbar />
    <Grid
      style={{
        backgroundColor: "#212121",
        height: "100vh",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <Grid.Row columns={2}>
        <Grid.Column
          style={{ padding: "24px", overflow: "auto", height: "100vh" }}
        >
          <BotInformation />
        </Grid.Column>
        <Grid.Column
          style={{ padding: "24px", overflow: "auto", height: "100vh" }}
        >
          <Container text fluid>
            <Header as="h2" style={{ color: "#fff" }}>
              โปรแกรมเติมพันอัตโนมัติ
            </Header>
            <p>กำลังเล่นบอทบาคาร่า</p>

            <Card fluid>
              <Chart
                type="area"
                options={chart.options}
                series={chart.series}
                height="240"
              />
            </Card>
          </Container>
          <Container text fluid>
            <Header as="h2" style={{ color: "#fff" }}>
              เซียนโรโบ แอดไวเซอร์
            </Header>
            <Card.Group itemsPerRow={4}>
              <Card header="xxxxx-xx" description="xxxxx-xx" />
              <Card header={<div>123</div>} description="ผลการวิเคราะห์" />
              <Card header="+10" description="ความน่าเล่น" />
              <Card header="56.45%" description="โอกาสทำกำไร" />
            </Card.Group>
          </Container>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    </>
  );
};

export default Setting;
