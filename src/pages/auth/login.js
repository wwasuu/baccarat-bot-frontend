import axios from "axios";
import Cookies from "js-cookie";
import React, { useState } from "react";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  Grid,
  Header,
  Icon,
  Segment,
  Statistic,
  Message,
} from "semantic-ui-react";
import { auth_loading, auth_login } from "../../store";

const Login = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorUsername, setErrorUsername] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function login() {
    try {
      if (!username.trim() || !password.trim()) {
        if (!username.trim()) {
          setErrorUsername({
            content: "กรุณากรอกรบัญชีผู้ใช้",
            pointing: "below",
          });
        }
        if (!password.trim()) {
          setErrorPassword({
            content: "กรุณากรอกรหัสผ่าน",
            pointing: "below",
          });
        }
        return;
      }
      setIsAuthenticating(true);
      clearError()
      const {
        data: { data, success, message },
      } = await axios.post("https://api.ibot.bet/login", {
        username,
        password,
      });
      if (success) {
        Cookies.set(
          "auth",
          JSON.stringify(
            {
              bot_id: data.bot,
              id: data.user_id,
              username: data.username,
            },
            { expires: 30 }
          )
        );
        dispatch(
          auth_login({
            bot_id: data.bot,
            id: data.user_id,
            username: data.username,
          })
        );
        history.push("/setting");
      } else {
        setError(message);
      }
      
    } catch (error) {
      console.log("Error while call login()", error);
      setError("กรุณาลองใหม่อีกครั้ง");
    }
    setIsAuthenticating(false);
  }

  function handleChangeUsername(e) {
    setUsername(e.target.value);
    clearError();
  }

  function handleChangePassword(e) {
    setPassword(e.target.value);
    clearError();
  }

  function clearError() {
    setError("");
    setErrorUsername(null);
    setErrorPassword(null);
  }

  return (
    <Grid className="main-container">
      <Grid.Row>
        <Grid.Column
          textAlign="center"
          mobile={16}
          tablet={16}
          computer={8}
          verticalAlign="middle"
          className="content-container-a"
        >
          <Container text textAlign="left" fluid>
            <Header as="h1" style={{ color: "#fff" }}>
              www.ibot.bet คืออะไร ?
            </Header>
            <p style={{ color: "#fff" }}>
              BOT ย่อมาจาก Robot คือ
              โปรแกรมอัตโนมัติสำหรับทำหน้าที่อย่างใดอย่างหนึ่ง
              ที่ตั้งโปรแกรมไว้อย่างตายตัวหรือด้วยระบบอัลกอริทึมอันซับซ้อน
              <br />
              และแอพ www.ibot.bet
              นั้นถูกพัฒนามาจากกลุ่มโปรแกรมเมอร์ชื่อดังระดับประเทศ
              โดยเขียนและออกแบบมาให้ทำหน้าที่แทนมนุษย์ในการลงทุน เกมพนัน
              ซึ่งชื่อบอทตัวนี้ชื่อว่า iBotXซึ่ง iBotX
              จะลบจุดด้อยในการเล่นเกมพนันของมนุษย์ 4 อย่าง
              <br />
              1. มนุษย์มีความโลภและขาดวินัยในการลงทุน
              ไม่มีความรู้หรือไม่อาจหักห้ามใจได้ เมื่อได้กำไรหรือเสีย
              <br />
              2. มนุษย์ส่วนมากลงทุนในเกมพนันด้วยอารมณ์และความชอบ
              แม้ส่วนน้อยจะลงทุนด้วยความการวิเคราะห์แต่การวิเคราะห์ของมนุษย์นั้นไม่อาจจะเอาชนะการวิเคราะห์ของ
              bot ที่จะคำนวณจากสถิติและความน่าจะเป็น
              <br />
              3. มนุษย์มีเวลาจำกัดและมีความเหนื่อยล้าทำให้การเล่นเกมพนันนั้น
              ลดประสิทธิภาพในการคิดวิเคราะห์หรืออาจจะผิดพลาดได้ง่ายๆ
              <br />
              4. มนุษย์ต้องใช้เวลานานในการเรียนรู้เทคนิคต่างๆในการเล่นเกมพนัน
              ซึ่งมีหลากหลายเกม และหลายหลายเทคนิค
              <br />
              แต่ ibotx ได้รวบรวมสถิติและเทคนิคการเล่นต่างๆ
              รวมไปถึงรูปแบบการเดินเงินที่ได้พิสูจน์แล้วว่า สามารถทำเงินได้จริง
              <br />
            </p>
          </Container>
          <Container text textAlign="left" fluid>
            <Header as="h1" style={{ color: "#fff" }}>
              ibotx ทำอะไรได้บ้าง ?
            </Header>
            <p style={{ color: "#fff" }}>
              อย่างที่กล่าวมา ibotx ได้ถูกออกแบบมาให้เล่นเกมพนันแทนมนุษย์
              <br />
              ปัจจุบันฟังชั่นในการใช้งานของ ibotx นั้น เราสามารถเลือกลงทุนได้ใน
              3 เกมหลักๆตอนนี้คือ บาคาร่า รูเล็ต เสือมังกร
              <br />
              สามารถตั้งค่าการลงทุนได้ว่าจะลงทุนแบบไหนเป็นพิเศษเช่น น้ำเงิน
              เท่านั้น แดงเท่านั้น หรือทั้งสอง
              และยังมีรูปแบบการเล่นที่หลากหลายตามแต่ผู้ใช้งานจะตั้งค่าเลือก
              และยังสามารถตั้งค่าให้ ibotx หยุดเมื่อกำไรขาดทุนเท่าไหร่ได้อีกด้วย
              <br />
              ลดความเสี่ยงในการลงทุนได้อย่างมหาศาล ที่สำคัญ ibotx
              จะมีการอัพเดทสถิติตัวเองทุกๆ วันเพื่อความแม่นยำ
              <br />
              และมีโปรแกรมเมอร์พัฒนาและเพิ่มเติมฟังชั่นอัพเดท ibotx เองอยู่เสมอ
              <br />
            </p>
          </Container>
        </Grid.Column>
        <Grid.Column
          mobile={16}
          tablet={16}
          computer={8}
          verticalAlign="middle"
          className="content-container-b"
        >
          <div className="text-center" style={{ marginBottom: 32 }}>
            <img src="/logo.png" alt="logo" />
          </div>
          <Header as="h2" style={{ color: "#fff" }} textAlign="left">
            เข้าสู่บัญชีของคุณ
          </Header>
          <Form size="large" error={error}>
            <Segment stacked>
              <Form.Input
                error={errorUsername}
                fluid
                icon="user"
                iconPosition="left"
                placeholder="บัญชีผู้ใช้"
                onChange={handleChangeUsername}
              />
              <Form.Input
                error={errorPassword}
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="รหัสผ่าน"
                type="password"
                onChange={handleChangePassword}
              />

              <Message error header="เกิดข้อผิดพลาด" content={error} />

              <Button
                color="teal"
                fluid
                size="large"
                onClick={login}
                loading={isAuthenticating}
              >
                เข้าสู่ระบบ
              </Button>
            </Segment>
            <Form.Field className="text-center">
              คุณยังไม่มีบัญชีใช่ไหม?{" "}
              <a href="http://truthbet.com/friends/invite/vyKslk17Uz">สมัคร</a>
            </Form.Field>
          </Form>
          <Statistic.Group
            className="statistic-container"
            widths="three"
            size="tiny"
          >
            <Statistic>
              <Statistic.Label>
                <Icon name="user" color="teal" />
              </Statistic.Label>
              <Statistic.Value>
                <CountUp end={999} />
              </Statistic.Value>
              <Statistic.Label>ผู้ใช้ที่ลงทะเบียน</Statistic.Label>
            </Statistic>

            <Statistic>
              <Statistic.Label>
                <Icon name="laptop" color="teal" />
              </Statistic.Label>
              <Statistic.Value>
                <CountUp end={999} />
              </Statistic.Value>
              <Statistic.Label>ผู้ใช้ที่ออนไลน์</Statistic.Label>
            </Statistic>

            <Statistic>
              <Statistic.Label>
                <Icon name="usd" color="teal" />
              </Statistic.Label>
              <Statistic.Value>
                <CountUp end={999999} separator="," />
              </Statistic.Value>
              <Statistic.Label>กำไรจากบอท</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default Login;
