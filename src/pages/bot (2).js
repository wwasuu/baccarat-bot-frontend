import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Header,
  Card,
  Progress,
  Button,
  Icon,
  Select,
  Form,
  Table,
} from "semantic-ui-react";
import Chart from "react-apexcharts";
import axios from "axios";
import BotInformation from "../components/BotInformation";

function compare( a, b ) {
  if ( a.id < b.id ){
    return -1;
  }
  if ( a.id > b.id ){
    return 1;
  }
  return 0;
}

const Setting = () => {
  var [graphData, setGraph] = useState([
    {
      name: "series 1",
      data: [1, 2, -1, -2, 3, 4, 3],
    },
  ])
  var [start, setStart] = useState(10)
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
        data: [1, 2, -1, -2, 3, 4, 3],
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
      let newData = data.sort(compare)
      let graph = 
                  [
                    {
                      name: "series 1",
                      data: [],
                    },
                  ]
      console.log(newData);
      let i = start;
      let t = 0
      newData.forEach(element => {
        
        if(element.win_result === 'WIN'){
          i++
          graph[0].data.push(i)
        }else if(element.win_result == 'LOSE'){
          i--
          graph[0].data.push(i)
        }else{
          graph[0].data.push(i)
        }
        if(t === 1){
          setStart(i)
        }
        t++
      });
      setGraph(graph)
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  return (
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
                series={graphData}
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
  );
};

export default Setting;
