const giacenzaIniziale = {
  tableName: "giacenzaIniziale",
  create: `
        CREATE TABLE giacenzaIniziale (
            CodArticolo VARCHAR(50) PRIMARY KEY,
            SommaDiQtaCaricata FLOAT,
            Espr1 FLOAT,
            SommaDiQtaScaricata FLOAT,
            PrimoDiDesc VARCHAR(255),
            PrimoDiProduttore VARCHAR(255),
            CodBarre VARCHAR(50),
            DescHtml BLOB SUB_TYPE 1,
            CodArticoloForn VARCHAR(50));
        `,
  select: (startDate, endDate) => `
        INSERT INTO giacenzaIniziale (
            CodArticolo, 
            SommaDiQtaCaricata, 
            Espr1, 
            SommaDiQtaScaricata,
            PrimoDiDesc, 
            PrimoDiProduttore, 
            CodBarre, 
            DescHtml, 
            CodArticoloForn
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
            MAX(TArticoli.Desc) AS PrimoDiDesc,
            MAX(TArticoli.Produttore) AS PrimoDiProduttore,
            TArticoli.CodBarre,
            TArticoli.DescHtml,
            TArticoli.CodArticoloForn
        FROM 
            TArticoli 
        INNER JOIN 
            TMovMagazz 
        ON 
            TArticoli.IDArticolo = TMovMagazz.IDArticolo
        WHERE 
            TArticoli.Produttore = 'Asus'
            AND TMovMagazz.Data < '${startDate}'
        GROUP BY 
            TArticoli.CodArticolo,
            TArticoli.CodBarre,
            TArticoli.DescHtml,
            TArticoli.Extra1,
            TArticoli.Extra2,
            TArticoli.CodArticoloForn;
        `,
};

export { giacenzaIniziale };
