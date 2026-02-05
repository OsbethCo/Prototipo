import { useState } from 'react';
import { Producto } from '../types/Producto';
import { crearProducto } from '../services/productosService';
import '../styles/productoform.css';

type ProductoFormData = Omit<Producto, 'id'> & { tipo?: 'clinico' | 'comercial' };

interface ProductoFormProps {
  onProductoAgregado?: () => void;
}

const ProductoForm: React.FC<ProductoFormProps> = ({
  onProductoAgregado,
}) => {
  const [producto, setProducto] = useState<ProductoFormData>({
    nombre: '',
    medida: '',
    lote: '',
    cantidad: 0,
    fechaVencimiento: '',
    categoria: 'Medicamento',
    stock: 0,
    tipoPresentacion: '',
    unidadMedida: '',
    ubicacion: '',
    proveedor: '',
    condicionesAlmacenamiento: '',
    codigo: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setProducto(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (tipo: 'clinico' | 'comercial') => {
    if (
      !producto.nombre ||
      !producto.medida ||
      !producto.lote ||
      !producto.fechaVencimiento
    ) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await crearProducto({ ...producto, tipo });
      alert(`Producto agregado correctamente como ${tipo}`);
      if (onProductoAgregado) {
        onProductoAgregado();
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear producto');
    }

    setProducto({
      nombre: '',
      medida: '',
      lote: '',
      cantidad: 0,
      fechaVencimiento: '',
      categoria: 'Medicamento',
      stock: 0,
      tipoPresentacion: '',
      unidadMedida: '',
      ubicacion: '',
      proveedor: '',
      condicionesAlmacenamiento: '',
      codigo: '',
    });
  };

  return (
    <div className="producto-form">
      <h2>Registrar Producto</h2>

      <div className="form-grid">
        <div className="input-group">
          <label>Nombre del producto</label>
          <input
            name="nombre"
            placeholder="Ej: Paracetamol"
            value={producto.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Medida / Presentación</label>
          <input
            name="medida"
            placeholder="Ej: 500mg / Tableta"
            value={producto.medida}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Lote</label>
          <input
            name="lote"
            placeholder="Introduce el lote"
            value={producto.lote}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Cantidad</label>
          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad inicial"
            value={producto.cantidad}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Stock mínimo</label>
          <input
            type="number"
            name="stock"
            placeholder="Alerta de stock"
            value={producto.stock}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Fecha de vencimiento</label>
          <input
            type="date"
            name="fechaVencimiento"
            value={producto.fechaVencimiento}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Categoría</label>
          <select
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
          >
            <option value="Medicamento">Medicamento</option>
            <option value="Insumo">Insumo</option>
            <option value="Equipo">Equipo</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tipo de presentación</label>
          <input
            name="tipoPresentacion"
            placeholder="Ej: Frasco, Blíster"
            value={producto.tipoPresentacion}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Unidad de medida</label>
          <input
            name="unidadMedida"
            placeholder="Ej: ml, mg, ud"
            value={producto.unidadMedida}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Ubicación</label>
          <input
            name="ubicacion"
            placeholder="Ej: Estante A1"
            value={producto.ubicacion}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Proveedor</label>
          <input
            name="proveedor"
            placeholder="Nombre del proveedor"
            value={producto.proveedor}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Condiciones de almacenamiento</label>
          <input
            name="condicionesAlmacenamiento"
            placeholder="Ej: Refrigerado, Seco"
            value={producto.condicionesAlmacenamiento}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Código interno</label>
          <input
            name="codigo"
            placeholder="Código de barras o ID"
            value={producto.codigo}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button onClick={() => handleSubmit('clinico')}>
            Agregar Clínico
          </button>

          <button onClick={() => handleSubmit('comercial')}>
            Agregar Comercial
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoForm;
