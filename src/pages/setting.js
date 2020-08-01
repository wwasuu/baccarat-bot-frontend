import React from "react";
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
} from "semantic-ui-react";
import BotInformation from "../components/BotInformation";

const setting = () => {
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
              ตั้งค่าโปรแกรมบอท
            </Header>
            <p>กำหนดรูปแบบโปรแกรมบอทเพื่อทำกำไรตามต้องการ</p>
          </Container>
          <Container text fluid>
            <Header as="h3" style={{ color: "#fff" }}>
              รูปแบบการเล่น
            </Header>
            <p>รูปแบบการเล่นหมายถึงลักษณะการเลือกฝ่ายเดิมพัน</p>
            <Card
              className="active"
              header="Player/Banker"
              description="Leverage agile frameworks to provide a robust synopsis for high level overviews."
            />
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
                className="active"
                header="เติมเงินคงที่"
                description="Leverage agile frameworks to provide a robust synopsis for high level overviews."
              />
              <Card
                header="Zean System"
                description="Leverage agile frameworks to provide a robust synopsis for high level overviews."
              />
            </Card.Group>
          </Container>
          <Container text fluid>
            <Header as="h3" style={{ color: "#fff" }}>
              ตั้งค่าชิพ
            </Header>
            <p>
              การตั้งค่าชิพคือการกำหนดเงินเดิมพันต่ำสุด
              ถึงสูงสุดที่สามารถลงเงินได้
            </p>

            <Form.Input
              icon="dollar sign"
              iconPosition="left"
              placeholder="50 - 2500"
            />
          </Container>
          <Container text fluid>
            <Header as="h3" style={{ color: "#fff" }}>
              เลือกชิพเริ่มต้น
            </Header>
            <p>
              ข้อแนะนำการเลือกชิพนั้นไม่ควรกำหนดชิพเริ่มต้นเกิน 1% ของเงินทุน
              เช่นทุน 5,000 บาท ควรเริ่มเล่น 50 บาทเป็นต้น
            </p>

            <Form.Input icon="redo" iconPosition="left" placeholder="50" />
            <div style={{ marginTop: 12 }}>
              <Button>50</Button>
              <Button>100</Button>
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

            <Select
              defaultValue="1_PERCENT"
              options={[
                { key: "1_PERCENT", value: "1_PERCENT", text: "1%" },
                { key: "2_PERCENT", value: "2_PERCENT", text: "2%" },
              ]}
            />
          </Container>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default setting;
