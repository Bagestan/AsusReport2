import odbc from "odbc";
import readXlsxFile from "read-excel-file/node";

const connectionConfig = (dsn) => {
  return { connectionString: `DSN=${dsn}` };
};

const closeConnection = (conn) => conn.close();

//
// MAIN
export default async function promoSellMain(DSN, EXCEL) {
  console.log("🚀 ~ DSN:", DSN);

  const conn = await odbc.connect(connectionConfig(DSN)).catch((error) => {
    console.error("Erro ao conectar no banco de dados:", error);
    throw error;
  });

  let asusData = await readExcel(EXCEL).catch((error) => {
    console.error("Erro ao ler o arquivo de Excel:", error);
    throw error;
  });

  asusData = formatStringNumbers(asusData);

  await clearPreviousPromo(conn).catch((error) => {
    console.error("Erro ao limpar promo anterior:", error);
    throw error;
  });

  const DaneaProducts = await findAsusArticles(conn, asusData).catch(
    (error) => {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  );

  await updateAsusData(conn, DaneaProducts, asusData).finally(() =>
    closeConnection(conn)
  );

  const updatedProducts = asusData.map((item) => item.CodArticolo);

  let result = [];

  for (const CodArticolo of updatedProducts) {
    console.log("🚀 ~ CodArticolo:", CodArticolo);
    if (!CodArticolo) continue;
    if (CodArticolo == "EAN") continue;

    const query = `
    SELECT 
      CodBarre,
      CodArticoloForn,
      CodArticolo,
      DATE_START,
      DATE_END,
      PrezzoNettoForn,
      Extra2,
      Extra4,
      PrezzoIvato1,
      PrezzoIvato4,
      Extra3,
    FROM TArticoli 
    WHERE
      CodArticolo = ${CodArticolo}
      `;

    const data = await executeQuery(conn, query).catch((error) => {
      console.log("query", query);
      console.error("🚀 ~ executeQuery error:", error);
    });

    console.log("🚀 ~ data:", data);
    result.push(...data);
  }
}

async function executeQuery(connection, query) {
  const result = await connection.query(query);
  return result;
}

async function readExcel(excel) {
  function excelRowsNormalizer(rows) {
    const columnNames = [
      "CodBarre",
      "CodArticoloForn",
      "CodArticolo",
      "DATE_START",
      "DATE_END",
      "PrezzoNettoForn",
      "Extra2",
      "Extra4",
      "PrezzoIvato1",
      "PrezzoIvato4",
      "Extra3",
    ];

    const normalizedData = rows.map((row) =>
      columnNames.reduce((acc, key, index) => {
        acc[key] = row[index];
        return acc;
      }, {})
    );

    return normalizedData;
  }
  const rows = await readXlsxFile(excel.buffer);
  return await excelRowsNormalizer(rows);
}

async function clearPreviousPromo(connection) {
  const previousPromo = await getPreviousPromo(connection);

  previousPromo.forEach(
    async (product) => await clearProduct(connection, product)
  );
}

async function getPreviousPromo(connection) {
  const selExpiredPromo = `
  SELECT 
    TArticoli.IDArticolo,
    TArticoli.CodArticolo,
    TArticoli.Desc,
    TArticoli.CodBarre,
    TArticoli.Extra1,
    TArticoli.Extra2,
    TArticoli.Extra3,
    TArticoli.Extra4,
    TArticoliMagazz.QtaCaricata,
    TArticoliMagazz.QtaScaricata
  FROM 
    TArticoli 
  INNER JOIN 
    TArticoliMagazz 
  ON 
    TArticoli.IDArticolo = TArticoliMagazz.IDArticolo
  WHERE 
    TArticoli.Extra1 IS NOT NULL
  GROUP BY
    TArticoli.IDArticolo,
    TArticoli.CodArticolo,
    TArticoli.Desc,
    TArticoli.CodBarre,
    TArticoli.Extra1,
    TArticoli.Extra2,
    TArticoli.Extra3,
    TArticoli.Extra4,
    TArticoliMagazz.QtaCaricata,
    TArticoliMagazz.QtaScaricata;
    `;

  let result = await executeQuery(connection, selExpiredPromo);
  return result.map((i) => ({ ...i, QTA: i.QtaCaricata - i.QtaScaricata }));
}

async function clearProduct(connection, product) {
  if (product.Extra1.includes("scaduto")) return;

  const clearAll = `
    PrezzoIvato4 = 0,
    PrezzoNetto4 = 0,
    Extra2 = '',
    Extra4 = '',`;

  const updatePreviousPromo = `
  UPDATE 
    TArticoli 
  SET 
    ${product.QTA <= 0 ? clearAll : ""}
    Extra1 = '${product.Extra1} scaduto'
  WHERE 
    IDArticolo = ${product.IDArticolo};
  `;
  await executeQuery(connection, updatePreviousPromo);
}

async function findAsusArticles(connection, asusData) {
  console.info("Searching for articles...");

  let result = [];

  for (const row of asusData) {
    const query = await findArticleByEanCode(connection, row.CodArticolo);
    if (query) result.push(query);
  }

  const missingArticles = asusData.filter((article) => {
    // have to search what article in articles are not in result
    return !result.find((query) => {
      return query.CodArticolo === article.CodArticolo;
    });
  });

  if (missingArticles.length > 0) {
    for (const article of missingArticles) {
      const query = await findArticleByModelName(connection, article.CodBarre);
      if (query) result.push(query);
      else console.info("❌ CodBarre:", article.CodBarre);
    }
  }

  return result;
}

async function findArticleByEanCode(connection, CodArticolo) {
  let fields = "IDArticolo, CodArticolo, Desc, CodBarre, CodIva, PrezzoNetto1";

  const command = `SELECT ${fields} FROM TArticoli WHERE CodArticolo = '${CodArticolo}';`;
  let result = await executeQuery(connection, command);

  return result.filter((item) => item.CodArticolo)[0];
}

async function findArticleByModelName(connection, Desc) {
  let fields =
    "IDArticolo, CodArticolo, Desc, CodBarre, Tipologia, CodIva, PrezzoNetto1";

  const command = `SELECT ${fields} FROM TArticoli WHERE Desc LIKE '%${Desc}%';`;
  let result = await executeQuery(connection, command);

  return result.filter((item) => item.CodArticolo)[0] || null;
}

async function updateAsusData(connection, DaneaProducts, asusData) {
  const asusMap = new Map(
    asusData.map((item) => [String(item.CodArticolo).trim(), item])
  );

  for (const article of DaneaProducts) {
    const asusInfo = asusMap.get(article.CodArticolo);

    const data = await executeQuery(
      connection,
      `SELECT IDArticolo FROM TArticoli WHERE CodArticolo = '${article.CodArticolo}';`
    );
    const IDArticolo = data[0].IDArticolo;

    if (!asusInfo) continue;
    const commandUpdate = `UPDATE TArticoli 
    SET 
      IDArticolo = ${IDArticolo},
      CodArticoloForn = '${asusInfo.CodArticoloForn}', 
      Extra1 = '${getExtra1(asusInfo.DATE_START, asusInfo.DATE_END)}',
      Extra2 = '€ ${formatValue(asusInfo.Extra2)}',
      Extra3 = '${asusInfo.Extra3 ? asusInfo.Extra3 : ""}',
      Extra4 = '€ ${formatValue(asusInfo.Extra4)}',
      PrezzoIvato1 = ${asusInfo.PrezzoIvato1},
      PrezzoIvato4 = ${asusInfo.PrezzoIvato4},
      PrezzoNetto1 = ${formatValue(removeIVA(asusInfo.PrezzoIvato1))},
      PrezzoNetto4 = ${formatValue(removeIVA(asusInfo.PrezzoIvato4))},
      PrezzoNettoForn = ${asusInfo.PrezzoNettoForn},
      CodIva = 22
    WHERE 
      CodArticolo = '${article.CodArticolo}';`;

    try {
      await executeQuery(connection, commandUpdate).then(() => {
        console.info(" ✅ Update Articolo:", article.CodArticolo);
      });
    } catch (err) {
      console.log(
        `
          🚀 commandUpdate WITH ERROR`,
        commandUpdate
      );
      console.error(`Error!!!`, err);
    }
  }
}

function getExtra1(DATE_START, DATE_END) {
  const today = new Date();

  const extra1 = `${formatDate(DATE_START)} > ${formatDate(DATE_END)} ${
    DATE_END < today ? "scaduto" : ""
  }`;

  console.log("🚀 ~ getExtra1 ~ extra1:", extra1);

  return extra1;
}

const formatDate = (date) => {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };
  // @ts-ignored
  return new Date(date).toLocaleDateString("it-IT", options);
};

const formatValue = (value) => `${Number(value).toFixed(2)}`;
const removeIVA = (price) => price / 1.22;

function formatStringNumbers(asusData) {
  const fieldsToFormat = [
    "PrezzoNettoForn",
    "PrezzoIvato1",
    "PrezzoIvato4",
    "Extra2",
    "Extra4",
  ];

  function formatNumber(value) {
    if (typeof value !== "string") return value;
    let cleaned = value
      .replace(/[€\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    let number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
  }

  return asusData.map((product) => ({
    ...product,
    ...Object.fromEntries(
      fieldsToFormat.map((field) => [field, formatNumber(product[field])])
    ),
  }));
}
