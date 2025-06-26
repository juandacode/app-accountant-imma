import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';

const Inventory = () => {
  const [products, setProducts] = useLocalStorage('products', []);
  const [movements, setMovements] = useLocalStorage('inventory_movements', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    currentQuantity: 0
  });

  const [movementForm, setMovementForm] = useState({
    productId: '',
    type: 'entrada',
    quantity: 0,
    description: ''
  });

  const handleProductSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...productForm, id: editingProduct.id }
          : p
      ));
      toast({
        title: "¡Producto actualizado!",
        description: "El producto se ha actualizado correctamente.",
      });
    } else {
      const newProduct = {
        ...productForm,
        id: Date.now().toString(),
        currentQuantity: Number(productForm.currentQuantity)
      };
      setProducts([...products, newProduct]);
      toast({
        title: "¡Producto agregado!",
        description: "El producto se ha registrado correctamente.",
      });
    }
    
    resetProductForm();
  };

  const handleMovementSubmit = (e) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === movementForm.productId);
    if (!product) return;

    const quantity = Number(movementForm.quantity);
    const newQuantity = movementForm.type === 'entrada' 
      ? product.currentQuantity + quantity
      : product.currentQuantity - quantity;

    if (newQuantity < 0) {
      toast({
        title: "Error",
        description: "No hay suficiente stock para esta salida.",
        variant: "destructive"
      });
      return;
    }

    // Update product quantity
    setProducts(products.map(p => 
      p.id === movementForm.productId 
        ? { ...p, currentQuantity: newQuantity }
        : p
    ));

    // Add movement record
    const newMovement = {
      id: Date.now().toString(),
      productId: movementForm.productId,
      productName: product.name,
      type: movementForm.type,
      quantity: quantity,
      description: movementForm.description,
      date: new Date().toISOString().split('T')[0],
      previousQuantity: product.currentQuantity,
      newQuantity: newQuantity
    };

    setMovements([newMovement, ...movements]);
    
    toast({
      title: "¡Movimiento registrado!",
      description: `${movementForm.type === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente.`,
    });
    
    resetMovementForm();
  };

  const resetProductForm = () => {
    setProductForm({ name: '', sku: '', description: '', currentQuantity: 0 });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const resetMovementForm = () => {
    setMovementForm({ productId: '', type: 'entrada', quantity: 0, description: '' });
    setIsMovementDialogOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({
      title: "Producto eliminado",
      description: "El producto se ha eliminado correctamente.",
    });
  };

  const lowStockProducts = products.filter(p => p.currentQuantity <= 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-600 mt-1">Administra tus productos y movimientos de stock</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Registrar Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMovementSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="productId">Producto</Label>
                  <Select value={movementForm.productId} onValueChange={(value) => 
                    setMovementForm({...movementForm, productId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.currentQuantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Movimiento</Label>
                  <Select value={movementForm.type} onValueChange={(value) => 
                    setMovementForm({...movementForm, type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={movementForm.description}
                    onChange={(e) => setMovementForm({...movementForm, description: e.target.value})}
                    placeholder="Motivo del movimiento"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Registrar Movimiento
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="currentQuantity">Cantidad Inicial</Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    min="0"
                    value={productForm.currentQuantity}
                    onChange={(e) => setProductForm({...productForm, currentQuantity: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + p.currentQuantity, 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card-hover">
          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <TrendingDown className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">⚠️ Productos con Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-red-600 font-bold">Stock: {product.currentQuantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Descripción</th>
                  <th className="text-left p-2">Stock Actual</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <motion.tr 
                    key={product.id} 
                    className="border-b hover:bg-gray-50"
                    whileHover={{ backgroundColor: "#f9fafb" }}
                  >
                    <td className="p-2 font-mono text-sm">{product.sku}</td>
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2 text-gray-600">{product.description}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        product.currentQuantity <= 5 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.currentQuantity}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay productos registrados. ¡Agrega tu primer producto!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Producto</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Cantidad</th>
                  <th className="text-left p-2">Stock Anterior</th>
                  <th className="text-left p-2">Stock Nuevo</th>
                  <th className="text-left p-2">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 10).map(movement => (
                  <tr key={movement.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{movement.date}</td>
                    <td className="p-2 font-medium">{movement.productName}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        movement.type === 'entrada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="p-2">{movement.quantity}</td>
                    <td className="p-2">{movement.previousQuantity}</td>
                    <td className="p-2 font-bold">{movement.newQuantity}</td>
                    <td className="p-2 text-gray-600">{movement.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay movimientos registrados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;