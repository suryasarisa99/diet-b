const cheerio = require("cheerio");
const fs = require("fs/promises");

async function run() {
  // const data = await fs.readFile("table.html", { encoding: "utf-8" });
  // let $ = cheerio.load(data);
  // let table = $("tr:eq(2) td table");
  // console.log(table.toString());
  let text = `\\ \\ \\`;
  console.log(text);
  let cleaned = text.replace(/\\/g, "x");
  console.log(cleaned);
}

run();
