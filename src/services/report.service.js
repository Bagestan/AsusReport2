import { createTables, getReportData } from "./database.service.js";
import { excelService } from "./excel.service.js";
import { odbcService } from "./odbc.service.js";
import { jsonService } from "./json.service.js";

const newReportPath = `../reportAsus.xlsx`;

function calculateFinalQuantities(report, supTable) {
  // console.log("🚀 ~ calculateFinalQuantities ~ supTable:", supTable);
  // let supTableExample = [
  //   { ean: 4711081610687, quantita: 3 },
  //   { ean: 4718017322775, quantita: 1 },
  // ];

  // let recalcReport = report.map((i) => ({
  //   ...i,
  //   SommaDiQtaScaricata: supTableExample.find((j) => j.ean === i.CodBarre)
  //     ? supTableExample.find((j) => j.ean === i.CodBarre).quantita
  //     : i.SommaDiQtaScaricata,
  // }));

  let recalcReport = report.map((i) => ({
    ...i,
    SommaDiQtaCaricata: i.SommaDiQtaCaricata || 0,
    SommaDiQtaScaricata: i.SommaDiQtaScaricata || 0,
    finaleEspr1: i.Espr1 + i.SommaDiQtaCaricata - i.SommaDiQtaScaricata,
  }));

  return recalcReport;
}

// function calculateFinalQuantities(report, supTable) {
//   const lookup = Object.fromEntries(supTable.map(({ ean, quantita }) => [ean, quantita]));

//   return report.map((i) => {
//     const qtaScaricata = lookup[i.CodArticolo] || i.SommaDiQtaScaricata || 0;
//     return {
//       ...i,
//       SommaDiQtaCaricata: i.SommaDiQtaCaricata || 0,
//       SommaDiQtaScaricata: qtaScaricata,
//       finaleEspr1: i.Espr1 + (i.SommaDiQtaCaricata || 0) - qtaScaricata,
//     };
//   });
// }

function unifyData(arr) {
  console.log("🚀 ~ arr:", arr);
  const uniqueItems = new Map();

  arr.forEach((item) => {
    if (!uniqueItems.has(item.CodArticolo)) {
      uniqueItems.set(item.CodArticolo, { ...item });
    } else {
      const existing = uniqueItems.get(item.CodArticolo);

      existing.SommaDiQtaCaricata =
        (existing.SommaDiQtaCaricata || 0) + (item.SommaDiQtaCaricata || 0);
      existing.SommaDiQtaScaricata =
        (existing.SommaDiQtaScaricata || 0) + (item.SommaDiQtaScaricata || 0);
    }
  });

  const result = Array.from(uniqueItems.values());

  console.log("🚀 ~ result:", result);
  return result;
}

function mapReportColumns(reportData) {
  const header = [
    "MODEL",
    "INITIAL_INVENTORY",
    "NEW_COMING",
    "SELLOUT",
    "FINAL_INVENTORY",
    "NEW_ORDER_QTY",
    "REMARKS",
    "DESCRIPTION",
    "TRANST",
    "TRANSIT_QTY",
    "CONSIGN_QTY",
    "OTHER_NEW_COMING",
    "OTHER_STOCK_OUT",
    "PART_NO",
    "INVOICE",
    "EAN_CODE",
    "UPC_CODE",
    "MFGPartNo",
    "MFGModelName",
    "CUSTOMER_SKU",
    "WAREHOUSE_NAME",
    "WAREHOUSE_CODE",
    "SO_BACKLOG",
    "SO_PROCESSING",
  ];

  const columnMap = {
    CUSTOMER_SKU: "CodArticolo",
    DESCRIPTION: "PrimoDiDesc",
    INITIAL_INVENTORY: "Espr1",
    FINAL_INVENTORY: "finaleEspr1",
    MODEL: "CodBarre",
    PART_NO: "CodArticoloForn",
    SELLOUT: "SommaDiQtaScaricata",
    NEW_COMING: "SommaDiQtaCaricata",
  };

  return reportData.map((item) => {
    const mappedItem = {};

    header.forEach((headerItem) => {
      const dataKey = columnMap[headerItem] || headerItem;
      mappedItem[headerItem] = item[dataKey] || "";
    });

    return mappedItem;
  });
}

async function generateReport(reportData) {
  const schema = [
    { value: (o) => o.MODEL ?? "", type: String },
    { value: (o) => o.INITIAL_INVENTORY ?? 0, type: Number },
    { value: (o) => o.NEW_COMING ?? 0, type: Number },
    { value: (o) => o.SELLOUT ?? 0, type: Number },
    { value: (o) => o.FINAL_INVENTORY ?? 0, type: Number },
    { value: (o) => o.NEW_ORDER_QTY ?? "", type: String },
    { value: (o) => o.REMARKS ?? "", type: String },
    { value: (o) => o.DESCRIPTION ?? "", type: String },
    { value: (o) => o.TRANST ?? "", type: String },
    { value: (o) => o.TRANSIT_QTY ?? "", type: String },
    { value: (o) => o.CONSIGN_QTY ?? "", type: String },
    { value: (o) => o.OTHER_NEW_COMING ?? "", type: String },
    { value: (o) => o.OTHER_STOCK_OUT ?? "", type: String },
    { value: (o) => o.PART_NO ?? "", type: String },
    { value: (o) => o.INVOICE ?? "", type: String },
    { value: (o) => o.EAN_CODE ?? "", type: String },
    { value: (o) => o.UPC_CODE ?? "", type: String },
    { value: (o) => o.MFGPartNo ?? "", type: String },
    { value: (o) => o.MFGModelName ?? "", type: String },
    { value: (o) => o.CUSTOMER_SKU ?? "", type: String },
    { value: (o) => o.WAREHOUSE_NAME ?? "", type: String },
    { value: (o) => o.WAREHOUSE_CODE ?? "", type: String },
    { value: (o) => o.SO_BACKLOG ?? "", type: String },
    { value: (o) => o.SO_PROCESSING ?? "", type: String },
  ];

  return await excelService
    .write(reportData, { schema, filePath: newReportPath })
    .then(() => newReportPath)
    .catch((error) => console.error("🚀 generateReport:", error))
    .finally(() => console.info("🚀 Report è fatto"));
}

class ReportService {
  async handleReport(queryParams) {
    const conn = await odbcService.openConnection(queryParams.ODBC);

    await createTables(conn, queryParams.dataIniziale, queryParams.dataFinale);

    const supTable = jsonService.getSupTable();

    // get the data of the week to write in the report
    let reportData = await getReportData(conn);

    reportData = unifyData(reportData);

    reportData = calculateFinalQuantities(reportData, supTable);

    // map report data to the report model
    const mappedReportData = mapReportColumns(reportData);

    if (mappedReportData.length === 0) {
      console.log(`
          🚀 REPORT EMPTY
        `);
      return { ok: true, message: "message" };
    }

    // write the data in the report
    return await generateReport(mappedReportData);
  }
}

export const reportService = new ReportService();
