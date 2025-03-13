import { settimanale } from "./queries/settimanale.js";
import { giacenzaIniziale } from "./queries/giacenzaIniziale.js";
import { iniziale2 } from "./queries/iniziale2.js";
import { finale } from "./queries/finale.js";
import { finale2 } from "./queries/finale2.js";
import { giacenzaFinale } from "./queries/giacenzaFinale.js";
import { giacenzaInizialeMovSettimanali } from "./queries/giacenzaInizialeMovSettimanali.js";
import { inizialesettimanale2 } from "./queries/inizialesettimanale2.js";

import { odbcService } from "./odbc.service.js";

const temporaryTables = [
  settimanale,
  giacenzaIniziale,
  iniziale2,
  giacenzaInizialeMovSettimanali,
  giacenzaFinale,
  finale,
  inizialesettimanale2,
  finale2,
];

const deleteData = (tableName) => `DELETE FROM ${tableName};`;

async function createTables(conn, startDate, endDate) {
  for (const table of temporaryTables) {
    await odbcService.executeQuery(conn, table.create).catch(async (error) => {
      if (error.odbcErrors[0].message.includes("already exists")) {
        await odbcService.executeQuery(conn, deleteData(table.tableName));
      } else {
        console.error("🚀 executeQuery error:", error.odbcErrors[0]);
      }
    });

    await odbcService
      .executeQuery(conn, table.select(startDate, endDate))
      .then((data) => {
        console.log(`Table ${table.tableName}: ${data}`);
      })
      .catch((error) =>
        console.error(
          "🚀createTables error:",
          error.odbcErrors[0],
          "comando:",
          table.select(startDate, endDate)
        )
      );
  }
  return;
}

async function getReportData(conn) {
  const reportData = await odbcService
    .executeQuery(conn, `SELECT * FROM finale2;`)
    .catch((error) => console.error("🚀 getReportData error:", error))
    .finally(() => {
      console.info("Data retrieved");
      odbcService.closeConnection(conn);
    });

  return reportData.filter((item) => item.CodArticolo);
}

export { createTables, getReportData };
