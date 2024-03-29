const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("request");
const axios = require("axios");
const cheerio = require("cheerio");

async function getCookie(username, password) {
  let role = "";
  return new Promise((resolve, reject) => {
    const formBody = {
      __VIEWSTATE:
        "/wEPDwUKMTgyNDM2Njk1MA9kFgICAw9kFgoCAQ8WAh4JaW5uZXJodG1sZWQCAw8PFgIeBFRleHRlZGQCBw8PZBYCHgpvbmtleXByZXNzBRBfb25FbXBLZXlQcmVzcygpZAILDw8WAh8BZWRkAg8PD2QWAh8CBRRfb25TdHVkZW50S2V5UHJlc3MoKWQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgMFB2ltZ0J0bjEFB2ltZ0J0bjIFB2ltZ0J0bjNAo+6/01UwRZV8mQ5r6LHji7HfOg==",
      __VIEWSTATEGENERATOR: "24A3F8C7",
      __EVENTVALIDATION:
        "/wEWCwLlo6S/CAKM+9rqDwLW44bXBAKz5pu/BAKM+87qDwKFqK2XBgKEovX+AgKM+9LqDwKgkcssAuzRsusGAum41+kIxI7QFDwL/VxmYwCviED6UDxw6Ro=",
      txtId1: username,
      txtPwd1: password,
      txtId2: username,
      txtPwd2: password,
      txtId3: "",
      txtPwd3: "",
    };

    if (username.substring(2, 4) === "u4") {
      //* if student
      formBody["imgBtn2.x"] = "37";
      formBody["imgBtn2.y"] = "16";
      role = "student";
    } else {
      //* if teacher
      formBody["imgBtn1.x"] = "37";
      formBody["imgBtn1.y"] = "16";
      role = "teacher";
    }

    // expire date in indian time

    request.post(
      {
        url: "http://103.138.0.69/ecap/default.aspx",
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          "upgrade-insecure-requests": "1",
          Referer: "http://103.138.0.69/ecap/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        form: formBody,
      },
      function (err, httpResponse, body) {
        if (err) {
          reject(err);
        }
        let cookies = httpResponse.headers["set-cookie"].map((cookie) => {
          return cookie.split(";")[0];
        });
        resolve({
          cookie: cookies.join(";"),
          role,
          expire: new Date().getTime(),
        });
      }
    );
  });
}

function parseTableAsObjects(table, $) {
  let trs = table.find("tr");
  let data = [];
  keys = ["subject", "held", "attend", "percent"];

  let lastRow = trs.last();

  trs
    .slice(1)
    .slice(0, -1)
    .each((_, tr) => {
      let tds = $(tr).find("td");
      let tdData = {};
      tds.slice(1).each((i, td) => {
        if (i > 0) {
          tdData[keys[i]] = +$(td).text();
        } else {
          tdData[keys[i]] = $(td).text();
        }
      });
      data.push(tdData);
    });

  // for Total
  let tdData = {};
  let lastRowTds = lastRow.find("td");
  lastRowTds.each((i, td) => {
    tdData[keys[i]] = $(td).text();
  });

  return {
    data,
    total: tdData,
  };
}

function parseBioTable(table, $) {
  let trs = table.find("tr");
  let data = [];

  let obj = {};
  trs.each((i, tr) => {
    let $tr = $(tr);
    let tds = $tr.find("td");
    let key = $(tds[0]).text().replace(" ", "");
    let value = $(tds[2]).text();
    obj[key] = value;
  });
  return obj;
}

module.exports = {
  getCookie,
  parseTableAsObjects,
  parseBioTable,
};
