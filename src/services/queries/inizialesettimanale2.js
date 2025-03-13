const inizialesettimanale2 = {
  tableName: "inizialesettimanale2",
  create: `
      CREATE TABLE inizialesettimanale2 (
        CodArticolo VARCHAR(50),
        PrimoDiDesc VARCHAR(255),
        Espr1 DECIMAL(10, 2),
        SommaDiQtaCaricata INTEGER,
        SommaDiQtaScaricata INTEGER,
        CodBarre VARCHAR(50),
        DescHtml BLOB SUB_TYPE 1,
        CodArticoloForn VARCHAR(50)
      )
  `,
  select: (startDate, endDate) => `
      INSERT INTO inizialesettimanale2 (
        CodArticolo,
        PrimoDiDesc,
        Espr1,
        SommaDiQtaCaricata,
        SommaDiQtaScaricata,
        CodBarre,
        DescHtml,
        CodArticoloForn
      )
      SELECT 
        giacenzaInizialeMovSettimanali.CodArticolo,
        giacenzaInizialeMovSettimanali.PrimoDiDesc,
        giacenzaInizialeMovSettimanali.Espr1,
        giacenzaInizialeMovSettimanali.SommaDiQtaCaricata,
        giacenzaInizialeMovSettimanali.SommaDiQtaScaricata,
        giacenzaInizialeMovSettimanali.CodBarre,
        giacenzaInizialeMovSettimanali.DescHtml,
        giacenzaInizialeMovSettimanali.CodArticoloForn
      FROM 
        giacenzaInizialeMovSettimanali
      UNION ALL 
      SELECT 
        iniziale2.CodArticolo,
        iniziale2.PrimoDiDesc,
        iniziale2.Espr1,
        iniziale2.SommaDiQtaCaricata,
        iniziale2.SommaDiQtaScaricata,
        iniziale2.CodBarre,
        iniziale2.DescHtml,
        iniziale2.CodArticoloForn
      FROM 
        iniziale2;
    `,
};

export { inizialesettimanale2 };
