import axios from "axios";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card, Container, Grid, Header } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import BotInformation from "../components/BotInformation";
import Navbar from "../components/Navbar";
import { socket } from "./socket";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Icon, Table } from "semantic-ui-react";
import { bot_transaction_set, balance_set, bot_setting_clear } from "../store";
import { unformat } from "numeral";

function compare(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

const Setting = () => {
  const auth = useSelector((state) => state.auth);
  var botTransaction = useSelector((state) => state.botTransaction);
  const dispatch = useDispatch();
  const history = useHistory();
  var [tableData, setTableData] = useState([]);
  var [graphData, setGraph] = useState([
    {
      name: "แพ้",
      data: [],
    },
  ]);
  var [start, setStart] = useState(5);
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
      colors: ["#de1245", "#00b5ad"],
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
      fill: {
        type: 'gradient'
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
        enabled: true,
        custom: function({series, seriesIndex, dataPointIndex, w}) {
          return '<div class="graph_tooltip">' +
            '<span>' + series[seriesIndex][dataPointIndex] + '</span>' +
            '</div>'
        }
      },
    },
  };

  const [bet, setBet] = useState({});

  useEffect(() => {
    getBotTransaction();
    getUserTransaction();
    // getUserBotTransaction();
    subscribeBot();
  }, []);

  function subscribeBot() {
    const room = `user${auth.id}`;
    socket.on(room, (data) => {
      console.log(data);
      if (data.action === "bet_success") {
        setBet({...data.data, win_percent: data.win_percent});
      } else if (data.action === "bet_result") {
        dispatch(balance_set(data.wallet));
        if (data.isStop) {
          dispatch(bot_setting_clear());
          setTimeout(() => {
            history.push("/setting");
          }, 1000)
        } else {
          setBet({})
          getUserBotTransaction();
          getBotTransaction();
          getUserTransaction();
        }
      }
    });
  }

  async function getUserTransaction() {
    let id = auth.id;
    if (!id) return
    try {
      let url = `https://api.ibot.bet/user_transaction/${id}`;
      const {
        data: { data, success },
      } = await axios.get(url);
      setTableData(data.bets.data);
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  async function getUserBotTransaction() {
    let bot_id = auth.bot_id;
    if (!bot_id) {
      return;
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

  async function getBotTransaction() {
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction");
      let newData = data.sort(compare);
      let graph = [
        {
          name: "แพ้",
          data: [],
        },
        {
          name: "ชนะ",
          data: [],
        },
      ];
      let offset = 0 - newData[0].point
      newData.forEach((element) => {
        let newPoint = element.point + offset;
        if(newPoint === 0){
          graph[1].data.push(newPoint);
          graph[0].data.push(newPoint);
        }else if(newPoint < 0){
          graph[1].data.push(0);
          graph[0].data.push(newPoint);
        }else if(newPoint > 0){
          graph[1].data.push(newPoint);
          graph[0].data.push(0);
        }
        
        
      });
      setGraph(graph);
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  return (
    <>
      <Navbar />
      <Grid className="main-container-b">
        <Grid.Row columns={2}>
          <Grid.Column
            mobile={16}
            tablet={16}
            computer={8}
            className="content-container-c"
          >
            <BotInformation />
          </Grid.Column>
          <Grid.Column
            mobile={16}
            tablet={16}
            computer={8}
            className="content-container-c"
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
                iBotX
              </Header>
              <Card.Group>
                {Object.keys(bet).length !== 0 ? (
                  <>
                    <Card
                      header={bet.table.title}
                      description={'เกม ' + bet.current.shoe + "-" + bet.current.round}
                    />
                    <Card header={bet.win_percent.toFixed(2) + '%'} description="โอกาสทำกำไร" />
                    <Card header={bet.current.bot} description={bet.betVal+ ' บาท'} />
                  </>
                ) : (
                  <>
                    <Card
                      header={"วิเคราะห์"}
                      description={"โต๊ะน่าเล่น"}
                    />
                    <Card header="วิเคราะห์" description="การแทง" />
                    <Card header="วิเคราะห์" description="โอกาสทำกำไร" />
                   
                  </>
                )}
              </Card.Group>
            </Container>
            <Container>
            <Header as="h2" style={{ color: "#fff" }}>
                ประวัติการเล่น
              </Header>
              <Table celled inverted selectable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>โต๊ะ / เกมที่</Table.HeaderCell>
                    <Table.HeaderCell>PLAYER / BANKER</Table.HeaderCell>
                    <Table.HeaderCell>เงินเดิมพัน</Table.HeaderCell>
                    <Table.HeaderCell>ผลที่ออก</Table.HeaderCell>
                    <Table.HeaderCell>เวลา</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {tableData.map((element) => (
                      <Table.Row key={element.id}>
                        <Table.Cell>{element.game_info}</Table.Cell>
                        <Table.Cell>
                          {Object.keys(element.bet.data.credit)[0]}
                        </Table.Cell>
                        <Table.Cell>
                          {element.bet_credit_chip_amount}
                        </Table.Cell>
                        <Table.Cell>
                          {element.sum_paid_credit_amount}
                        </Table.Cell>
                        <Table.Cell>{element.bet_time}</Table.Cell>
                      </Table.Row>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell colSpan="5">
                      <Menu inverted floated="right" pagination>
                        <Menu.Item as="a" icon>
                          <Icon inverted name="chevron left" />
                        </Menu.Item>
                        <Menu.Item as="a">1</Menu.Item>
                        <Menu.Item as="a">2</Menu.Item>
                        <Menu.Item as="a">3</Menu.Item>
                        <Menu.Item as="a">4</Menu.Item>
                        <Menu.Item as="a" icon>
                          <Icon inverted name="chevron right" />
                        </Menu.Item>
                      </Menu>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Setting;
