import express from "express";
import path from "node:path";
import multer from "multer";

import { fileURLToPath } from "url";
import { odbcService } from "./services/odbc.service.js";
import { reportService } from "./services/report.service.js";
import { excelService } from "./services/excel.service.js";
import { jsonService } from "./services/json.service.js";

// const multer = require("multer");
const upload = multer();

const app = express();
const port = 80;
app.use(express.json());

app.get("/", async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const _retfile = path.join(__dirname, "index.html");
  res.sendFile(_retfile);
});

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
    res.download(path, "report-asus.xlsx");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { app, port };
