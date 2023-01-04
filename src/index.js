require("dotenv").config();
const express = require("express");
const rotas = require("./rotas");
const cors = require("cors");
const PORT = process.env.PORT ?? 3333;
const app = express();

app.use(cors());
app.use(express.json());
app.use(rotas);

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
