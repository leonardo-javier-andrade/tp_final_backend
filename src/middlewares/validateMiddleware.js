import { ZodError } from "zod";

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Si el error es de Zod, tomamos el mensaje del primer fallo
    console.log("Aqui sucedio un error en el middleware validation")
  console.log(error.issues[0].message  )  

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

  }
;

export { validateBody };