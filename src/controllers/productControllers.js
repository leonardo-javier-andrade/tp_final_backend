import { Product } from "../models/ProductModel.js";

const getProducts = async (req, res) => {
  try {
    const userLogged = req.userLogged
    console.log("userLogged----------- informacion del usuario logueado para conseguir productos", userLogged)
    
    let viewProducts; 

    // si el usuario no es admin, solo puede ver sus productos, si es admin puede ver todos los productos
    if (userLogged.role !== "admin") {

      viewProducts = await Product.find({ userId: userLogged.id }, { userId: 0 })
    } else {
    
      viewProducts = await Product.find({}, { userId: 0 })
    }

   // respuesta de los productos encontrados, si no hay productos encontrados, devuelve un array vacío

    res.json({
      success: true,
      data: viewProducts,
      message: "Products fetched successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching products" })
  }
}

const getProduct = async (req, res) => {
  try {

    // obtencion de informaicon del producto por id y del usuario logueado para verificar permisos
    const id = req.params.id
    const userLogged = req.userLogged

    let foundProduct;


    // si el usuario es admin puede ver cualquier producto, si no es admin solo puede ver sus productos

    if (userLogged.role === "admin") {
      foundProduct = await Product.findById(id, { userId: 0 })
      
      if (!foundProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        })
      }
    } else {
      foundProduct = await Product.findOne({ _id: id, userId: userLogged.id }, { userId: 0 })

      if (!foundProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found or you don't have permission to view it" 
        })
      }
    }

    res.json({
      success: true,
      data: foundProduct,
      message: "Product fetched successfully"
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, error: "Invalid ID format" })
    }
    res.status(500).json({ success: false, error: "Error fetching product" })
  }
}


const createProduct = async (req, res) => {
  try {

    // obtencion de la informacion del producto a crear y del usuario 
    const body = req.body
    const userLogged = req.userLogged

    
    const newProduct = await Product.create({
      name: body.name,
      price: body.price,
      category: body.category,
      stock: body.stock,
      available: body.stock > 0,
      userId: userLogged.id
    })


    // eliminacion del userId del objeto para no exponerlo en la respuesta
    const { userId, ...publicDataProduct } = newProduct.toObject()

    res.json({
      success: true,
      data: publicDataProduct,
      message: "Product created successfully"
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating product" })
  }
}

const updateProduct = async (req, res) => {
  try {

    // obtencion de la informacion del producto a actualizar y del usuario logueado para verificar permisos

    const id = req.params.id
    const body = req.body
    const userLogged = req.userLogged

    const updateData = { 
      ...body, 
      available: body.stock > 0 
    }

    let updatedProduct;

    // si el usuario es admin puede actualizar cualquier producto, si no es admin solo puede actualizar sus productos
    if (userLogged.role === "admin") {
      updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, projection: { userId: 0 } })
      
      if (!updatedProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        })
      }
    } else {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: id, userId: userLogged.id }, 
        updateData, 
        { new: true, projection: { userId: 0 } }
      )

      if (!updatedProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found or you don't have permission to update it" 
        })
      }
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, error: "Invalid ID format" })
    }
    res.status(500).json({ success: false, error: "Error updating product" })
  }
}

const deleteProduct = async (req, res) => {
  try {

    // obtencion de la informacion del producto a eliminar y del usuario logueado para verificar permisos
    const id = req.params.id
    const userLogged = req.userLogged

    let deletedProduct;

    // si el usuario es admin puede eliminar cualquier producto, si no es admin solo puede eliminar sus productos

    if (userLogged.role === "admin") {
      deletedProduct = await Product.findByIdAndDelete(id)
      
      if (!deletedProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found" 
        })
      }
    } else {
      deletedProduct = await Product.findOneAndDelete({ _id: id, userId: userLogged.id })

      if (!deletedProduct) {
        return res.status(404).json({ 
          success: false, 
          error: "Product not found or you don't have permission to delete it" 
        })
      }
    }

    const productData = deletedProduct.toObject()
    delete productData.userId

    res.json({ 
      success: true, 
      data: productData, 
      message: "Product deleted successfully" 
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, error: "Invalid ID format" })
    }
    res.status(500).json({ success: false, error: "Error deleting product" })
  }
}

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct }