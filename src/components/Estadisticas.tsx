// components/EstadisticasRetiros.tsx
import React, { useState, useMemo } from 'react';
import { Producto } from '../types/Producto';
import '../styles/estadisticas.css';

// Definir la interfaz de retiros basada en tu formulario
interface RetiroData {
  nombre: string;
  tipoPresentacion: string;
  lote: string;
  cantidad: number;
  fechaRetiro: string;
  categoria?: 'Interno' | 'Paciente';
  paciente?: string;
  destino?: string;
  persona: {
    nombre: string;
    cargo: string;
  };
}

interface EstadisticasRetirosProps {
  productos?: Producto[];
  retiros?: RetiroData[];
  periodo?: 'hoy' | 'semana' | 'mes' | 'todo';
}

type TipoGrafico = 'barras' | 'pastel' | 'lineas';
type FiltroCargo = 'todos' | 'Enfermera' | 'Médico' | 'Técnico' | 'Administrativo' | 'Farmacéutico';

const EstadisticasRetiros: React.FC<EstadisticasRetirosProps> = ({
  productos = [],
  retiros = [],
  periodo = 'mes'
}) => {
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('barras');
  const [filtroCargo, setFiltroCargo] = useState<FiltroCargo>('todos');
  const [cantidadTop, setCantidadTop] = useState<number>(10);
  const [fechaInicio, setFechaInicio] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filtrar retiros por fechas
  const retirosFiltrados = useMemo(() => {
    return retiros.filter(retiro => {
      const fechaRetiro = new Date(retiro.fechaRetiro);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);

      // Filtrar por fecha
      if (fechaRetiro < inicio || fechaRetiro > fin) return false;

      // Filtrar por cargo
      if (filtroCargo !== 'todos' && retiro.persona.cargo !== filtroCargo) return false;

      return true;
    });
  }, [retiros, fechaInicio, fechaFin, filtroCargo]);

  // Calcular productos más retirados
  const productosMasRetirados = useMemo(() => {
    const acumulador: Record<string, {
      cantidadTotal: number;
      vecesRetirado: number;
      presentaciones: Set<string>;
      lotes: Set<string>;
      destinos: Set<string>;
      cargos: Set<string>;
    }> = {};

    retirosFiltrados.forEach(retiro => {
      if (!acumulador[retiro.nombre]) {
        acumulador[retiro.nombre] = {
          cantidadTotal: 0,
          vecesRetirado: 0,
          presentaciones: new Set(),
          lotes: new Set(),
          destinos: new Set(),
          cargos: new Set(),
        };
      }

      const producto = acumulador[retiro.nombre];
      producto.cantidadTotal += retiro.cantidad;
      producto.vecesRetirado += 1;
      producto.presentaciones.add(retiro.tipoPresentacion);
      producto.lotes.add(retiro.lote);
      if (retiro.destino) producto.destinos.add(retiro.destino);
      producto.cargos.add(retiro.persona.cargo);
    });

    // Convertir a array y ordenar
    return Object.entries(acumulador)
      .map(([nombre, datos]) => ({
        nombre,
        ...datos,
        presentaciones: Array.from(datos.presentaciones),
        lotes: Array.from(datos.lotes),
        destinos: Array.from(datos.destinos),
        cargos: Array.from(datos.cargos),
      }))
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
      .slice(0, cantidadTop);
  }, [retirosFiltrados, cantidadTop]);

  // Estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    const totalRetiros = retirosFiltrados.length;
    const totalUnidadesRetiradas = retirosFiltrados.reduce((sum, r) => sum + r.cantidad, 0);
    const promedioPorRetiro = totalRetiros > 0 ? totalUnidadesRetiradas / totalRetiros : 0;

    // Días con retiros
    const diasConRetiros = new Set(retirosFiltrados.map(r =>
      new Date(r.fechaRetiro).toDateString()
    )).size;

    // Producto más retirado
    const productoTop = productosMasRetirados[0];

    // Horas pico
    const horasRetiros = retirosFiltrados.map(r => {
      const fecha = new Date(r.fechaRetiro);
      return fecha.getHours();
    });

    const horaPico = horasRetiros.length > 0
      ? horasRetiros.reduce((a, b) =>
        horasRetiros.filter(v => v === a).length >= horasRetiros.filter(v => v === b).length ? a : b
      )
      : null;

    return {
      totalRetiros,
      totalUnidadesRetiradas,
      promedioPorRetiro: Math.round(promedioPorRetiro * 100) / 100,
      diasConRetiros,
      productoTop,
      horaPico,
    };
  }, [retirosFiltrados, productosMasRetirados]);

  // Datos para gráficos
  const datosGrafico = useMemo(() => {
    // Para el gráfico de pastel, calculamos los porcentajes
    if (tipoGrafico === 'pastel') {
      return productosMasRetirados.map(p => ({
        nombre: p.nombre,
        valor: p.cantidadTotal,
        porcentaje: (p.cantidadTotal / (estadisticasGenerales.totalUnidadesRetiradas || 1)) * 100
      }));
    }

    // Para otros gráficos, devolvemos una estructura simplificada pero consistente
    return productosMasRetirados.map(p => ({
      nombre: p.nombre,
      valor: p.cantidadTotal,
      porcentaje: (p.cantidadTotal / (estadisticasGenerales.totalUnidadesRetiradas || 1)) * 100
    }));
  }, [productosMasRetirados, tipoGrafico, estadisticasGenerales.totalUnidadesRetiradas]);

  // Colores para gráficos
  const colores = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
  ];

  // Renderizar gráfico de barras
  const renderGraficoBarras = () => {
    const maxCantidad = Math.max(...productosMasRetirados.map(p => p.cantidadTotal));

    return (
      <div className="grafico-barras">
        {productosMasRetirados.map((producto, index) => (
          <div key={producto.nombre} className="barra-item">
            <div className="barra-info">
              <span className="producto-nombre">{producto.nombre}</span>
              <span className="producto-cantidad">
                {producto.cantidadTotal} unidades ({producto.vecesRetirado} retiros)
              </span>
            </div>
            <div className="barra-container">
              <div
                className="barra"
                style={{
                  width: `${(producto.cantidadTotal / maxCantidad) * 100}%`,
                  backgroundColor: colores[index % colores.length]
                }}
              >
                <span className="barra-texto">{producto.cantidadTotal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar gráfico de pastel (simulado con CSS)
  const renderGraficoPastel = () => {
    let acumuladoAngulo = 0;

    return (
      <div className="grafico-pastel-container">
        <div className="grafico-pastel">
          {datosGrafico.map((dato, index) => {
            const porcentaje = dato.porcentaje;
            const angulo = (porcentaje / 100) * 360;
            const startAngle = acumuladoAngulo;
            acumuladoAngulo += angulo;

            return (
              <div
                key={dato.nombre}
                className="sectoro-pastel"
                style={{
                  backgroundColor: colores[index % colores.length],
                  transform: `rotate(${startAngle}deg)`,
                  clipPath: `conic-gradient(from ${startAngle}deg, transparent 0deg, 
                    ${colores[index % colores.length]} ${angulo}deg, transparent ${angulo}deg)`
                }}
              />
            );
          })}
        </div>
        <div className="leyenda-pastel">
          {datosGrafico.map((dato, index) => (
            <div key={dato.nombre} className="item-leyenda">
              <span
                className="color-leyenda"
                style={{ backgroundColor: colores[index % colores.length] }}
              />
              <span className="nombre-leyenda">{dato.nombre}</span>
              <span className="valor-leyenda">
                {dato.valor} ({dato.porcentaje.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar gráfico de líneas (tendencia mensual)
  const renderGraficoLineas = () => {
    // Agrupar por día
    const retirosPorDia: Record<string, number> = {};

    retirosFiltrados.forEach(retiro => {
      const fecha = new Date(retiro.fechaRetiro).toLocaleDateString('es-ES');
      if (!retirosPorDia[fecha]) {
        retirosPorDia[fecha] = 0;
      }
      retirosPorDia[fecha] += retiro.cantidad;
    });

    const fechas = Object.keys(retirosPorDia).sort();
    const valores = fechas.map(fecha => retirosPorDia[fecha]);
    const maxValor = Math.max(...valores);

    return (
      <div className="grafico-lineas">
        <div className="eje-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="marca-y">
              {Math.round(maxValor * (i / 4))}
            </div>
          ))}
        </div>
        <div className="contenido-lineas">
          {valores.map((valor, index) => (
            <div key={index} className="punto-linea">
              <div
                className="punto"
                style={{
                  bottom: `${(valor / maxValor) * 100}%`,
                  backgroundColor: colores[0]
                }}
                title={`${fechas[index]}: ${valor} unidades`}
              />
              {index < valores.length - 1 && (
                <div
                  className="linea"
                  style={{
                    height: `${Math.abs((valores[index + 1] - valor) / maxValor) * 50}%`,
                    top: `${(Math.min(valor, valores[index + 1]) / maxValor) * 100}%`,
                    backgroundColor: colores[0]
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="eje-x">
          {fechas.map((fecha, index) => (
            <div key={index} className="marca-x">
              {new Date(fecha).getDate()}/{new Date(fecha).getMonth() + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar el gráfico seleccionado
  const renderGrafico = () => {
    switch (tipoGrafico) {
      case 'barras':
        return renderGraficoBarras();
      case 'pastel':
        return renderGraficoPastel();
      case 'lineas':
        return renderGraficoLineas();
      default:
        return renderGraficoBarras();
    }
  };

  if (retiros.length === 0) {
    return (
      <div className="estadisticas-retiros sin-datos">
        <h2>📊 Estadísticas de Retiros</h2>
        <div className="mensaje-vacio">
          No hay datos de retiros disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="estadisticas-retiros">
      <div className="estadisticas-header">
        <h2>📊 Análisis de Productos Más Retirados</h2>
        <p className="subtitulo">
          Período: {new Date(fechaInicio).toLocaleDateString()} - {new Date(fechaFin).toLocaleDateString()}
        </p>
      </div>

      {/* Filtros y controles */}
      <div className="controles-estadisticas">
        <div className="filtros-fecha">
          <div className="filtro-grupo">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input-fecha"
            />
          </div>
          <div className="filtro-grupo">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input-fecha"
            />
          </div>
        </div>

        <div className="filtros-avanzados">
          <div className="filtro-grupo">
            <label>Tipo de Gráfico:</label>
            <select
              value={tipoGrafico}
              onChange={(e) => setTipoGrafico(e.target.value as TipoGrafico)}
              className="select-filtro"
            >
              <option value="barras">Barras</option>
              <option value="pastel">Pastel</option>
              <option value="lineas">Líneas (Tendencia)</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Filtrar por Cargo:</label>
            <select
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value as FiltroCargo)}
              className="select-filtro"
            >
              <option value="todos">Todos los cargos</option>
              <option value="Enfermera">Enfermera</option>
              <option value="Médico">Médico</option>
              <option value="Técnico">Técnico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Farmacéutico">Farmacéutico</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Top Productos:</label>
            <select
              value={cantidadTop}
              onChange={(e) => setCantidadTop(Number(e.target.value))}
              className="select-filtro"
            >
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="15">Top 15</option>
              <option value="20">Top 20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="estadisticas-generales">
        <div className="estadistica-card">
          <div className="estadistica-icono">📋</div>
          <div className="estadistica-contenido">
            <h3>Total Retiros</h3>
            <div className="estadistica-valor">{estadisticasGenerales.totalRetiros}</div>
            <p>Registros en el período</p>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">📦</div>
          <div className="estadistica-contenido">
            <h3>Unidades Retiradas</h3>
            <div className="estadistica-valor">{estadisticasGenerales.totalUnidadesRetiradas}</div>
            <p>Total de unidades</p>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">📊</div>
          <div className="estadistica-contenido">
            <h3>Promedio por Retiro</h3>
            <div className="estadistica-valor">{estadisticasGenerales.promedioPorRetiro}</div>
            <p>Unidades/retiro</p>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">📅</div>
          <div className="estadistica-contenido">
            <h3>Días Activos</h3>
            <div className="estadistica-valor">{estadisticasGenerales.diasConRetiros}</div>
            <p>Días con retiros</p>
          </div>
        </div>
      </div>

      {/* Producto más retirado destacado */}
      {estadisticasGenerales.productoTop && (
        <div className="producto-destacado">
          <div className="destacado-header">
            <h3>🏆 Producto Más Retirado</h3>
            <span className="badge-destacado">#1</span>
          </div>
          <div className="destacado-contenido">
            <div className="destacado-info">
              <h4>{estadisticasGenerales.productoTop.nombre}</h4>
              <div className="destacado-metricas">
                <div className="metrica">
                  <span className="metrica-label">Total Unidades:</span>
                  <span className="metrica-valor">{estadisticasGenerales.productoTop.cantidadTotal}</span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Veces Retirado:</span>
                  <span className="metrica-valor">{estadisticasGenerales.productoTop.vecesRetirado}</span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Presentaciones:</span>
                  <span className="metrica-valor">
                    {estadisticasGenerales.productoTop.presentaciones.join(', ')}
                  </span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Cargos que lo retiran:</span>
                  <span className="metrica-valor">
                    {estadisticasGenerales.productoTop.cargos.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="grafico-container">
        <div className="grafico-header">
          <h3>Ranking de Productos por Unidades Retiradas</h3>
          <div className="grafico-controles">
            <span className="periodo-info">
              {retirosFiltrados.length} retiros analizados
            </span>
          </div>
        </div>
        <div className="grafico-contenido">
          {renderGrafico()}
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="tabla-detallada">
        <h3>📋 Detalle por Producto</h3>
        <div className="table-responsive">
          <table className="tabla-estadisticas">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Unidades Retiradas</th>
                <th>Veces Retirado</th>
                <th>Promedio por Retiro</th>
                <th>Presentaciones</th>
                <th>Lotes</th>
                <th>Destinos</th>
                <th>Cargos</th>
              </tr>
            </thead>
            <tbody>
              {productosMasRetirados.map((producto, index) => (
                <tr key={producto.nombre}>
                  <td className="ranking-cell">
                    <span className={`ranking-badge ranking-${index + 1}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="producto-cell">
                    <strong>{producto.nombre}</strong>
                  </td>
                  <td className="unidades-cell">
                    <span className="valor-destacado">{producto.cantidadTotal}</span>
                  </td>
                  <td>{producto.vecesRetirado}</td>
                  <td>
                    {Math.round((producto.cantidadTotal / producto.vecesRetirado) * 100) / 100}
                  </td>
                  <td>
                    <div className="badges-container">
                      {producto.presentaciones.map((p, i) => (
                        <span key={i} className="badge-presentacion">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="badges-container">
                      {producto.lotes.map((l, i) => (
                        <span key={i} className="badge-lote">
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="badges-container">
                      {producto.destinos.map((d, i) => (
                        <span key={i} className="badge-destino">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="badges-container">
                      {producto.cargos.map((c, i) => (
                        <span key={i} className="badge-cargo">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen y recomendaciones */}
      <div className="recomendaciones">
        <h3>📈 Insights y Recomendaciones</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📦</div>
            <div className="insight-content">
              <h4>Gestión de Stock</h4>
              <p>
                El {estadisticasGenerales.productoTop ?
                  `"${estadisticasGenerales.productoTop.nombre}"` : 'producto principal'}
                representa el {estadisticasGenerales.productoTop ?
                  ((estadisticasGenerales.productoTop.cantidadTotal / estadisticasGenerales.totalUnidadesRetiradas) * 100).toFixed(1) : '0'}%
                de los retiros totales.
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <h4>Horario de Mayor Demanda</h4>
              <p>
                La mayoría de los retiros ocurren {estadisticasGenerales.horaPico !== null ?
                  `entre las ${estadisticasGenerales.horaPico}:00 y ${estadisticasGenerales.horaPico + 1}:00 horas` :
                  'en diferentes horarios'}.
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <div className="insight-content">
              <h4>Perfil de Usuarios</h4>
              <p>
                {estadisticasGenerales.productoTop ?
                  `${estadisticasGenerales.productoTop.cargos.join(', ')}` : 'Diferentes cargos'}
                son los principales responsables de los retiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasRetiros;