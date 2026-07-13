const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // 1. Mapeamos la lista completa de errores por si los necesitas después
    const errorDetails = error.errors.map((err) => ({
      campo: err.path[0],
      mensaje: err.message
    }));

    // 2. Tomamos el mensaje del primer error de la lista
    const primerMensaje = errorDetails[0].mensaje;

    // 3. Devolvemos el formato exacto de tu imagen adaptado a un error 400
    return res.status(400).json({
      success: false,
      data: null,
      message: primerMensaje // <-- Aquí viaja "El usuario debe tener al menos 3 caracteres"
    });
  }
};

export { validateBody };