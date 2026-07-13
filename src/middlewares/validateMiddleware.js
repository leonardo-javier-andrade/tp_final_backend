export const validateBody = (schema) => (req, res, next) => {
  try {
    // La siguiente linea analiza el req.body segun el esquema que le pasemos, si es bien continua, si esta mal 
    // salta al catch y devuelve un error con los detalles de la validación

    
    schema.parse(req.body);
    next();
  } catch (error) {
    // Zod devuelve un array de errores. Lo mapeamos para enviarlo limpio al cliente.
    const errorDetails = error.errors.map((err) => ({
      campo: err.path[0],
      mensaje: err.message
    }));

    return res.status(400).json({
      success: false,
      error: "Error de validación en los datos enviados",
      details: errorDetails
    });
  }
};