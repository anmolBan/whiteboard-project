import express from "express";
import cors from "cors";
import { HTTP_PORT } from "@repo/backend_common";
import router from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = HTTP_PORT || 3002;
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});