import express from "express";
import { execSync } from "node:child_process";

const app = express();
app.use(express.json());

app.post("/alerts", (req, res) => {
  const alertNames = (req.body.alerts ?? []).map((alert: { labels?: { alertname?: string } }) => alert.labels?.alertname);
  const shouldRollback = alertNames.includes("HighFallbackRate") || alertNames.includes("HighLatencyP95");

  if (shouldRollback) {
    try {
      execSync("/opt/rdmx/scripts/rollback_last_release.sh", { stdio: "inherit" });
      console.log("Rollback automático ejecutado");
    } catch (error) {
      console.error("Error en auto-remediación", error);
    }
  }

  res.sendStatus(200);
});

app.listen(8081, () => {
  console.log("AutoRemediate escuchando en :8081");
});
