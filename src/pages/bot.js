import axios from "axios";
import cn from "classnames";
import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Grid,
  Header,
  Modal,
  Button,
} from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import BotInformation from "../components/BotInformation";
import Navbar from "../components/Navbar";
import { socket } from "../utils/socket";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Icon, Table } from "semantic-ui-react";
import {
  bot_transaction_set,
  wallet_set,
  bot_setting_clear,
  bot_setting_set,
} from "../store";
import BotGraph from "../components/BotGraphs";
import {
  USER_TRANSACTION_URL,
  USER_BOT_TRANSACTION_URL,
  WALLET_URL,
} from "../constants";

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
  const botSetting = useSelector((state) => state.botSetting);
  const dispatch = useDispatch();
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [isShownProgressBar, setIsShownProgressBar] = useState(true);
  const [isShownConfirmStop, setIsShownConfirmStop] = useState(false);
  const [bet, setBet] = useState({});

  useEffect(() => {
    getUserTransaction();
    subscribeBot();
  }, []);

  function subscribeBot() {
    const room = `user${auth.id}`;
    socket.on(room, (data) => {
      console.log(data);
      if (data.action === "bet_success") {
        console.log(data);
        setBet({
          betVal: data.data.betVal,
          round: data.data.round,
          shoe: data.data.shoe,
          table_id: data.data.table.id,
          table_title: data.data.table.title,
          win_percent: data.data.win_percent,
          bot: data.data.bot,
        });
      } else if (data.action === "bet_result") {
        getWallet();
        if (data.isStop) {
          setIsShownConfirmStop(true);
        } else {
          setBet({});
          getUserTransaction();
          getUserBotTransaction();
        }
      }
    });

    socket.on("bot", (data) => {
      console.log(data);
      if (data.action == "play") {
        setBet({
          betVal: null,
          round: data.data.round,
          shoe: data.data.shoe,
          table_id: data.data.table.id,
          table_title: data.data.table.title,
          win_percent: data.data.win_percent,
          bot: data.data.bot,
        });
      }
    });

    socket.on("all", (data) => {
      console.log(data);
      setBet({});
    });
  }

  async function getUserTransaction() {
    let id = auth.id;
    if (!id) return;
    try {
      let url = `${USER_TRANSACTION_URL}/${id}`;
      const {
        data: { data, success },
      } = await axios.get(url);
      setTableData(data.bets.data);
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
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
      }
    } catch (error) {
      console.log("error while call getWallet()", error);
    }
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

  function close() {
    dispatch(bot_setting_clear());
    setTimeout(() => {
      history.push("/setting");
    }, 1000);
    setIsShownConfirmStop(false);
  }

  const botInfoContinerClass = cn("content-container-c", {
    "content-container-c-float-a": isShownProgressBar,
  });

  return (
    <>
      <Navbar />
      <Grid className="main-container-b">
        <Grid.Row columns={2}>
          <Grid.Column
            mobile={16}
            tablet={16}
            computer={8}
            className={botInfoContinerClass}
          >
            <BotInformation
              isShownProgressBar={isShownProgressBar}
              setIsShownProgressBar={setIsShownProgressBar}
            />
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
              <BotGraph></BotGraph>
            </Container>
            <Container text fluid>
              <Header as="h2" style={{ color: "#fff" }}>
                iBotX
              </Header>
              <Card.Group>
                {Object.keys(bet).length !== 0 ? (
                  <>
                    <Card
                      header={bet.table_title}
                      description={"เกม " + bet.shoe + "-" + bet.round}
                    />
                    <Card
                      header={bet.win_percent.toFixed(2) + "%"}
                      description="โอกาสทำกำไร"
                    />
                    <Card
                      header={bet.bot}
                      description={
                        bet.betVal == null ? "ไม่ได้เล่น" : bet.betVal + " บาท"
                      }
                    />
                  </>
                ) : (
                  <>
                    <Card header={"วิเคราะห์"} description={"โต๊ะน่าเล่น"} />
                    <Card header="วิเคราะห์" description="โอกาสทำกำไร" />
                    <Card header="วิเคราะห์" description="การแทง" />
                  </>
                )}
              </Card.Group>
            </Container>
            <Container fluid>
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
                      <Table.Cell>{element.bet_credit_chip_amount}</Table.Cell>
                      <Table.Cell>{element.sum_paid_credit_amount}</Table.Cell>
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
      <Modal
        basic
        onClose={() => setIsShownConfirmStop(false)}
        onOpen={() => setIsShownConfirmStop(true)}
        open={isShownConfirmStop}
        size="small"
        closeOnDimmerClick={false}
      >
        <Header icon>การเล่นบอทของคุณสิ้นสุดแล้ว</Header>
        <Modal.Actions>
          <Button color="teal" onClick={close}>
            <Icon name="checkmark" /> กลับไปหน้าตั้งค่า
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Setting;
