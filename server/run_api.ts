import axios, { AxiosResponse } from "axios";
import ExcelJS from "exceljs";

// Sleep helper
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ---- Types ----
type ResultStatus = "GOOD" | "BAD" | "ERROR";

interface ApiResponse {
  message?: string;
  [key: string]: any;
}

interface ResultRow {
  request_no: string;
  attempt: number;
  status: ResultStatus;
  http_status: number | "NA";
  credit: string | number;
  error?: string;
}

// ---- Config ----
const URL =
  "http://172.28.148.155:5000/api/get-proxy-response?alias_key=CEpYNPnpSqynnd3N9mjsGLG1";

const NUM_REQUESTS = 10000;
const MAX_WORKERS = 50;
const MAX_RETRIES = 3;
const BACKOFF = 2;

// ---- Request Function ----
async function makeRequest(i: number): Promise<ResultRow> {
  const request_no = String(i).padStart(5, "0");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.get(URL, {
        timeout: 5000,
      });

      const credit = response.headers?.["scrape.do-request-cost"] ?? "NA";
      console.log(response.data);
      const isSuccess = response.data?.message?.includes("Api call success");

      return {
        request_no,
        attempt,
        status: isSuccess ? "GOOD" : "BAD",
        http_status: response.status,
        credit,
      };
    } catch (err: any) {
      if (attempt === MAX_RETRIES) {
        return {
          request_no,
          attempt,
          status: "ERROR",
          http_status: "NA",
          credit: "NA",
          error: err.message,
        };
      }

      await sleep(Math.pow(BACKOFF, attempt) * 1000);
    }
  }

  throw new Error("Unexpected flow"); // safety
}

// ---- Worker Pool ----
async function run() {
  const results: ResultRow[] = [];
  let index = 1;

  async function worker() {
    while (true) {
      const current = index++;
      if (current > NUM_REQUESTS) break;

      const result = await makeRequest(current);
      results.push(result);

      console.log(result);
    }
  }

  // Create worker pool
  const workers = Array.from({ length: MAX_WORKERS }, () => worker());

  await Promise.all(workers);

  return results;
}

// ---- Excel Export ----
async function exportToExcel(data: ResultRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  worksheet.columns = [
    { header: "request_no", key: "request_no" },
    { header: "attempt", key: "attempt" },
    { header: "status", key: "status" },
    { header: "http_status", key: "http_status" },
    { header: "credit", key: "credit" },
    { header: "error", key: "error" },
  ];

  worksheet.addRows(data);

  await workbook.xlsx.writeFile("report.xlsx");
  console.log("✅ Excel file saved");
}

// ---- Main ----
async function main() {
  const results = await run();
  await exportToExcel(results);
}

main().catch(console.error);

// npx ts-node run_api.ts
