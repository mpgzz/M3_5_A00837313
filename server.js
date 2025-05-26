const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./Back/Controllers/loginCrud');
const loginRoutes = require('./Back/Routes/loginRoutes');
const adminRoutes = require('./Back/Routes/adminRoutes');
const userRoutes = require('./Back/Routes/othersRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

process.on('uncaughtException', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

app.use(cors());
app.use(express.json());

app.use('/api', loginRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ message: 'No encontrado' });
});

if (process.env.NODE_ENV !== 'test') {
  connectToDatabase()
    .then(() => {
      console.log("Conexión exitosa a la base de datos.");
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto: ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Error conectando a la base de datos:", err);
      process.exit(1);
    });
}

module.exports = app;
