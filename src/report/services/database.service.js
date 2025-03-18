import { settimanale } from "./report-queries/settimanale.js";
import { giacenzaIniziale } from "./report-queries/giacenzaIniziale.js";
import { iniziale2 } from "./report-queries/iniziale2.js";
import { finale } from "./report-queries/finale.js";
import { finale2 } from "./report-queries/finale2.js";
import { giacenzaFinale } from "./report-queries/giacenzaFinale.js";
import { giacenzaInizialeMovSettimanali } from "./report-queries/giacenzaInizialeMovSettimanali.js";
import { inizialesettimanale2 } from "./report-queries/inizialesettimanale2.js";
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
      .then((data) => console.log(`Table ${table.tableName}: ${data}`))
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

async function getReportData(conn, queryParams) {
  let reportData = await odbcService
    .executeQuery(conn, `SELECT * FROM finale2;`)
    .catch((error) => console.error("🚀 getReportData error:", error))
    .finally(() => {
      console.info("Data retrieved");
      odbcService.closeConnection(conn);
    });

  // Mapeia os produtos e aguarda as atualizações necessárias
  await Promise.all(
    reportData.map(async (product) => {
      if (!product.CodBarre) {
        console.log(product);
        const conn = await odbcService.openConnection(queryParams.ODBC);
        try {
          const data = await odbcService.executeQuery(
            conn,
            `SELECT CodArticolo, CodBarre, DescHtml, CodArticoloForn 
             FROM TArticoli 
             WHERE CodArticolo = '${product.CodArticolo}'`
          );

          if (data.length > 0) {
            product.CodBarre = data[0].CodBarre;
            product.DescHtml = data[0].DescHtml;
            product.CodArticoloForn = data[0].CodArticoloForn;
            console.log("🚀 ~ product atualizado:", product);
          }
        } catch (error) {
          console.error("🚀 getReportData error:", error);
        } finally {
          odbcService.closeConnection(conn);
        }
      }
    })
  );

  return reportData.filter((item) => item.CodArticolo);
}

export { createTables, getReportData };
