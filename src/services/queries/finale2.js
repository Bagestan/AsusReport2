const finale2 = {
  tableName: "finale2",
  create: `
      CREATE TABLE finale2 (
        CodArticolo VARCHAR(50),
        PrimoDiDesc VARCHAR(32765),
        Espr1 DECIMAL(10, 2),
        SommaDiQtaCaricata INTEGER,
        SommaDiQtaScaricata INTEGER,
        finaleEspr1 DECIMAL(10, 2),
        CodBarre VARCHAR(50),
        DescHtml BLOB SUB_TYPE 1,
        CodArticoloForn VARCHAR(50));
  `,
  select: (startDate, endDate) => `
        INSERT INTO finale2 (
            CodArticolo,
            PrimoDiDesc,
            Espr1,
            SommaDiQtaCaricata,
            SommaDiQtaScaricata,
            finaleEspr1,
            CodBarre,
            DescHtml,
            CodArticoloForn
        )
        SELECT
            inizialesettimanale2.CodArticolo,
            inizialesettimanale2.PrimoDiDesc,
            inizialesettimanale2.Espr1 as Espr1,
            inizialesettimanale2.SommaDiQtaCaricata,
            inizialesettimanale2.SommaDiQtaScaricata,
            giacenzaFinale.Espr1,
            inizialesettimanale2.CodBarre,
            inizialesettimanale2.DescHtml,
            inizialesettimanale2.CodArticoloForn
        FROM
            giacenzaFinale
        INNER JOIN
            inizialesettimanale2
        ON
            giacenzaFinale.CodArticolo = inizialesettimanale2.CodArticolo
        WHERE
            (inizialesettimanale2.Espr1 <> 0)
            OR (inizialesettimanale2.SommaDiQtaCaricata <> 0)
            OR (inizialesettimanale2.SommaDiQtaScaricata <> 0);
    `,
};

export { finale2 };
