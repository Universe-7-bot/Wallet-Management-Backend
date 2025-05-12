const Transaction = require("../models/Transaction");
const moment = require("moment");

const getBalanceTrend = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: "completed",
    }).sort({ date: 1 });

    // let weeklyTrend = [];
    // let balance = 0;
    // let weekMap = new Map();

    // transactions.forEach((tx) => {
    //   //   const week = moment(tx.date).startOf("isoWeek").format("YYYY-[W]WW");
    //   const startOfYear = moment().startOf("year");
    //   const week = "Week " + moment(tx.date).diff(startOfYear, "weeks") + 1;

    //   const amount = tx.type === "request" && tx.status === "completed" && tx.sender.toString() === userId.toString() ? tx.amount : tx.sender.toString() === userId.toString() ? -tx.amount : tx.amount;

    //   if (!weekMap.has(week)) {
    //     weekMap.set(week, balance); // capture starting balance for the week
    //   }

    //   balance += amount;
    //   weekMap.set(week, balance); // update week's balance
    // });

    // weeklyTrend = Array.from(weekMap.entries()).map(([week, amount]) => ({
    //   name: week,
    //   amount,
    // }));

    const startOfMonth = moment().startOf("month");
    const weeks = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = moment(startOfMonth).add(i * 7, "days");
      const weekEnd = moment(startOfMonth)
        .add((i + 1) * 7 - 1, "days")
        .endOf("day");

      // If the week spills into the next month, cap the end to end of current month
      const endOfMonth = moment(startOfMonth).endOf("month");
      const safeEnd = weekEnd.isAfter(endOfMonth) ? endOfMonth : weekEnd;

      weeks.push({
        name: `Week ${i + 1}`,
        start: weekStart,
        end: safeEnd,
        amount: 0,
      });
    }

    // Aggregate transaction data into corresponding weeks
    transactions.forEach((tx) => {
      const txDate = moment(tx.date);

      for (let i = 0; i < weeks.length; i++) {
        if (txDate.isBetween(weeks[i].start, weeks[i].end, null, "[]")) {
          if (
            tx.type === "request" &&
            tx.sender.toString() === userId.toString()
          ) {
            weeks[i].amount += tx.amount;
          } else {
            weeks[i].amount +=
              tx.recipient.toString() === userId.toString()
                ? tx.amount
                : -tx.amount;
          }
          break;
        }
      }
    });

    // Final data to send
    const weeklyTrend = weeks.map((w) => ({ name: w.name, amount: w.amount }));
    res.json(weeklyTrend);
  } catch (err) {
    console.error("Error fetching balance trend:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMonthlyActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const startOfYear = moment().startOf("year");
    const endOfYear = moment().endOf("year");

    const allTx = await Transaction.find({
      $or: [{ sender: userId }, { recipient: userId }],
      createdAt: { $gte: startOfYear.toDate(), $lte: endOfYear.toDate() },
      status: "completed",
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: moment().month(i).format("MMM"),
      sent: 0,
      received: 0,
    }));

    allTx.forEach((tx) => {
      const monthIndex = moment(tx.createdAt).month();
      const isRequest = tx.type === "request";

      // If request and logged-in user is sender => user received the money
      if (isRequest && tx.sender.toString() === userId.toString()) {
        monthlyData[monthIndex].received += tx.amount;
      } else if (tx.sender.toString() === userId.toString()) {
        monthlyData[monthIndex].sent += tx.amount;
      } else if (tx.recipient.toString() === userId.toString()) {
        monthlyData[monthIndex].received += tx.amount;
      }
    });

    res.json(monthlyData);
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getBalanceTrend, getMonthlyActivity };
