import readXlsxFile from "read-excel-file/node";
import writeXlsxFile from "write-excel-file/node";

class ExcelService {
  read = async (path) => await readXlsxFile(path);
  write = async (data, options) => await writeXlsxFile(data, options);

  convertToObjects(data) {
    const [headers, ...rows] = data;
    return rows.map((row) =>
      Object.fromEntries(row.map((value, index) => [headers[index], value]))
    );
  }
}

export const excelService = new ExcelService();
