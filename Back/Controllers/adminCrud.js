require('dotenv').config();
const sql = require('mssql');
const crypto = require('crypto');

const pool = new sql.ConnectionPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.PORT, 10)
});

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex').toLowerCase();
};

const createUser = async (req, res) => {
  const {
    usuId, primerNombre, primerApellido,
    segundoApellido, correo, contrasena, rol
  } = req.body;

  try {
    await pool.connect();
    await pool.request()
      .input('usuId', sql.VarChar, usuId)
      .input('primerNombre', sql.VarChar, primerNombre)
      .input('primerApellido', sql.VarChar, primerApellido)
      .input('segundoApellido', sql.VarChar, segundoApellido)
      .input('correo', sql.VarChar, correo)
      .input('contrasena', sql.VarChar, hashPassword(contrasena))
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO schemaMichelle.tablaUsu
        (usuId, primerNombre, primerApellido, segundoApellido, correo, contrasena, rol)
        VALUES (@usuId, @primerNombre, @primerApellido, @segundoApellido, @correo, @contrasena, @rol)
      `);

    res.status(201).json({ message: 'Usario creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
};

const getUsers = async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request()
      .query('SELECT * FROM schemaMichelle.tablaUsu');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};


const updateUser = async (req, res) => {
  const { usuId } = req.params; 
  const { primerNombre, primerApellido, segundoApellido, correo, contrasena, rol } = req.body;

  try {
    await pool.connect();
    let updateQuery = "UPDATE schemaMichelle.tablaUsu SET ";
    const params = {};

    let fieldsUpdated = false;

    if (primerNombre) {
      updateQuery += "primerNombre = @primerNombre, ";
      params.primerNombre = primerNombre;
      fieldsUpdated = true;
    }
    if (primerApellido) {
      updateQuery += "primerApellido = @primerApellido, ";
      params.primerApellido = primerApellido;
      fieldsUpdated = true;
    }
    if (segundoApellido) {
      updateQuery += "segundoApellido = @segundoApellido, ";
      params.segundoApellido = segundoApellido;
      fieldsUpdated = true;
    }
    if (correo) {
      updateQuery += "correo = @correo, ";
      params.correo = correo;
      fieldsUpdated = true;
    }
    if (contrasena) {
      updateQuery += "contrasena = @contrasena, ";
      params.contrasena = hashPassword(contrasena); 
      fieldsUpdated = true;
    }
    if (rol) {
      updateQuery += "rol = @rol, ";
      params.rol = rol;
      fieldsUpdated = true;
    }

    
    if (!fieldsUpdated) {
      return res.status(400).json({ message: 'Error en actualización de filas' });
    }

    updateQuery = updateQuery.slice(0, -2); 
    updateQuery += " WHERE usuId = @usuId";


    const request = pool.request()
      .input('usuId', sql.VarChar, usuId);

  
    Object.keys(params).forEach(param => {
      request.input(param, sql.VarChar, params[param]);
    });


    const result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usiario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
};


const deleteUser = async (req, res) => {
  const {
    usuId, primerNombre, primerApellido, correo
  } = req.body;

  try {
    await pool.connect();
    const result = await pool.request()
      .input('usuId', sql.VarChar, usuId)
      .input('primerNombre', sql.VarChar, primerNombre)
      .input('primerApellido', sql.VarChar, primerApellido)
      .input('correo', sql.VarChar, correo)
      .query(`
        DELETE FROM schemaMichelle.tablaUsu
        WHERE usuId = @usuId
          AND primerNombre = @primerNombre
          AND primerApellido = @primerApellido
          AND correo = @correo
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
