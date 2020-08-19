import axios from "axios";
import moment from "moment"
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "semantic-ui-react";
import _ from "lodash";
import { socket } from "../utils/socket";
import { BOT_TRANSACTION_URL } from "../constants";

export default function BotGrapj() {
  const [betSide, setBetSide] = useState(["DEFAULT"]);
  const [defaultGraph, setDefaultGraph] = useState({
    meta: [],
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
  const [bankerGraph, setBankerGraph] = useState({
    meta: [],
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
  const [playerGraph, setPlayerGraph] = useState({
    meta: [],
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

  useEffect(() => {
    getBotTransaction();
    subscribeBot();
  }, []);

  function subscribeBot() {
    const room = "all";
    socket.on(room, (data) => {
      getBotTransaction();
    });
  }

  async function getBotTransaction() {
    try {
      const [
        {
          data: { data: transactionPB },
        },
        {
          data: { data: transactionB },
        },
        {
          data: { data: transactionP },
        },
      ] = await Promise.all([
        axios.get(`${BOT_TRANSACTION_URL}?type=DEFAULT`),
        axios.get(`${BOT_TRANSACTION_URL}?type=BANKER`),
        axios.get(`${BOT_TRANSACTION_URL}?type=PLAYER`),
      ]);
      const formatDataPB = formDataPB(transactionPB);
      const formatDataB = formatData(transactionB, "BANKER");
      const formatDataP = formatData(transactionP, "PLAYER");
      setDefaultGraph({
        multi: formatDataPB.multiGraph,
        single: formatDataPB.singleGraph,
        meta: formatDataPB.meta,
      });
      setBankerGraph({
        multi: formatDataB.multiGraph,
        single: formatDataB.singleGraph,
        meta: formatDataB.meta,
      });
      setPlayerGraph({
        multi: formatDataP.multiGraph,
        single: formatDataP.singleGraph,
        meta: formatDataP.meta,
      });
    } catch (error) {
      console.log("error while call getBotTransaction()", error);
    }
  }

  function getOption() {
    const defaultOption = {
      chart: {
        toolbar: false,
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
      },
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
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const seriesNames = w.globals.seriesNames;
          let betSideKey = seriesNames[seriesIndex];
          // console.log(betSideKey)
          let graphName = ""
          let betSideMeta = [];
          switch (betSideKey) {
            case "PLAYER Only":
              graphName = "Player Only"
              betSideMeta = playerGraph.meta;
              break;
            case "BANKER Only":
              graphName = "Banker Only"
              betSideMeta = bankerGraph.meta;
              break;
            default:
              graphName = "Player/Banker"
              betSideMeta = defaultGraph.meta;
          }
          const date = moment(betSideMeta[dataPointIndex]?.createdAt ?? new Date()).format("HH:mm:ss")
          const room = betSideMeta[dataPointIndex]?.table_title ?? ""
          const game = `${betSideMeta[dataPointIndex]?.shoe ?? ""}-${betSideMeta[dataPointIndex]?.round ?? ""}`
          const bet = betSideMeta[dataPointIndex]?.bet === "PLAYER" ? "Player" : "Banker" ?? ""

          return `<div class="graph-tooltip">
          <div class="title">กราฟ:</div><div class="title">${graphName}
          </div>
          <div>เวลา:</div><div>${date}
          </div>
          <div>ห้องที่:</div><div>${room}
          </div>
          <div>โต๊ะ:</div><div>${game}
          </div>
          <div>แทง:</div><div class="txt-${bet}">${bet}
          </div>
          </div>`;
        },
        x: {
          show: false,
        },
      },
    };
    if (betSide.length === 1) {
      return {
        ...defaultOption,
        stroke: {
          curve: "smooth",
          width: 1.5,
          colors: ["#fa3f68", "#52ffd7"],
        },
        colors: ["#bb2e59", "#00b5ad"],
        fill: {
          type: "gradient",
          gradient: {
            type: "vertical",
            shadeIntensity: 0,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
          },
        },
      };
    } else {
      return {
        ...defaultOption,
        stroke: {
          colors: ["#52ffd7", "#de1245", "#1226db"],
          curve: "smooth",
          width: 1.5,
        },
        colors: ["#00b5ad", "#de1245", "#1226db"],
        fill: {
          type: "gradient",
          gradient: {
            type: "vertical",
            shadeIntensity: 0,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: true,
            opacityFrom: 0.6,
            opacityTo: 0.6,
            stops: [0, 50, 100],
            colorStops: [],
          },
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

  function formDataPB(data) {
    let newData = _.sortBy(data, ["id"], ["ASC"]);
    let multiGraph = [
      {
        name: "PLAYER/BANKER",
        data: [],
      },
    ];

    let singleGraph = [
      {
        name: "PLAYER/BANKER",
        data: [],
      },
      {
        name: "PLAYER/BANKER",
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
    return {
      meta: newData,
      singleGraph,
      multiGraph,
    };
  }

  function formatData(data, side) {
    let newData = _.sortBy(data, ["id"], ["ASC"]);
    newData.shift();
    let multiGraph = [
      {
        name: `${side} Only`,
        data: [],
      },
    ];

    let singleGraph = [
      {
        name: `${side} Only`,
        data: [],
      },
      {
        name: `${side} Only`,
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
    return {
      meta: newData,
      singleGraph,
      multiGraph,
    };
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
          height="280"
        />
      </Card>
    </>
  );
}
