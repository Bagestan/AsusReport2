const giacenzaInizialeMovSettimanali = {
  tableName: "giacenzaInizialeMovSettimanali",
  create: `
      CREATE TABLE giacenzaInizialeMovSettimanali (
        CodArticolo VARCHAR(50) PRIMARY KEY,
        PrimoDiDesc VARCHAR(255),
        Espr1 FLOAT,
        SommaDiQtaCaricata INTEGER,
        SommaDiQtaScaricata INTEGER,
        CodBarre VARCHAR(50),
        DescHtml BLOB SUB_TYPE 1,
        CodArticoloForn VARCHAR(50)
      );
      `,
  select: (startDate, endDate) => `
      INSERT INTO giacenzaInizialeMovSettimanali (
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
        giacenzaIniziale.CodArticolo,
        giacenzaIniziale.PrimoDiDesc,
        giacenzaIniziale.Espr1,
        settimanale.SommaDiQtaCaricata,
        settimanale.SommaDiQtaScaricata,
        giacenzaIniziale.CodBarre,
        giacenzaIniziale.DescHtml,
        giacenzaIniziale.CodArticoloForn
      FROM 
        settimanale
      RIGHT JOIN 
        giacenzaIniziale
      ON 
        settimanale.CodArticolo = giacenzaIniziale.CodArticolo;
    `,
};

export { giacenzaInizialeMovSettimanali };
