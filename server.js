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

const { getCookie, getAttendence } = require("./lib/std/attendence");

use(app);
// dbConnection();

// * Routes
app.use("/auth", require("./routes/auth"));
// let defaultCookie =
//   "ASP.NET_SessionId=k20ejmrea3cvh4450voejz45;frmAuth=58FBB37AAED2793EC68D6B6A11FAA55A3A7860A078153D6B7FE00333F341093DD8669990E2F434D1BD45816095ACB2432D3BE08FE0F8B9C1906FDBCACBEE1AEAA6E6AF08A7D06CFFDD743912DED312348DB1673578A989FC3B77A5C6DFD2D213CBCE46F4CB68E87D6261F0139922F05B661CD31ADB73FF0ECD64CD86B4CFBC6351376CD1";

let defaultCookie =
  "ASP.NET_SessionId=qfwy52yjnd1xfh45bfdyqsbq;frmAuth=AA6384AC71653B91BF1BDC7B1652C0E066A7247AEE7873EA8089FD9DBE1054F31922FB3BDE037382ACE05523F3E130657F1CF1016097E04186BA37DCAA0BD04BD092C634C295AE18A159C5EF9ECE1E1C31F2DE76B3CD7D0937F4AC9AFBAEF26736CF18B9DBD8780D69F80827245D53606DA642431F0940CE2CCD72BB48DCA42088579BDE902BEFE07A2CCA8DA2AC0A3B3AADDD9640446CF4E426F9C4F198B617F77CF7E7";
app.get("/login", (req, res) => {
  const { user, password } = req.body;

  getCookie(user, password).then((cookie) => {
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

  console.log(cookie, fromDate, toDate, rollNo);

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

app.post("/attendance", (req, res) => {
  const {
    cookie = defaultCookie,
    rollNo,
    from,
    to,
    excludeOtherSubjects = true,
  } = req.body;

  let fromDate = null,
    toDate = null;
  let dateFormat = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  if (from) {
    fromDate = new Date(+from);
    fromDate = fromDate.toLocaleDateString("en-US", dateFormat).toString();
  }
  if (to) {
    toDate = new Date(+to);
    toDate = toDate.toLocaleDateString("en-US", dateFormat).toString();
  }

  console.log(cookie, fromDate, toDate, rollNo);

  getAttendence({
    cookie,
    rollNo,
    from: fromDate,
    to: toDate,
    excludeOtherSubjects,
  }).then((html) => {
    res.json(html);
  });
});

const temp = {
  data: [
    { subject: "ML", held: 48, attend: 42, percent: 87.5 },
    { subject: "CD", held: 22, attend: 20, percent: 90.91 },
    { subject: "CNS", held: 46, attend: 38, percent: 82.61 },
    { subject: "OOAD", held: 34, attend: 32, percent: 94.12 },
    { subject: "DLD", held: 31, attend: 27, percent: 87.1 },
    { subject: "ML Lab", held: 24, attend: 22, percent: 91.67 },
    { subject: "CD Lab", held: 24, attend: 18, percent: 75 },
    { subject: "CNS Lab", held: 19, attend: 14, percent: 73.68 },
    { subject: "SO Lab", held: 18, attend: 15, percent: 83.33 },
    { subject: "SPORTS", held: 6, attend: 6, percent: 100 },
    { subject: "CRT", held: 102, attend: 83, percent: 81.37 },
    { subject: "ES", held: 6, attend: 5, percent: 83.33 },
  ],
  total: { subject: "TOTAL", held: "380", attend: "322", percent: "84.74" },
  bio: {
    RollNo: "21u41a0507",
    StudentName: "DODDI BHASKAR",
    Course: "B.Tech",
    Branch: "CSE",
    Semester: "VI Semester",
  },
};
app.get("/test", (req, res) => {
  // getCookie("21u41a0546", "18122001").then((cookie) => {
  //   res.json(cookie);
  // });

  getAttendence({
    cookie: defaultCookie,
    rollNo: "21u41a0546",
  }).then(async (html) => {
    res.json(html);
  });

  console.log("requested: test");
  // res.json(temp);
});

app.listen(process.env.PORT || 3000);

// 'Fri Mar 08 2024 02:56:22 GMT+0530 (India Standard Time)'
// {
// "cookie": "ASP.NET_SessionId=k20ejmrea3cvh4450voejz45;frmAuth=58FBB37AAED2793EC68D6B6A11FAA55A3A7860A078153D6B7FE00333F341093DD8669990E2F434D1BD45816095ACB2432D3BE08FE0F8B9C1906FDBCACBEE1AEAA6E6AF08A7D06CFFDD743912DED312348DB1673578A989FC3B77A5C6DFD2D213CBCE46F4CB68E87D6261F0139922F05B661CD31ADB73FF0ECD64CD86B4CFBC6351376CD1",
// "role": "teacher"
// }

// end: 4:2
