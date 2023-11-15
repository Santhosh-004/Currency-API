const axios = require("axios");
const cheerio = require("cheerio");
const apicache = require("apicache");
const express = require("express");

const link = "https://www.x-rates.com/table/?from=USD&amount=1";

async function fetchData(link) {
  try {
    const keys = ["id", "Currency", "DRate", "NRate"];
    let idx = 0;
    let feed = [];
    const result = await axios.get(link);
    const final = await result.data;
    //console.log(final);
    const $ = cheerio.load(final);
    $("table.tablesorter>tbody>tr").each((index, element) => {
      let obj = {};
      obj["id"] = ++idx;
      $(element)
        .children()
        .each((childIndex, childElement) => {
          obj[keys[childIndex + 1]] = $(childElement).text();
        });

      feed.push(obj);
    });
    return feed;
  } catch (error) {
    console.log(error);
  }
}

const app = express();
let cache = apicache.middleware;
app.use(cache("1 day"));

app.get("/", (req, res) => {
  try {
    return res.status(200).json({
      message: "server is running; use /api/currency to get data",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/currency", async (req, res) => {
  try {
    //const start = performance.now();
    let result = await fetchData(link);
    //const end = performance.now();
    return res.status(200).json({
      message: "data fetched successfully",
      success: true,
      //time: `${end - start} ms`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server is running on port 3000");
});
