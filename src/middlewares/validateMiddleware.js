import { ZodError } from "zod";

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Si el error es de Zod, tomamos el mensaje del primer fallo
    console.log("Aqui sucedio un error en el middleware validation")
  console.log(error.issues[0].message)  

      // 1. Extraemos solo los textos de los mensajes de error en un nuevo array
      const todosLosMensajes = error.issues.map(issue => issue.message);

      // 2. Unimos los mensajes con un separador claro si hay más de uno
      const mensajeFinal = todosLosMensajes.join("./ ");


      return res.status(400).json({
        success: false,
        message: mensajeFinal
      });
    }

  }
;

export { validateBody };