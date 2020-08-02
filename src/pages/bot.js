import axios from "axios";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card, Container, Grid, Header } from "semantic-ui-react";
import BotInformation from "../components/BotInformation";
import Navbar from "../components/Navbar";
import { socket } from "./socket";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Icon, Table } from "semantic-ui-react";
import { bot_transaction_set } from "../store";

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
  const dispatch = useDispatch();
  var [tableData, setTableData] = useState([]);
  var [graphData, setGraph] = useState([
    {
      name: "series 1",
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

  const [bet, setBet] = useState({});

  useEffect(() => {
    getBotTransaction();
    getUserTransaction();
    getUserBotTransaction();

    socket.on("user2", (data) => {
      console.log(data);
      if (data.action === "bet_success") {
        setBet(data.data);
      } else if (data.action === "bet_result") {
        getUserBotTransaction();
        getBotTransaction();
        getUserTransaction();
      }
    });
  }, []);

  async function getUserBotTransaction() {
    let bot_id = auth.bot_id;
    if (auth.bot_id.id !== undefined) {
      bot_id = auth.bot_id.id;
    }
    console.log(bot_id);
    try {
      let url = `https://api.ibot.bet/user_bot_transaction/${bot_id}`;
      console.log(url);
      const {
        data: { data, success },
      } = await axios.get(url);
      console.log(data);
      let transaction = [0];
      data.forEach((element) => {
        transaction.push(data.wallet - element.bot.init_wallet);
      });

      bot_transaction_set(transaction);
    } catch (error) {
      console.log("error while call getUserBotTransaction()", error);
    }
  }

  async function getUserTransaction() {
    let id = auth.id;
    console.log(id);
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

  async function getBotTransaction() {
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction");
      let newData = data.sort(compare);
      let graph = [
        {
          name: "series 1",
          data: [],
        },
      ];
      let i = start;
      let t = 0;
      newData.forEach((element) => {
        if (element.win_result === "WIN") {
          i++;
          graph[0].data.push(i);
        } else if (element.win_result === "LOSE") {
          i--;
          graph[0].data.push(i);
        } else {
          graph[0].data.push(i);
        }
        if (t === 1) {
          setStart(i);
        }
        t++;
      });
      setGraph(graph);
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
                  series={graphData}
                  height="240"
                />
              </Card>
            </Container>
            <Container text fluid>
              <Header as="h2" style={{ color: "#fff" }}>
                iBotX
              </Header>
              <Card.Group itemsPerRow={4}>
                {Object.keys(bet).length !== 0 ? (
                  <>
                    <Card
                      header={bet.current.bot}
                      description={bet.current.shoe + "-" + bet.current.round}
                    />
                    <Card header="56.45%" description="โอกาสทำกำไร" />
                  </>
                ) : (
                  <>
                    <Card
                      header={"กำลังวิเคราะห์"}
                      description={"โต๊ะน่าเล่น"}
                    />
                    <Card header="กำลังวิเคราะห์" description="โอกาสทำกำไร" />
                  </>
                )}
              </Card.Group>
            </Container>
            <Container>
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
                    <>
                      <Table.Row>
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
                    </>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell colSpan="3">
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
