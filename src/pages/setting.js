import cn from "classnames";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Container,
  Form,
  Grid,
  Header,
  Segment,
  Divider,
  Checkbox,
} from "semantic-ui-react";
import BotInformation from "../components/BotInformation";
import Navbar from "../components/Navbar";
import {
  bot_setting_set,
  error_bot_setting_clear,
  error_bot_setting_set,
} from "../store";

const Setting = () => {
  const botSetting = useSelector((state) => state.botSetting);
  const wallet = useSelector((state) => state.wallet);
  const errorBotSetting = useSelector((state) => state.errorBotSetting);
  const [profit, setProfit] = useState("");
  const [loss, setLoss] = useState("");
  const dispatch = useDispatch();
  const [isShownProgressBar, setIsShownProgressBar] = useState(true)

  function handleChangeProfit(e) {
    dispatch(error_bot_setting_clear());
    const value = e.target.value;
    if (value === "") {
      setProfit("");
      dispatch(
        bot_setting_set({
          ...botSetting,
          profit_percent: "",
          profit_threshold: 0,
        })
      );
      return;
    }
    const percent = +((100 * +value) / wallet.play_wallet).toFixed(2);
    setProfit(+value);
    dispatch(
      bot_setting_set({
        ...botSetting,
        profit_percent: percent,
        profit_threshold: botSetting.init_wallet + +value,
      })
    );
  }

  function handleChangeProfitPercent(e) {
    dispatch(error_bot_setting_clear());
    const value = e.target.value;
    if (value === "") {
      setProfit("");
      dispatch(
        bot_setting_set({
          ...botSetting,
          profit_percent: "",
          profit_threshold: 0,
        })
      );
      return;
    }
    const integer = Math.floor((wallet.play_wallet * +value) / 100);
    dispatch(
      bot_setting_set({
        ...botSetting,
        profit_percent: +value,
        profit_threshold: botSetting.init_wallet + integer,
      })
    );
    setProfit(integer);
  }

  function handleChangeLoss(e) {
    dispatch(error_bot_setting_clear());
    const value = e.target.value;
    if (value === "") {
      setLoss("");
      dispatch(
        bot_setting_set({
          ...botSetting,
          loss_percent: "",
          loss_threshold: 0,
        })
      );
      return;
    }
    const percent = +((100 * +value) / wallet.play_wallet).toFixed(2);
    if (percent > 100) {
      dispatch(error_bot_setting_set("LOSS_OVER_LIMIT"));
    }
    setLoss(+value);
    dispatch(
      bot_setting_set({
        ...botSetting,
        loss_percent: percent,
        loss_threshold: botSetting.init_wallet - +value,
      })
    );
  }

  function handleChangeLossPercent(e) {
    dispatch(error_bot_setting_clear());
    const value = e.target.value;
    if (value === "") {
      setLoss("");
      dispatch(
        bot_setting_set({
          ...botSetting,
          loss_percent: "",
          loss_threshold: 0,
        })
      );
      return;
    }
    const integer = Math.floor((wallet.play_wallet * +value) / 100);
    if (value > 100) {
      dispatch(error_bot_setting_set("LOSS_OVER_LIMIT"));
    }
    console.log(value);
    dispatch(
      bot_setting_set({
        ...botSetting,
        loss_percent: +value,
        loss_threshold: botSetting.init_wallet - integer,
      })
    );
    setLoss(integer);
  }

  function renderErorrLoss() {
    let content = "";
    if (errorBotSetting.includes("LOSS")) {
      content = "กรุณากำหนดขาดทุนไม่เกิน";
    }
    if (errorBotSetting.includes("LOSS_OVER_LIMIT")) {
      content = "การกำหนดขาดทุนไม่เกิน ไม่สามารถเกินเงินในบัญชี";
    }
    return {
      content,
      pointing: "below",
    };
  }

  function onChangeIsInfinite(e, v) {
    console.log(v.checked)
    bot_setting_set({
      ...botSetting,
      is_infinite: v.checked
    })
  }

  const botInfoContinerClass = cn("content-container-c", { "content-container-c-float-b": isShownProgressBar })

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
            <BotInformation isShownProgressBar={isShownProgressBar} setIsShownProgressBar={setIsShownProgressBar} />
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
                    disable: wallet.play_wallet < 2500,
                  })}
                  header="การเดินเงินแบบทบ 5 ไม้ มาติงเกลพิเศษ"
                  description="เหมาะสำหรับการลงทุนระยะสั้น
                จะเดินเงิน  50-100-250-600-1500 (ทุน 2,500)"
                  onClick={() => {
                    if (wallet.play_wallet < 2500) return;
                    return dispatch(
                      bot_setting_set({ ...botSetting, money_system: 2 })
                    );
                  }}
                />
                <Card
                  className={cn({
                    active: botSetting.money_system === 3,
                    disable: wallet.play_wallet < 1000,
                  })}
                  header="การเดินเงินแบบลาบูแชร์"
                  description="คือการแบ่งกองเงินออกเป็นกองๆ กองละเท่าๆกัน (ทุน 1,000 เปิดใช้งาน)"
                  onClick={() => {
                    if (wallet.play_wallet < 1000) return;
                    return dispatch(
                      bot_setting_set({ ...botSetting, money_system: 3 })
                    );
                  }}
                />
                <Card
                  className={cn({
                    active: botSetting.money_system === 4,
                    disable: wallet.play_wallet < 5000,
                  })}
                  header="การเดินเงินแบบ X sytem"
                  description="จะบริหารเงินให้อย่างเหมาะสม (ทุน 5,000 เปิดใช้งาน)"
                  onClick={() => {
                    if (wallet.play_wallet < 5000) return;
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
              <div className="chip-container">
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
              <Segment className="divider-container-desktop">
                <Grid columns={2} relaxed="very">
                  <Grid.Column>
                    <Form.Input
                      error={
                        errorBotSetting.includes("PROFIT")
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
                  </Grid.Column>
                  <Grid.Column>
                    <Form.Input
                      error={
                        errorBotSetting.includes("PROFIT")
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
                      onChange={handleChangeProfitPercent}
                    />
                  </Grid.Column>
                </Grid>

                <Divider vertical>หรือ</Divider>
              </Segment>

              <Segment className="divider-container-mobile">
                <Form.Input
                  error={
                    errorBotSetting.includes("PROFIT")
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
                <Divider horizontal>หรือ</Divider>
                <Form.Input
                  error={
                    errorBotSetting.includes("PROFIT")
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
                  onChange={handleChangeProfitPercent}
                />
              </Segment>
            </Container>

            <Container text fluid>
              <Form.Field>
                <Checkbox
                  onChange={onChangeIsInfinite}
                  color="teal"
                  label="ถอนกำไรเข้ากระเป๋ากำไรและเริ่มเล่นใหม่"
                />
              </Form.Field>
            </Container>

            <Container text fluid>
              <Header as="h3" style={{ color: "#fff" }}>
                กำหนดขาดทุนไม่เกิน
              </Header>
              <p>ข้อแนะนำ แนะนำให้ตั้ง 3 เท่าของกำไรที่เป้าหมาย </p>
              <Segment className="divider-container-desktop">
                <Grid columns={2} relaxed="very">
                  <Grid.Column>
                    <Form.Input
                      error={
                        errorBotSetting.includes("LOSS") ||
                        errorBotSetting.includes("LOSS_OVER_LIMIT")
                          ? renderErorrLoss()
                          : null
                      }
                      type="number"
                      icon="dollar sign"
                      iconPosition="left"
                      onChange={handleChangeLoss}
                      value={loss}
                      id="form-input-first-name"
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <Form.Input
                      error={
                        errorBotSetting.includes("LOSS") ||
                        errorBotSetting.includes("LOSS_OVER_LIMIT")
                          ? renderErorrLoss()
                          : null
                      }
                      type="number"
                      icon="percent"
                      iconPosition="left"
                      onChange={handleChangeLossPercent}
                      value={botSetting.loss_percent}
                    />
                  </Grid.Column>
                </Grid>

                <Divider vertical>หรือ</Divider>
              </Segment>

              <Segment className="divider-container-mobile">
                <Form.Input
                  error={
                    errorBotSetting.includes("LOSS") ||
                    errorBotSetting.includes("LOSS_OVER_LIMIT")
                      ? renderErorrLoss()
                      : null
                  }
                  type="number"
                  icon="dollar sign"
                  iconPosition="left"
                  onChange={handleChangeLoss}
                  value={loss}
                  id="form-input-first-name"
                />
                <Divider horizontal>หรือ</Divider>
                <Form.Input
                  error={
                    errorBotSetting.includes("LOSS") ||
                    errorBotSetting.includes("LOSS_OVER_LIMIT")
                      ? renderErorrLoss()
                      : null
                  }
                  type="number"
                  icon="percent"
                  iconPosition="left"
                  onChange={handleChangeLossPercent}
                  value={botSetting.loss_percent}
                />
              </Segment>
            </Container>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Setting;
