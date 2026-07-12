import { Router } from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productControllers.js";

const ProductRouter = Router()

ProductRouter.get("/", getProducts)
ProductRouter.get("/:id", getProduct)
ProductRouter.post("/", createProduct)
ProductRouter.put("/:id", updateProduct)
ProductRouter.delete("/:id", deleteProduct)

export { ProductRouter }




