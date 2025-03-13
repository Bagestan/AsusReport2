const finale = {
  tableName: "finale",
  create: `
        CREATE TABLE finale (
            CodArticolo VARCHAR(50) PRIMARY KEY,
            PrimoDiDesc VARCHAR(255),
            Espr1 DECIMAL(10, 2),
            SommaDiQtaCaricata INT,
            SommaDiQtaScaricata INT,
            finaleEspr1 DECIMAL(10, 2)
        );
        `,
  select: (startDate, endDate) => `
        INSERT INTO finale (
            CodArticolo,
            PrimoDiDesc,
            Espr1,
            SommaDiQtaCaricata,
            SommaDiQtaScaricata,
            finaleEspr1
        )
        SELECT
            giacenzaInizialeMovSettimanali.CodArticolo,
            giacenzaInizialeMovSettimanali.PrimoDiDesc,
            giacenzaInizialeMovSettimanali.Espr1,
            giacenzaInizialeMovSettimanali.SommaDiQtaCaricata,
            giacenzaInizialeMovSettimanali.SommaDiQtaScaricata,
            giacenzaFinale.Espr1
        FROM
            giacenzaFinale
        INNER JOIN
            giacenzaInizialeMovSettimanali
        ON
            giacenzaFinale.CodArticolo = giacenzaInizialeMovSettimanali.CodArticolo
        WHERE
            (giacenzaInizialeMovSettimanali.Espr1 <> 0)
            OR (giacenzaInizialeMovSettimanali.SommaDiQtaCaricata <> 0)
            OR (giacenzaInizialeMovSettimanali.SommaDiQtaScaricata <> 0);
        `,
};

export { finale };
