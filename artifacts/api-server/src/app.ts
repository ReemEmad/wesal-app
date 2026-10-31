import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { WesalError } from "./lib/wesal-security";

const app: Express = express();
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]?.replace(/(\/wesal\/invitations\/preview\/)[^/]+/, "$1[redacted]"),
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof WesalError) {
    if (error.status === 429) res.set("Retry-After", "600");
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error?.type === "entity.parse.failed" || error?.type === "entity.too.large") {
    res.status(400).json({ error: "تعذر قراءة الطلب. راجع البيانات." });
    return;
  }
  // Never log raw request bodies, SQL parameters, passwords, or invitation/session secrets.
  req.log.error({ category: "wesal-request-error" }, "Request failed");
  res.status(500).json({ error: "تعذر إتمام الطلب الآن. حاول مرة أخرى لاحقًا." });
};
app.use(errorHandler);

export default app;
