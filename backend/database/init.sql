CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  usuario TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('trabajador', 'supervisor')) NOT NULL,
  activo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  medida TEXT,
  lote TEXT,
  fecha_vencimiento DATE,
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  ubicacion TEXT,
  categoria TEXT DEFAULT 'Medicamento',
  tipo_presentacion TEXT,
  unidad_medida TEXT,
  proveedor TEXT,
  condiciones_almacenamiento TEXT,
  codigo TEXT,
  tipo TEXT CHECK (tipo IN ('clinico','comercial')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  cedula TEXT,
  area TEXT,
  cama TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retiros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  paciente_id INTEGER,
  usuario_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  tipo TEXT CHECK (tipo IN ('clinico','comercial')) NOT NULL,
  observacion TEXT,
  fecha_retiro DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS inventario_paciente (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER,
  producto_id INTEGER,
  cantidad INTEGER DEFAULT 0,
  ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  UNIQUE (paciente_id, producto_id)
);

-- Tabla para almacenar refresh tokens emitidos
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);