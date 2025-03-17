const giacenzaFinale = {
  tableName: "giacenzaFinale",
  create: ` CREATE TABLE giacenzaFinale (
                CodArticolo VARCHAR(50) PRIMARY KEY,
                SommaDiQtaCaricata INTEGER,
                Espr1 FLOAT,
                SommaDiQtaScaricata INTEGER,
                PrimoDiDesc VARCHAR(32765),
                PrimoDiProduttore VARCHAR(255)
            );`,
  select: (startDate, endDate) => `
        INSERT INTO giacenzaFinale (
            CodArticolo, 
            SommaDiQtaCaricata, 
            Espr1, 
            SommaDiQtaScaricata, 
            PrimoDiDesc, 
            PrimoDiProduttore
        )
        SELECT
            TArticoli.CodArticolo,
            SUM(TMovMagazz.QtaCaricata) AS SommaDiQtaCaricata,
            CASE 
                WHEN SUM(TMovMagazz.QtaScaricata) IS NOT NULL THEN 
                    SUM(TMovMagazz.QtaCaricata) - SUM(TMovMagazz.QtaScaricata)
                ELSE 
                    SUM(TMovMagazz.QtaCaricata)
            END AS Espr1,
            SUM(TMovMagazz.QtaScaricata) AS SommaDiQtaScaricata,
            MIN(TArticoli.Desc) AS PrimoDiDesc,
            MIN(TArticoli.Produttore) AS PrimoDiProduttore
        FROM
            TArticoli
        INNER JOIN
            TMovMagazz
        ON
            TArticoli.IDArticolo = TMovMagazz.IDArticolo
        WHERE
            TArticoli.Produttore = 'Asus'
            AND TMovMagazz.Data < '${endDate}'
        GROUP BY
            TArticoli.CodArticolo;
    `,
};

export { giacenzaFinale };
