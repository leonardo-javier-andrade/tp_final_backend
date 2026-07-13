import { Router } from "express"
import { limiter } from "../middlewares/limiterMiddleware.js"
import { register, login } from "../controllers/authControllers.js"


/// aqui importamos le middleware de validacion y los schemas de validacion
import { validateBody } from "../middlewares/validateMiddleware.js"
import { registerSchema, loginSchema } from "../validation/authValidation.js"


// aplicamos el middleware de validacion a las rutas de registro y login, para que antes de llegar al controlador, 
// se valide el body de la request segun el schema correspondiente


const AuthRouter = Router()

AuthRouter.post("/register", validateBody(registerSchema), register)
AuthRouter.post("/login", validateBody(loginSchema), limiter, login)

export { AuthRouter }