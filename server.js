const express = require("express");
const app = express();
const session = require("express-session");
require("dotenv").config();
const axios = require("axios");
const request = require("request");
const fs = require("fs/promises");

// const axiosCookieJarSupport = require("axios-cookiejar-support").wrapper;
// const tough = require("tough-cookie");
// axiosCookieJarSupport(axios);
// const cookieJar = new tough.CookieJar();
// console.log(axiosCookieJarSupport);

const use = require("./utils/use");
const dbConnection = require("./utils/db");

const { getAttendence } = require("./lib/std/attendence");
const { getCookie } = require("./lib/std/utils");
const { getGraph } = require("./lib/std/graph");
use(app);
// dbConnection();

// * Routes
app.use("/auth", require("./routes/auth"));
// let defaultCookie =
//   "ASP.NET_SessionId=k20ejmrea3cvh4450voejz45;frmAuth=58FBB37AAED2793EC68D6B6A11FAA55A3A7860A078153D6B7FE00333F341093DD8669990E2F434D1BD45816095ACB2432D3BE08FE0F8B9C1906FDBCACBEE1AEAA6E6AF08A7D06CFFDD743912DED312348DB1673578A989FC3B77A5C6DFD2D213CBCE46F4CB68E87D6261F0139922F05B661CD31ADB73FF0ECD64CD86B4CFBC6351376CD1";

let defaultCookie =
  "ASP.NET_SessionId=wc5m2gvo3pqqrg55pfg2dhyc;frmAuth=F91ACA404BADA49B3CB65AD2107AACCE872EBD10B18EB29B3F11C0329C6491C80006A4F81982715511A1FB59204B12FE29C083F360FC8CBC04772B9C04FBA9FA4060EFD2D6B65DD0308DADB19B82C60986A55A9D00DE2EE493082F0F84C9432EF34A8DF34D1ABC0C4A2E835C480B6FE0CA8F4768A5DF771E6229A473A89D3C15879B13D36FD1920A4771DD8F7AEE0D45520135A5188DFAE081E1D05F989E2C4BC0BD27C1";
app.post("/login", (req, res) => {
  const { user, password } = req.body;

  console.log("IN: Login ", user, password);

  getCookie(user, password).then((cookie) => {
    console.log(cookie);
    res.json(cookie);
  });
});

app.post("/body", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.post("/date", (req, res) => {
  const {
    cookie = defaultCookie,
    rollNo,
    from,
    to,
    excludeOtherSubjects = true,
  } = req.body;

  getAttendence({
    cookie,
    rollNo,
    from,
    to,
    excludeOtherSubjects,
  }).then((html) => {
    res.json(html);
  });
});

app.post("/graph", (req, res) => {
  const {
    rollNo,
    cookie,
    expire,
    user,
    password,
    excludeOtherSubjects = false,
  } = req.body;
  console.log("graph requested");
  // console.log(req.body);

  let diff = new Date() - new Date(+expire);

  if (diff < 4 * 60 * 60 * 1000) {
    console.log(
      "cookie has valid for hrs : ",
      (diff / 1000 / 60 / 60).toFixed(2)
    );
  } else {
    console.log(
      "Cookie is Expired by hrs: ",
      (diff / 1000 / 60 / 60).toFixed(2)
    );
    getCookie(user, password).then((newCookie) => {
      getGraph({
        cookie: newCookie.cookie,
        rollNo,
        excludeOtherSubjects,
        // from,
        // to
      }).then((data) => {
        console.log("graph response sent");
        return res.json({
          arr: data,
          ...newCookie,
        });
      });
    });
  }
  getGraph({
    cookie,
    rollNo,
    excludeOtherSubjects,
    // from,
    // to
  }).then((data) => {
    console.log("graph response sent");
    res.json({ arr: data });
  });
});
app.post("/attendance", async (req, res) => {
  const {
    cookie = defaultCookie,
    rollNo,
    from,
    to,
    user,
    password,
    excludeOtherSubjects = true,
    expire,
  } = req.body;

  let fromDate = "",
    toDate = "";
  if (from) fromDate = ToIstTime(+from);
  if (to) toDate = ToIstTime(+to);

  console.log("cookie created: ", new Date(+expire));
  console.log("current date: ", new Date());

  let diff = new Date() - new Date(+expire);

  await new Promise((resolve, reject) => setTimeout(resolve, 5000));

  if (diff < 4 * 60 * 60 * 1000) {
    console.log(
      "cookie has valid for hrs : ",
      (diff / 1000 / 60 / 60).toFixed(2)
    );
  } else {
    console.log(
      "Cookie is Expired by hrs: ",
      (diff / 1000 / 60 / 60).toFixed(2)
    );
    getCookie(user, password).then((newCookie) => {
      getAttendence({
        cookie: newCookie.cookie,
        rollNo,
        from: fromDate,
        to: toDate,
        excludeOtherSubjects,
      }).then((html) => {
        return res.json({
          ...html,
          ...newCookie,
        });
      });
    });
  }

  getAttendence({
    cookie,
    rollNo,
    from: fromDate,
    to: toDate,
    excludeOtherSubjects,
  }).then((html) => {
    if (html.total.held == "Password") {
      console.log("Cookie Expired");
      getCookie(user, password).then((newCookie) => {
        console.log(newCookie);
        getAttendence({
          cookie: newCookie.cookie,
          rollNo,
          from: fromDate,
          to: toDate,
          excludeOtherSubjects,
        }).then((html) => {
          return res.json({
            ...html,
            ...newCookie,
          });
        });
      });
    } else {
      return res.json(html);
    }
  });
});

app.get("/test", (req, res) => {
  getCookie("21u41a0546", "18122001")
    .then((cookie) => {
      console.log(cookie);
      res.json(cookie);
    })
    .catch((err) => {
      console.log("error in geting cookie", err);
    });

  // getAttendence({
  //   cookie: defaultCookie,
  //   rollNo: "21u41a0546",
  // }).then(async (html) => {
  //   res.json(html);
  // });

  console.log("requested: test");
  // res.json(temp);
});

function ToIstTime(timestamp) {
  const date = new Date(timestamp);
  const ISTOffset = 330; // 5.5 hours in minutes
  date.setMinutes(date.getMinutes() + ISTOffset);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());

  return `${day}/${month}/${year}`;
}

app.listen(process.env.PORT || 3000);

// 'Fri Mar 08 2024 02:56:22 GMT+0530 (India Standard Time)'
// {
// "cookie": "ASP.NET_SessionId=k20ejmrea3cvh4450voejz45;frmAuth=58FBB37AAED2793EC68D6B6A11FAA55A3A7860A078153D6B7FE00333F341093DD8669990E2F434D1BD45816095ACB2432D3BE08FE0F8B9C1906FDBCACBEE1AEAA6E6AF08A7D06CFFDD743912DED312348DB1673578A989FC3B77A5C6DFD2D213CBCE46F4CB68E87D6261F0139922F05B661CD31ADB73FF0ECD64CD86B4CFBC6351376CD1",
// "role": "teacher"
// }

// end: 4:2
