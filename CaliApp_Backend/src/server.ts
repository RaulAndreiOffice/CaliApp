import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`CaliAPP Backend running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
