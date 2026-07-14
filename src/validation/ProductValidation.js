import { z } from "zod";


// Validación de producto para crear y actualizar
const createProductSchema = z.object({

        // Validación de nombre
  name: z.string( "El nombre es requerido" )
         .min(3, "El nombre debe tener al menos 3 caracteres"),
         // Validación de precio
  price: z.number("El precio es requerido" )
          .nonnegative("El precio no puede ser un número negativo")
          .default(0),
          // Validación de categoría
  category: z.string().optional().default("Sin categoria"),
        // Validación de stock
  stock: z.number("El stock es requerido")
          .int("El stock debe ser un número entero")
          .nonnegative("El stock no puede ser negativo")
          .default(0)
});

// Para actualizar, hacemos que todos los campos sean opcionales por si solo quieren editar uno
const updateProductSchema = createProductSchema.partial();

export { createProductSchema, updateProductSchema };