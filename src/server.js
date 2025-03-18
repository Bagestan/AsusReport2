import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import path from "path";

import { odbcService } from "./report/services/odbc.service.js";
import { reportService } from "./report/services/report.service.js";
import { excelService } from "./report/services/excel.service.js";
import { jsonService } from "./report/services/json.service.js";
import promoSellMain from "./promoSell/promoSell.js";

const upload = multer();
const app = express();
const port = 80;
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/", (req, res) => {
  res.redirect("/report");
});

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/report", async (req, res) => {
  const _retfile = path.join(__dirname, "./report/report.html");
  res.sendFile(_retfile);
});

app.get("/promoSell", async (req, res) => {
  const _retfile = path.join(__dirname, "./promoSell/promoSell.html");
  res.sendFile(_retfile);
});

app.post("/updatePromoSell", upload.single("excelInput"), async (req, res) => {
  const dsn = req.body.dsnInput;
  const excelFile = req.file;

  promoSellMain(dsn, excelFile)
    .then((result) => {
      res.json({ result, message: "Dados recebidos com sucesso" });
    })
    .catch((err) => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send(err);
      }
    });
});

// @ts-ignore
app.get("/dsns", async (req, res) => {
  const DSNList = await odbcService.getODBCDataSources();
  if (DSNList.length === 0)
    return res.status(404).send("No ODBC Data Sources found.");
  res.json(DSNList);
});

app.post("/setSupTable", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const data = await excelService.read(file.buffer);
    const dataSup = excelService.convertToObjects(data);
    jsonService.setSupTable(dataSup);

    res.status(200).send(dataSup);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getSupTable", async (req, res) => {
  try {
    const data = jsonService.getSupTable();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/report", async (req, res) => {
  try {
    const path = await reportService.handleReport(req.body);
    if (!path || typeof path !== "string") {
      throw new Error("Invalid report path");
    }

    res.download(path, "report-asus.xlsx");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { app, port };
