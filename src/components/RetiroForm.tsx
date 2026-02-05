import React, { useState, useEffect } from "react";
import { Producto } from "../types/Producto";
import { crearRetiro, obtenerRetiros, obtenerProductosRetiro } from "../services/retirosService";
import "../styles/productoform.css";

interface RetiroData {
  nombre: string;
  tipoPresentacion: string;
  lote: string;
  cantidad: number;
  unidadMedida?: string;
  fechaRetiro: string;
  paciente?: string;
  destino?: string;
  persona: {
    nombre: string;
    cargo: string;
  };
}

interface RetiroFormProps {
  productos?: Producto[];
  onRetiroGuardado?: () => void;
}

const RetiroForm: React.FC<RetiroFormProps> = ({ productos = [], onRetiroGuardado }) => {
  const [form, setForm] = useState({
    nombre: "",
    tipoPresentacion: "",
    lote: "",
    cantidad: 1,
    unidadMedida: "",
    fechaRetiro: new Date().toISOString().split("T")[0],
    paciente: "",
    destino: "",
    persona: {
      nombre: "",
      cargo: "",
    },
  });

  // Estados para opciones dinámicas
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [presentacionesDisponibles, setPresentacionesDisponibles] = useState<string[]>([]);
  const [lotesDisponibles, setLotesDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos desde la base de datos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await obtenerProductosRetiro();
        console.log('Datos recibidos:', data);
        // Mapear campos del backend al formato del frontend
        if (Array.isArray(data) && data.length > 0) {
          const productosMapeados = data.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            medida: p.medida || p.tipo_presentacion || p.unidad_medida || '',
            lote: p.lote,
            cantidad: p.cantidad !== undefined ? p.cantidad : p.stock_actual,
            fechaVencimiento: p.fecha_vencimiento,
            categoria: p.categoria,
            stock: p.stock_minimo || 0,
            tipoPresentacion: p.tipo_presentacion,
            unidadMedida: p.unidad_medida,
          }));
          setProductosDisponibles(productosMapeados.filter((p: any) => p.cantidad > 0));
          setError(null);
        } else {
          setProductosDisponibles([]);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar productos: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Inicializar productos disponibles cuando se reciben como props
  useEffect(() => {
    if (productos && productos.length > 0) {
      setProductosDisponibles(productos.filter(p => p.cantidad > 0));
    }
  }, [productos]);

  // Cuando cambia el producto seleccionado
  const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombreSeleccionado = e.target.value;
    const productosFiltrados = productosDisponibles.filter(p => p.nombre === nombreSeleccionado && p.cantidad > 0);

    // Obtener presentaciones únicas
    const presentaciones = Array.from(
      new Set(productosFiltrados.map(p => p.medida))
    ).filter(Boolean);

    // Obtener lotes únicos
    const lotes = Array.from(
      new Set(productosFiltrados.map(p => p.lote))
    ).filter(Boolean);

    setPresentacionesDisponibles(presentaciones);
    setLotesDisponibles(lotes);

    setForm({
      ...form,
      nombre: nombreSeleccionado,
      tipoPresentacion: presentaciones.length === 1 ? presentaciones[0] : "",
      lote: lotes.length === 1 ? lotes[0] : "",
      cantidad: 1,
    });
  };

  // Cuando cambia la presentación
  const handlePresentacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presentacion = e.target.value;
    const productosFiltrados = productosDisponibles.filter(
      p => p.nombre === form.nombre &&
        p.medida === presentacion &&
        p.cantidad > 0
    );

    const lotes = Array.from(
      new Set(productosFiltrados.map(p => p.lote))
    ).filter(Boolean);

    setLotesDisponibles(lotes);

    setForm({
      ...form,
      tipoPresentacion: presentacion,
      lote: lotes.length === 1 ? lotes[0] : "",
      cantidad: 1,
    });
  };

  // Cuando cambia el lote
  const handleLoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({
      ...form,
      lote: e.target.value,
      cantidad: 1,
    });
  };

  // Manejar cambios generales
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "personaNombre") {
      setForm({
        ...form,
        persona: { ...form.persona, nombre: value }
      });
    } else if (name === "personaCargo") {
      setForm({
        ...form,
        persona: { ...form.persona, cargo: value }
      });
    } else {
      let newValue: string | number = value;
      if (name === "cantidad") {
        newValue = parseInt(value) || 1;
      }

      const updatedForm = { ...form, [name]: newValue };

      // Si el cargo es "Paciente" y el nombre de la persona está escrito, sincronizar con paciente
      if (name === "personaNombre" && form.persona.cargo === "Paciente") {
        updatedForm.paciente = value;
      }

      setForm(updatedForm);
    }
  };

  // Efecto para sincronizar cuando cambia el cargo a Paciente
  useEffect(() => {
    if (form.persona.cargo === "Paciente" && form.persona.nombre) {
      setForm(prev => ({ ...prev, paciente: prev.persona.nombre }));
    }
  }, [form.persona.cargo]);

  // Obtener producto seleccionado para validar cantidad máxima
  const productoSeleccionado = productosDisponibles.find(
    p => p.nombre === form.nombre &&
      p.medida === form.tipoPresentacion &&
      p.lote === form.lote
  );

  // Cantidad máxima disponible
  const cantidadMaxima = productoSeleccionado?.cantidad || 0;

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre || !form.persona.nombre || !form.persona.cargo || !form.fechaRetiro) {
      alert("❌ Por favor complete todos los campos obligatorios (*)");
      return;
    }

    if (form.cantidad <= 0) {
      alert("❌ La cantidad debe ser mayor a 0");
      return;
    }

    if (form.cantidad > cantidadMaxima) {
      alert(`❌ No hay suficiente cantidad disponible. Máximo: ${cantidadMaxima}`);
      return;
    }

    // Crear objeto RetiroData
    const data = {
      nombre: form.nombre,
      tipoPresentacion: form.tipoPresentacion,
      lote: form.lote,
      cantidad: form.cantidad,
      unidadMedida: form.unidadMedida,
      fechaRetiro: form.fechaRetiro,
      paciente: form.paciente.trim() || undefined,
      destino: form.destino.trim() || undefined,
      persona: {
        nombre: form.persona.nombre,
        cargo: form.persona.cargo,
      },
    };

    try {
      await crearRetiro(data);
      alert("✅ Retiro registrado correctamente");
      if (onRetiroGuardado) {
        onRetiroGuardado();
      }
      
      // Resetear formulario (mantener fecha actual)
      setForm({
        nombre: "",
        tipoPresentacion: "",
        lote: "",
        cantidad: 1,
        unidadMedida: "",
        fechaRetiro: new Date().toISOString().split("T")[0],
        paciente: "",
        destino: "",
        persona: {
          nombre: "",
          cargo: "",
        },
      });

      // Resetear opciones dinámicas
      setPresentacionesDisponibles([]);
      setLotesDisponibles([]);
    } catch (error) {
      console.error('Error al crear retiro:', error);
      alert("❌ Error al registrar el retiro");
    }
  };

  if (loading) {
    return (
      <div className="retiro-form-container">
        <div className="loading-message">Cargando productos...</div>
      </div>
    );
  }

  // Si hay error pero hay productos de props, usar esos
  if (error && productos.length > 0) {
    setError(null);
  }

  if (error && productos.length === 0) {
    return (
      <div className="retiro-form-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="retiro-form-container">
      <form onSubmit={handleSubmit} className="producto-form">
        <h2 className="form-title">📋 Formulario de Retiro de Productos</h2>

        {/* Información del Producto */}
        <div className="form-section">
          <h3 className="section-title">📦 Información del Producto</h3>

          {/* Producto */}
          <div className="form-group">
            <label><strong>Producto *</strong></label>
            <select
              name="nombre"
              value={form.nombre}
              onChange={handleProductoChange}
              required
              className="form-input"
            >
              <option value="">Seleccione un producto</option>
              {Array.from(new Set(productosDisponibles.map(p => p.nombre))).map((nombre, idx) => (
                <option key={idx} value={nombre}>
                  {nombre} ({productosDisponibles.filter(p => p.nombre === nombre).length} opciones)
                </option>
              ))}
            </select>
          </div>

          {/* Presentación/Medida */}
          {form.nombre && presentacionesDisponibles.length > 0 && (
            <div className="form-group">
              <label><strong>Presentación/Medida *</strong></label>
              <select
                name="tipoPresentacion"
                value={form.tipoPresentacion}
                onChange={handlePresentacionChange}
                required
                className="form-input"
              >
                <option value="">Seleccione presentación</option>
                {presentacionesDisponibles.map((presentacion, idx) => (
                  <option key={idx} value={presentacion}>
                    {presentacion}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lote */}
          {form.tipoPresentacion && lotesDisponibles.length > 0 && (
            <div className="form-group">
              <label><strong>Lote/Número de Serie *</strong></label>
              <select
                name="lote"
                value={form.lote}
                onChange={handleLoteChange}
                required
                className="form-input"
              >
                <option value="">Seleccione lote</option>
                {lotesDisponibles.map((lote, idx) => (
                  <option key={idx} value={lote}>
                    {lote}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cantidad y Unidad */}
          <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>
                <strong>Cantidad *</strong>
                {productoSeleccionado && (
                  <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "4px" }}>
                    (Stock: {cantidadMaxima})
                  </span>
                )}
              </label>
              <input
                type="number"
                name="cantidad"
                min="1"
                max={cantidadMaxima}
                value={form.cantidad}
                onChange={handleChange}
                required
                disabled={!form.nombre || !form.tipoPresentacion || !form.lote}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label><strong>Unidad (Opcional)</strong></label>
              <select
                name="unidadMedida"
                value={form.unidadMedida}
                onChange={handleChange}
                className="form-input"
                disabled={!form.nombre}
              >
                <option value="">Seleccione unidad</option>
                <option value="mg">Miligramos (mg)</option>
                <option value="g">Gramos (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unid">Unidades</option>
                <option value="comp">Comprimidos</option>
                <option value="amp">Ampollas</option>
              </select>
            </div>
          </div>

          {/* Fecha de Retiro */}
          <div className="form-group">
            <label><strong>Fecha de Retiro *</strong></label>
            <input
              type="date"
              name="fechaRetiro"
              value={form.fechaRetiro}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Información del Destino */}
        <div className="form-section">
          <h3 className="section-title">📍 Información del Destino</h3>

          {/* Lugar de Destino */}
          <div className="form-group">
            <label><strong>Lugar de Destino</strong></label>
            <select
              name="destino"
              value={form.destino}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Seleccione un destino</option>
              <option value="Emergencia">Emergencia</option>
              <option value="UCI">UCI</option>
              <option value="Quirófano">Quirófano</option>
              <option value="Hospitalización">Hospitalización</option>
              <option value="Consulta Externa">Consulta Externa</option>
              <option value="Farmacia">Farmacia</option>
              <option value="Paciente">Paciente</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Paciente (opcional) */}
          <div className="form-group">
            <label><strong>Nombre del Paciente (opcional)</strong></label>
            <input
              type="text"
              name="paciente"
              value={form.paciente}
              onChange={handleChange}
              placeholder="Nombre completo del paciente"
              className="form-input"
            />
          </div>
        </div>

        {/* Información de la Persona que Retira */}
        <div className="form-section">
          <h3 className="section-title">👤 Información de la Persona que Retira</h3>

          {/* Nombre */}
          <div className="form-group">
            <label><strong>Nombre de la Persona *</strong></label>
            <input
              type="text"
              name="personaNombre"
              value={form.persona.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              className="form-input"
            />
          </div>

          {/* Cargo */}
          <div className="form-group">
            <label><strong>Cargo *</strong></label>
            <select
              name="personaCargo"
              value={form.persona.cargo}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Seleccione cargo</option>
              <option value="Enfermera">Enfermera</option>
              <option value="Médico">Médico</option>
              <option value="Técnico">Técnico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Farmacéutico">Farmacéutico</option>
              <option value="Paciente">Paciente</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Información del Producto Seleccionado */}
        {productoSeleccionado && (
          <div className="producto-info-card">
            <h3 className="section-title">📊 Información del Producto Seleccionado</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Producto:</span>
                <span className="info-value">{productoSeleccionado.nombre}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Presentación:</span>
                <span className="info-value">{productoSeleccionado.medida}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Lote:</span>
                <span className="info-value badge">{productoSeleccionado.lote}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Disponible:</span>
                <span className="info-value cantidad-disponible">{productoSeleccionado.cantidad} unidades</span>
              </div>
              <div className="info-item">
                <span className="info-label">Categoría:</span>
                <span className="info-value">{productoSeleccionado.categoria}</span>
              </div>
              {productoSeleccionado.fechaVencimiento && (
                <div className="info-item">
                  <span className="info-label">Vencimiento:</span>
                  <span className="info-value">
                    {new Date(productoSeleccionado.fechaVencimiento).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => {
              setForm({
                nombre: "",
                tipoPresentacion: "",
                lote: "",
                cantidad: 1,
                unidadMedida: "",
                fechaRetiro: new Date().toISOString().split("T")[0],
                paciente: "",
                destino: "",
                persona: {
                  nombre: "",
                  cargo: "",
                },
              });
              setPresentacionesDisponibles([]);
              setLotesDisponibles([]);
            }}
            className="btn btn-secondary"
          >
            Limpiar Formulario
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !form.nombre ||
              !form.tipoPresentacion ||
              !form.lote ||
              !form.persona.nombre ||
              !form.persona.cargo ||
              !form.fechaRetiro ||
              form.cantidad <= 0
            }
          >
            ✅ Registrar Retiro
          </button>
        </div>
      </form>
    </div>
  );
};

export default RetiroForm;
