const { getAttendence } = require("./attendence");
const { getCookie } = require("./utils");

function ToIstTime(timestamp) {
  const date = new Date(timestamp);
  const ISTOffset = 330; // 5.5 hours in minutes
  date.setMinutes(date.getMinutes() + ISTOffset);
  return date;
}

function FormatDate(date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
}

async function getGraph({ cookie, rollNo, excludeOtherSubjects }) {
  const groupDays = 5;
  const fromMonths = 2;

  let lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - fromMonths);
  lastMonth.setDate(1);
  lastMonth.setHours(0, 0, 0, 0);

  lastMonth = ToIstTime(lastMonth.getTime());
  console.log(lastMonth);
  //   lastMonth.setMinutes(lastMonth.getMinutes() - lastMonth.getTimezoneOffset());
  const today = new Date();

  //* Creating a range of dates
  let dates = [];
  let currentDate = lastMonth;
  while (currentDate < today) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + groupDays);
  }
  console.log(dates);

  // * Getting Attendence
  let attendencePromises = dates.map((date) => {
    let toDate = new Date(date);
    toDate.setDate(toDate.getDate() + groupDays - 1);
    toDate = FormatDate(toDate);
    console.log(`from: ${FormatDate(date)} || to: ${toDate}`);

    return getAttendence({
      from: FormatDate(date),
      to: toDate,
      rollNo,
      cookie,
      excludeOtherSubjects,
    });
  });
  let attendence = await Promise.all(attendencePromises);

  // * Maping Data
  return attendence.map((item, i) => {
    return {
      data: item.data,
      total: item.total,
      week: dates[i],
    };
  });
}

module.exports = {
  getGraph,
};
