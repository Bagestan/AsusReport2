import odbc from "odbc";
import { exec } from "child_process";

class OdbcService {
  openConnection = async (DSN) =>
    await odbc.connect({ connectionString: `DSN=${DSN}` });

  closeConnection = async (connection) => await connection.close();

  executeQuery = async (conn, query) => await conn.query(query);

  async getODBCDataSources() {
    return new Promise((resolve, reject) => {
      exec(
        'reg query "HKCU\\Software\\ODBC\\ODBC.INI\\ODBC Data Sources"',
        (err, stdout) => {
          if (err) {
            reject("Error:", err);
            return;
          }

          const sources = stdout
            .split("\r\n")
            .slice(2) // Remove cabeçalhos da saída do comando
            .filter((line) => line.trim() !== "")
            .map((line) => {
              const parts = line.trim().split("    ");
              return { name: parts[0], driver: parts[1] };
            });

          resolve(sources);
        }
      );
    });
  }
}

export const odbcService = new OdbcService();
