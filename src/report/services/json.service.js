import jsonfile from "jsonfile";

class JsonService {
  write = (filePath, data) => jsonfile.writeFileSync(filePath, data);
  read = (filePath, data) => jsonfile.readFileSync(filePath, data);

  supTable = "./src/report/supportFiles/supportTable.json";

  setSupTable(data) {
    try {
      return this.write(this.supTable, data);
    } catch (error) {
      console.log("🚀 ~ JsonService ~ setSupTable ~ error:", error);
    }
  }

  getSupTable = () => this.read(this.supTable);
}

export const jsonService = new JsonService();
