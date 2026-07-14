import { z } from "zod";
import { required } from "zod/mini";
// Validación de usuario para registro y login

const registerSchema = z.object({
    // Validación de nombre de usuario
  username: z.string( "El nombre de usuario es requerido" )
             .min(3, "El usuario debe tener al menos 3 caracteres"),
             // Validación de email, verificamos que tenga un formato valido con @ y termine con .com
  email: z.string("El email es requerido")
          .email("El formato del email no es válido")
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El email no tiene un formato válido"),
          
          // Validación de contraseña
  password: z.string("La contraseña es requerida")
             .min(8, "La contraseña debe tener al menos 8 caracteres")
             // Validamos la misma expresión regular que tenías en tu controlador:
             .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/, 
                    "La contraseña debe contener una mayúscula, un número y un carácter especial")
});
 

const loginSchema = z.object({
  email: z.string("El email es requerido" ),
  password: z.string("La contraseña es requerida")});

export { registerSchema, loginSchema };