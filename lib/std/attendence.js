const request = require("request");
const axios = require("axios");
const cheerio = require("cheerio");

const { parseBioTable, parseTableAsObjects } = require("./utils");

async function getAttendence({
  cookie,
  rollNo,
  from = "",
  to = "",
  excludeOtherSubjects = true,
}) {
  otherSubjects = ["ENG", "MST", "MSD"];
  let body = `rollNo=${rollNo}\r\nfromDate=${from}\r\ntoDate=${to}\r\nexcludeothersubjects=${excludeOtherSubjects}`;

  console.log("body: ", body);
  return new Promise((resolve, reject) => {
    axios
      .post(
        "http://103.138.0.69/ECAP/ajax/StudentAttendance,App_Web_h1yiqvjw.ashx?_method=ShowAttendance&_session=no",
        body,
        {
          headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            Connection: "keep-alive",
            "Content-Type": "text/plain;charset=UTF-8",
            Cookie: cookie,
            Origin: "http://103.138.0.69",
            Referer:
              "http://103.138.0.69/ecap/Academics/StudentAttendance.aspx?scrid=3&showtype=SA",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
          },
          // body: `rollNo=${rollNo}\r\nfromDate=${from}\r\ntoDate=${to}\r\nexcludeothersubjects=${excludeOtherSubjects}`,
        }
      )
      .then((res) => {
        let cleaned = res.data.replace(/\\\'/g, "");
        // resolve(cleaned);
        const $ = cheerio.load(cleaned);

        let bioTable = $("table").eq(2);
        let table = $("table").eq(3);
        let { total, data } = parseTableAsObjects(table, $);
        let bio = parseBioTable(bioTable, $);

        if (excludeOtherSubjects)
          data = data.filter((d) => {
            return d.held != 0;
          });

        resolve({
          data,
          total,
          bio,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  getAttendence,
};
