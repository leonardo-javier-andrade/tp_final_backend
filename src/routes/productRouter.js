import { Router } from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productControllers.js";


// aqui importamos le middleware de validacion y los schemas de validacion
import { validateBody } from "../middlewares/validateMiddleware.js"
import { createProductSchema, updateProductSchema } from "../validation/ProductValidation.js"


// aplicamos el middleware de validacion a las rutas de creacion y actualizacion de productos,
//  para que antes de llegar al controlador,
// se valide el body de la request segun el schema correspondiente



const ProductRouter = Router()

ProductRouter.get("/", getProducts)
ProductRouter.get("/:id", getProduct)
ProductRouter.post("/", validateBody(createProductSchema), createProduct)
ProductRouter.put("/:id", validateBody(updateProductSchema), updateProduct)
ProductRouter.delete("/:id", deleteProduct)

export { ProductRouter }




