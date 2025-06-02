require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 3200;
const {connectDB} = require("./config/config");
const cors = require('cors');
const app = express();
const listEndpoints = require('express-list-endpoints');


// Conectar a DB antes de iniciar el servidor
connectDB();

app.use(cors());
app.set('trust proxy', true);  
app.use(express.json());
app.use("/api", require('./routes/index'));
console.log('\n📚 ENDPOINTS DETECTADOS:');
console.table(listEndpoints(app));



app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${port}`);
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

