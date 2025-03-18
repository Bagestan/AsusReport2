import * as readline from "node:readline";

export class DataService {
  startDate = undefined;
  endDate = undefined;
  reportWeek = undefined;
  reportWeek = "2025W03";

  // NameDSN = "DSN=EasyFattNode";
  // startDate = "2025-01-19";
  // endDate = "2025-01-26";

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  _setNameDSN() {
    return new Promise((resolve) => {
      this.rl.question("Name of the DSN ODBC ", (answer) =>
        resolve((this.NameDSN = answer))
      );
    });
  }

  _setStartDate() {
    return new Promise((resolve) => {
      this.rl.question("Data iniziale (YYYY-MM-DD): ", (answer) =>
        resolve((this.startDate = answer))
      );
    });
  }

  _setEndDate() {
    return new Promise((resolve) => {
      this.rl.question("Data finale (YYYY-MM-DD): ", (answer) =>
        resolve((this.endDate = answer))
      );
    });
  }

  _setReportWeek() {
    return new Promise((resolve) => {
      this.rl.question("Data applicazione (2025W03): ", (answer) =>
        resolve((this.reportWeek = answer))
      );
    });
  }

  getNameDSN = async () => this.NameDSN ?? (await this._setNameDSN());
  getStartDate = async () => this.startDate ?? (await this._setStartDate());
  getEndDate = async () => this.endDate ?? (await this._setEndDate());
  getReportWeek = async () => this.reportWeek ?? (await this._setReportWeek());
}
