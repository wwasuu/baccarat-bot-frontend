import cn from "classnames";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Card,
  Container,
  Form,
  Grid,
  Header,
  Select,
} from "semantic-ui-react";
import Navbar from "../components/Navbar";
import BotInformation from "../components/BotInformation";
import { bot_setting_set, error_bot_setting_clear } from "../store";

const Setting = () => {
  const botSetting = useSelector((state) => state.botSetting);
  const balance = useSelector((state) => state.balance);
  const errorBotSetting = useSelector((state) => state.errorBotSetting);
  const [profit, setProfit] = useState("");
  const [profitPercent, setProfitPercent] = useState("");
  const [loss, setLoss] = useState("");
  const [lossPercent, setLossPercent] = useState("");
  const dispatch = useDispatch();

  function handleChangeProfit(e) {
    dispatch(error_bot_setting_clear());
    const value = e.target.value;
    setProfit(value);
    const percent = +Math.round((100 * value) / balance);
    dispatch(bot_setting_set({ ...botSetting, profit_percent: percent }));
    setProfitPercent(percent);
  }

  function handleChangeProfitPercent(e) {
    dispatch(error_bot_setting_clear());
    const value = +e.target.value;
    setProfitPercent(value);
    const integer = Math.round((balance * value) / 100);
    dispatch(bot_setting_set({ ...botSetting, profit_percent: value }));
    setProfit(integer);
  }

  function handleChangeLoss(e) {
    dispatch(error_bot_setting_clear());
    const value = +e.target.value;
    setLoss(value);
    const percent = Math.round((100 * value) / balance);
    dispatch(bot_setting_set({ ...botSetting, loss_percent: percent }));
    setLossPercent(percent);
  }

  function handleChangeLossPercent(e) {
    dispatch(error_bot_setting_clear());
    const value = +e.target.value;
    setLossPercent(value);
    const integer = Math.round((balance * value) / 100);
    dispatch(bot_setting_set({ ...botSetting, loss_percent: value }));
    setLoss(integer);
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
                ตั้งค่าโปรแกรมบอท
              </Header>
              <p>กำหนดรูปแบบโปรแกรมบอทเพื่อทำกำไรตามต้องการ</p>
            </Container>
            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                รูปแบบการเล่น
              </Header>
              <p>รูปแบบการเล่นหมายถึงลักษณะการเลือกฝ่ายเดิมพัน</p>
              <Card.Group>
                <Card
                  className={cn({ active: botSetting.bet_side === 1 })}
                  header="Player/Banker"
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, bet_side: 1 }))
                  }
                />
                <Card
                  className={cn({ active: botSetting.bet_side === 2 })}
                  header="Player เท่านั้น"
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, bet_side: 2 }))
                  }
                />
                <Card
                  className={cn({ active: botSetting.bet_side === 3 })}
                  header="Banker เท่านั้น"
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, bet_side: 3 }))
                  }
                />
              </Card.Group>
            </Container>
            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                รูปแบบการเดินเงิน
              </Header>
              <p>
                การเดินเงินเป็นการบริหารความเสี่ยงในการลงทุนเพื่อให้สามารถทำกำไรจนถึงเป้าหมายที่กำหนด
              </p>

              <Card.Group>
                <Card
                  className={cn({ active: botSetting.money_system === 1 })}
                  header="เติมเงินคงที่"
                  description="คือการกำหนดให้บอทเดินเงินเท่าๆกันทุกๆตา ตามที่เรากำหนดไว้ (ไม่จำกัดทุน)"
                  onClick={() =>
                    dispatch(
                      bot_setting_set({ ...botSetting, money_system: 1 })
                    )
                  }
                />
                <Card
                  className={cn({
                    active: botSetting.money_system === 2,
                    disable: balance < 2500,
                  })}
                  header="การเดินเงินแบบทบ 5 ไม้ มาติงเกลพิเศษ"
                  description="เหมาะสำหรับการลงทุนระยะสั้น
                จะเดินเงิน  50-100-250-600-1500 (ทุน 2,500)"
                  onClick={() => {
                    if (balance < 2500) return;
                    return dispatch(
                      bot_setting_set({ ...botSetting, money_system: 2 })
                    );
                  }}
                />
                <Card
                  className={cn({
                    active: botSetting.money_system === 3,
                    disable: balance < 1000,
                  })}
                  header="การเดินเงินแบบลาบูแชร์"
                  description="คือการแบ่งกองเงินออกเป็นกองๆ กองละเท่าๆกัน (ทุน 1,000 เปิดใช้งาน)"
                  onClick={() => {
                    if (balance < 1000) return;
                    return dispatch(
                      bot_setting_set({ ...botSetting, money_system: 3 })
                    );
                  }}
                />
                <Card
                  className={cn({
                    active: botSetting.money_system === 4,
                    disable: balance < 5000,
                  })}
                  header="การเดินเงินแบบ X sytem"
                  description="จะบริหารเงินให้อย่างเหมาะสม (ทุน 5,000 เปิดใช้งาน)"
                  onClick={() => {
                    if (balance < 5000) return;
                    return dispatch(
                      bot_setting_set({ ...botSetting, money_system: 4 })
                    );
                  }}
                />
              </Card.Group>
            </Container>
            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                เลือกชิพเริ่มต้น
              </Header>
              <p>
                ข้อแนะนำการเลือกชิพนั้นไม่ควรกำหนดชิพเริ่มต้นเกิน 1% ของเงินทุน
                เช่นทุน 5,000 บาท ควรเริ่มเล่น 50 บาทเป็นต้น
              </p>
              <div style={{ marginTop: 12 }}>
                <Button
                  color={botSetting.init_bet === 50 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 50 }))
                  }
                >
                  50
                </Button>
                <Button
                  color={botSetting.init_bet === 100 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 100 }))
                  }
                >
                  100
                </Button>
                <Button
                  color={botSetting.init_bet === 200 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 200 }))
                  }
                >
                  200
                </Button>
                <Button
                  color={botSetting.init_bet === 300 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 300 }))
                  }
                >
                  300
                </Button>
                <Button
                  color={botSetting.init_bet === 400 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 400 }))
                  }
                >
                  400
                </Button>
                <Button
                  color={botSetting.init_bet === 500 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 500 }))
                  }
                >
                  500
                </Button>
                <Button
                  color={botSetting.init_bet === 1000 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 1000 }))
                  }
                >
                  1,000
                </Button>
                <Button
                  color={botSetting.init_bet === 1500 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 1500 }))
                  }
                >
                  1,500
                </Button>
                <Button
                  color={botSetting.init_bet === 2000 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 2000 }))
                  }
                >
                  2,000
                </Button>
                <Button
                  color={botSetting.init_bet === 2500 ? "teal" : ""}
                  onClick={() =>
                    dispatch(bot_setting_set({ ...botSetting, init_bet: 2500 }))
                  }
                  style={{ marginTop: 4 }}
                >
                  2,500
                </Button>
              </div>
            </Container>
            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                กำไรเป้าหมาย
              </Header>
              <p>
                ข้อแนะนำการเลือกกำไรเป้าเริ่มต้นที่ 5-10% และเก็บเป็นรอบ
                หรือวันละครั้งเพื่อลงทุนระยะยาว
              </p>

              <div class="ui segment divider-container">
                <div class="ui two column very relaxed grid">
                  <div class="column">
                    <Form.Input
                      error={
                        errorBotSetting.indexOf("PROFIT") >= 0
                          ? {
                              content: "กรุณากำหนดกำไรเป้าหมาย",
                              pointing: "below",
                            }
                          : null
                      }
                      type="number"
                      icon="dollar sign"
                      iconPosition="left"
                      value={profit}
                      onChange={handleChangeProfit}
                    />
                  </div>
                  <div class="column">
                    <Form.Input
                      error={
                        errorBotSetting.indexOf("PROFIT") >= 0
                          ? {
                              content: "กรุณากำหนดกำไรเป้าหมาย",
                              pointing: "below",
                            }
                          : null
                      }
                      type="number"
                      icon="percent"
                      iconPosition="left"
                      value={botSetting.profit_percent}
                      // value={profitPercent}
                      onChange={handleChangeProfitPercent}
                    />
                    {/* <Form.Select
                      value={botSetting.profit_percent}
                      onChange={(e, v) =>
                        dispatch(
                          bot_setting_set({
                            ...botSetting,
                            profit_percent: v.value,
                          })
                        )
                      }
                      options={[
                        { key: "1", value: 1, text: "1%" },
                        { key: "2", value: 2, text: "2%" },
                        { key: "3", value: 3, text: "3%" },
                        { key: "4", value: 4, text: "4%" },
                        { key: "5", value: 5, text: "5%" },
                        { key: "10", value: 10, text: "10%" },
                        { key: "20", value: 20, text: "20%" },
                        { key: "30", value: 30, text: "30%" },
                        { key: "40", value: 40, text: "40%" },
                        { key: "50", value: 50, text: "50%" },
                        { key: "75", value: 75, text: "75%" },
                        { key: "100", value: 100, text: "100%" },
                      ]}
                    /> */}
                  </div>
                </div>
                <div class="ui vertical divider">หรือ</div>
              </div>
            </Container>
            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                กำหนดขาดทุนไม่เกิน
              </Header>
              <p>ข้อแนะนำ แนะนำให้ตั้ง 3 เท่าของกำไรที่เป้าหมาย </p>
              <div class="ui segment divider-container">
                <div class="ui two column very relaxed grid">
                  <div class="column">
                    <Form.Input
                      error={
                        errorBotSetting.indexOf("LOSS") >= 0
                          ? {
                              content: "กรุณากำหนดขาดทุนไม่เกิน",
                              pointing: "below",
                            }
                          : null
                      }
                      type="number"
                      icon="dollar sign"
                      iconPosition="left"
                      onChange={handleChangeLoss}
                      value={loss}
                    />
                  </div>
                  <div class="column">
                    <Form.Input
                      error={
                        errorBotSetting.indexOf("LOSS") >= 0
                          ? {
                              content: "กรุณากำหนดขาดทุนไม่เกิน",
                              pointing: "below",
                            }
                          : null
                      }
                      type="number"
                      icon="percent"
                      iconPosition="left"
                      onChange={handleChangeLossPercent}
                      value={botSetting.loss_percent}
                      // value={lossPercent}
                    />
                  </div>
                </div>
                <div class="ui vertical divider">หรือ</div>
              </div>
              {/* <Form.Select
                value={botSetting.loss_percent}
                onChange={(e, v) => {
                  return dispatch(
                    bot_setting_set({ ...botSetting, loss_percent: v.value })
                  );
                }}
                options={[
                  { key: "1", value: 1, text: "1%" },
                  { key: "2", value: 2, text: "2%" },
                  { key: "3", value: 3, text: "3%" },
                  { key: "4", value: 4, text: "4%" },
                  { key: "5", value: 5, text: "5%" },
                  { key: "10", value: 10, text: "10%" },
                  { key: "20", value: 20, text: "20%" },
                  { key: "30", value: 30, text: "30%" },
                  { key: "40", value: 40, text: "40%" },
                  { key: "50", value: 50, text: "50%" },
                  { key: "75", value: 75, text: "75%" },
                  { key: "100", value: 100, text: "100%" },
                ]}
              /> */}
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Setting;
