const settimanale = {
  tableName: "settimanale",
  create: `
        CREATE TABLE settimanale (
            CodArticolo VARCHAR(50) PRIMARY KEY,
            PrimoDiDesc VARCHAR(255),
            SommaDiQtaCaricata INTEGER,
            SommaDiQtaScaricata INTEGER,
            PrimoDiProduttore VARCHAR(255)
        );`,
  select: (startDate, endDate) => `
        INSERT INTO settimanale (
            CodArticolo, 
            PrimoDiDesc, 
            SommaDiQtaCaricata, 
            SommaDiQtaScaricata, 
            PrimoDiProduttore
        )
        SELECT 
            TArticoli.CodArticolo, 
            LEFT(MAX(TArticoli.Desc), 255) AS PrimoDiDesc, 
            SUM(TMovMagazz.QtaCaricata) AS SommaDiQtaCaricata, 
            SUM(TMovMagazz.QtaScaricata) AS SommaDiQtaScaricata, 
            LEFT(MAX(TArticoli.Produttore), 255) AS PrimoDiProduttore
        FROM 
            TArticoli 
        INNER JOIN 
            TMovMagazz 
        ON 
            TArticoli.IDArticolo = TMovMagazz.IDArticolo
        WHERE 
            (((TMovMagazz.Data)<'${endDate}' 
            AND (TMovMagazz.Data)>'${startDate}') 
            AND ((TArticoli.Produttore)='Asus'))
        GROUP BY 
            TArticoli.CodArticolo;
      `,
};

export { settimanale };
