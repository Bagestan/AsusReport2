const iniziale2 = {
  tableName: "iniziale2",
  create: `CREATE TABLE iniziale2 (
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
    INSERT INTO iniziale2 (
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
        settimanale.CodArticolo,
        settimanale.PrimoDiDesc,
        giacenzaIniziale.Espr1,
        settimanale.SommaDiQtaCaricata,
        settimanale.SommaDiQtaScaricata,
        giacenzaIniziale.CodBarre,
        giacenzaIniziale.DescHtml,
        giacenzaIniziale.CodArticoloForn
    FROM 
        settimanale 
    LEFT JOIN 
        giacenzaIniziale 
    ON 
        settimanale.CodArticolo = giacenzaIniziale.CodArticolo;
    `,
};

export { iniziale2 };
