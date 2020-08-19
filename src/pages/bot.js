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
  Pagination,
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)



  useEffect(() => {
    getUserTransaction(currentPage);
    subscribeBot();
  }, []);


  function handlePaginationChange(e, { activePage }){
    // console.log(activePage)
    setCurrentPage(activePage)
    getUserTransaction(activePage)
  }

  function subscribeBot() {
    const room = `user${auth.id}`;
    socket.on(room, (data) => {
      if (data.action === "bet_success") {
        setBet({
          betVal: data.data.betVal,
          round: data.data.round,
          shoe: data.data.shoe,
          table_id: data.data.table.id,
          table_title: data.data.table.title,
          win_percent: data.data.win_percent,
          bot: data.data.bot,
          user_bet: data.data.bet,
        });
      } else if (data.action === "bet_result") {
        getWallet();
        if (data.isStop) {
          setIsShownConfirmStop(true);
        } else {
          setBet({});
          getUserTransaction(currentPage);
          // getUserBotTransaction();
        }
      } else if (data.action === "info") {
        if (data.isPlay == true && data.table != null && Object.keys(data.current).length > 0) {
          if (data.currentBetData.shoe == data.current.shoe && data.currentBetData.round == data.current.round) {
            setBet({
              betVal: data.current.betVal,
              round: data.currentBetData.round,
              shoe: data.currentBetData.shoe,
              table_id: data.currentBetData.table.id,
              table_title: data.currentBetData.table.title,
              win_percent: data.currentBetData.win_percent,
              bot: data.currentBetData.bot,
              user_bet: data.current.bet,
            });
          } else {
            setBet({
              betVal: null,
              round: data.currentBetData.round,
              shoe: data.currentBetData.shoe,
              table_id: data.currentBetData.table.id,
              table_title: data.currentBetData.table.title,
              win_percent: data.currentBetData.win_percent,
              bot: data.currentBetData.bot,
              user_bet: null,
            });
          }

        } else {
          if(data.isPlay == true){
            setBet({
              betVal: null,
              round: data.currentBetData.round,
              shoe: data.currentBetData.shoe,
              table_id: data.currentBetData.table.id,
              table_title: data.currentBetData.table.title,
              win_percent: data.currentBetData.win_percent,
              bot: data.currentBetData.bot,
              user_bet: null,
            });
          }else{
            setBet({})
          }
         
        }
      }
    });

    socket.on("bot", (data) => {
      if (data.action == "play") {
        setBet({
          betVal: null,
          round: data.data.round,
          shoe: data.data.shoe,
          table_id: data.data.table.id,
          table_title: data.data.table.title,
          win_percent: data.data.win_percent,
          bot: data.data.bot,
          user_bet: null,
        });
      }
    });

    socket.on("all", (data) => {
      setBet({});
    });
  }

  async function getUserTransaction(activePage) {
    let id = auth.id;
    if (!id) return;
    try {
      let url = `${USER_TRANSACTION_URL}/${id}?page=${activePage}`;
      const {
        data: { data, success },
      } = await axios.get(url);
      
      // console.log(data)
      setTotalPage(data.bets.lastPage)
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
  // async function getUserBotTransaction() {
  //   let bot_id = botSetting.id;
  //   if (!bot_id) {
  //     return;
  //   }
  //   try {
  //     const {
  //       data: { data },
  //     } = await axios.get(`${USER_BOT_TRANSACTION_URL}/${bot_id}`);
  //     let transaction = [0];
  //     let newData = data.sort(compare);
  //     newData.forEach((element) => {
  //       transaction.push(element.wallet - element.bot.init_wallet);
  //     });

  //     dispatch(
  //       bot_transaction_set([
  //         {
  //           name: "series1",
  //           data: [...transaction],
  //         },
  //       ])
  //     );
  //   } catch (error) {
  //     console.log("error while call getUserBotTransaction()", error);
  //   }
  // }

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
              <Card.Group itemsPerRow={4} doubling={true}>
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
                      description="บอทวิเคราะห์"
                    />
                    <Card
                      header={bet.betVal == null ? "ไม่ได้เล่น" : bet.user_bet}
                      description={
                        bet.betVal == null ? "การเล่น" : bet.betVal + " บาท"
                      }
                    />
                  </>
                ) : (
                    <>
                      <Card header={"วิเคราะห์"} description={"โต๊ะน่าเล่น"} />
                      <Card header="วิเคราะห์" description="โอกาสทำกำไร" />
                      <Card header="วิเคราะห์" description="บอทวิเคราะห์" />
                      <Card header="วิเคราะห์" description="การเล่น" />
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
                      <Pagination floated="right" inverted
                        activePage={currentPage}
                        ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                        firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                        lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                        prevItem={{ content: <Icon name='angle left' />, icon: true }}
                        nextItem={{ content: <Icon name='angle right' />, icon: true }}
                        onPageChange={handlePaginationChange}
                        totalPages={totalPage}
                      />
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
