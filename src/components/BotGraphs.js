import React, { useState, useEffect } from "react";
import axios from "axios";
import { Checkbox, Card, Container } from "semantic-ui-react";
import Chart from "react-apexcharts";
import { socket } from "../pages/socket";

function compare(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

export default function BotGrapj() {
  const [betSide, setBetSide] = useState(["DEFAULT"]);
  const [show, setShow] = useState({
    DEFAULT: true,
    BANKER: false,
    PLAYER: true,
  });
  const [myGraph, setMyGraph] = useState(graphData);
  const [colorOption, setColorOption] = useState();
  var [defaultGraph, setDefaultGraph] = useState({
    multi: [
      {
        name: "PLAYER/BANKER",
        data: [],
      },
    ],
    single: [
      {
        name: "PLAYER/BANKER",
        data: [],
      },
      {
        name: "PLAYER/BANKER",
        data: [],
      },
    ],
  });
  var [bankerGraph, setBankerGraph] = useState({
    multi: [
      {
        name: "BANKER Only",
        data: [],
      },
    ],
    single: [
      {
        name: "BANKER Only",
        data: [],
      },
      {
        name: "BANKER Only",
        data: [],
      },
    ],
  });
  var [playerGraph, setPlayerGraph] = useState({
    multi: [
      {
        name: "PLAYER Only",
        data: [],
      },
    ],
    single: [
      {
        name: "PLAYER Only",
        data: [],
      },
      {
        name: "PLAYER Only",
        data: [],
      },
    ],
  });

  var [graphData, setGraph] = useState([
    {
      name: "series 1",
      data: [],
    },
  ]);

  useEffect(() => {
    getBotTransaction();
    // getBankerBotTransaction()
    // getPlayerBotTransaction()
    subscribeBot();
  }, []);

  function subscribeBot() {
    const room = `all`;
    socket.on(room, (data) => {
      console.log(data);
      getBotTransaction();
    });
  }

  function getOption() {
    if (betSide.length === 1) {
      return {
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
          type: "gradient",
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
      };
    } else {
      return {
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
        colors: ["#00b5ad", "#de1245", "#1226db"],
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
          type: "gradient",
        },
        legend: {
          show: true,
          labels: {
            colors: "white",
            useSeriesColors: false,
          },
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
      };
    }
  }

  function showGraph() {
    if (betSide.length === 1) {
      if (betSide[0] === "DEFAULT") {
        return [...defaultGraph.single];
      } else if (betSide[0] === "BANKER") {
        return [...bankerGraph.single];
      } else if (betSide[0] === "PLAYER") {
        return [...playerGraph.single];
      }
    } else {
      let g = [];
      if (betSide.indexOf("DEFAULT") >= 0) {
        g.push(...defaultGraph.multi);
      } else {
        g.push({
          name: "PLAYER/BANKER",
          data: [],
        });
      }

      if (betSide.indexOf("BANKER") >= 0) {
        g.push(...bankerGraph.multi);
      } else {
        g.push({
          name: "BANKER Only",
          data: [],
        });
      }

      if (betSide.indexOf("PLAYER") >= 0) {
        g.push(...playerGraph.multi);
      } else {
        g.push({
          name: "PLAYER Only",
          data: [],
        });
      }
      return g;
    }
  }

  async function getBotTransaction() {
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction?type=DEFAULT");
      let newData = data.sort(compare);
      let multiGraph = [
        {
          name: "PLAYER/BANKER",
          data: [],
        },
      ];

      let singleGraph = [
        {
          name: "POSITIVE PLAYER/BANKER",
          data: [],
        },
        {
          name: "NEGATIVE PLAYER/BANKER",
          data: [],
        },
      ];
      let offset = 0 - newData[0].point;
      newData.forEach((element) => {
        let newPoint = element.point + offset;
        multiGraph[0].data.push(newPoint);
      });

      newData.forEach((element) => {
        let newPoint = element.point + offset;
        if (newPoint === 0) {
          singleGraph[1].data.push(newPoint);
          singleGraph[0].data.push(newPoint);
        } else if (newPoint < 0) {
          singleGraph[1].data.push(0);
          singleGraph[0].data.push(newPoint);
        } else if (newPoint > 0) {
          singleGraph[1].data.push(newPoint);
          singleGraph[0].data.push(0);
        }
      });
      setDefaultGraph({ multi: multiGraph, single: singleGraph });
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction?type=BANKER");
      let newData = data.sort(compare);
      newData.shift();
      let multiGraph = [
        {
          name: "BANKER Only",
          data: [],
        },
      ];

      let singleGraph = [
        {
          name: "POSITIVE BANKER Only",
          data: [],
        },
        {
          name: "NEGATIVE BANKER Only",
          data: [],
        },
      ];
      let init = 0;
      multiGraph[0].data.push(0);
      newData.forEach((element) => {
        if (element.win_result === "WIN") {
          init++;
        } else if (element.win_result === "LOSE") {
          init--;
        }
        multiGraph[0].data.push(init);
      });
      init = 0;
      newData.forEach((element) => {
        if (element.win_result === "WIN") {
          init++;
        } else if (element.win_result === "LOSE") {
          init--;
        }

        if (init === 0) {
          singleGraph[1].data.push(init);
          singleGraph[0].data.push(init);
        } else if (init < 0) {
          singleGraph[1].data.push(0);
          singleGraph[0].data.push(init);
        } else if (init > 0) {
          singleGraph[1].data.push(init);
          singleGraph[0].data.push(0);
        }
      });
      setBankerGraph({ multi: multiGraph, single: singleGraph });
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
    try {
      const {
        data: { data, success },
      } = await axios.get("https://api.ibot.bet/bot_transaction?type=PLAYER");
      let newData = data.sort(compare);
      newData.shift();
      let multiGraph = [
        {
          name: "PLAYER Only",
          data: [],
        },
      ];

      let singleGraph = [
        {
          name: "POSITIVE PLAYER Only",
          data: [],
        },
        {
          name: "NEGATIVE PLAYER Only",
          data: [],
        },
      ];
      let init = 0;
      multiGraph[0].data.push(0);
      newData.forEach((element) => {
        if (element.win_result === "WIN") {
          init++;
        } else if (element.win_result === "LOSE") {
          init--;
        }
        multiGraph[0].data.push(init);
      });
      init = 0;
      newData.forEach((element) => {
        if (element.win_result === "WIN") {
          init++;
        } else if (element.win_result === "LOSE") {
          init--;
        }

        if (init === 0) {
          singleGraph[1].data.push(init);
          singleGraph[0].data.push(init);
        } else if (init < 0) {
          singleGraph[1].data.push(0);
          singleGraph[0].data.push(init);
        } else if (init > 0) {
          singleGraph[1].data.push(init);
          singleGraph[0].data.push(0);
        }
      });
      setPlayerGraph({ multi: multiGraph, single: singleGraph });
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  function toggleBetSide(value) {
    if (betSide.indexOf(value) >= 0) {
      setBetSide(betSide.filter((x) => x !== value));
    } else {
      setBetSide([...betSide, value]);
    }
  }

  return (
    <>
      <div className="switch-group">
        <label style={{ color: "white", marginRight: "10px" }}>
          เลือกเพื่อดูกราฟ:
        </label>
        <div
          className="ui toggle checkbox"
          onClick={() => toggleBetSide("DEFAULT")}
        >
          <input type="checkbox" checked={betSide.indexOf("DEFAULT") > -1} />
          <label>Player/Banker</label>
        </div>
        <div
          className="ui toggle checkbox"
          onClick={() => toggleBetSide("PLAYER")}
        >
          <input type="checkbox" checked={betSide.indexOf("PLAYER") > -1} />
          <label>Player Only</label>
        </div>
        <div
          className="ui toggle checkbox"
          onClick={() => toggleBetSide("BANKER")}
        >
          <input type="checkbox" checked={betSide.indexOf("BANKER") > -1} />
          <label>Banker Only</label>
        </div>
      </div>

      <Card fluid>
        <Chart
          type="area"
          options={getOption()}
          series={showGraph()}
          height="240"
        />
      </Card>
    </>
  );
}
