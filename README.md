# 🚀 Quadra Cloud - Control de Caja & Finanzas SaaS

Plataforma SaaS moderna y robusta para la gestión financiera, control de turnos de caja, arqueos y conciliación bancaria para comercios, restaurantes y negocios independientes (ej: *La Papería*, *Café Central & Bakery*).

![Quadra Cloud Logo](https://img.shields.io/badge/Quadra-Cloud-10b981?style=for-the-badge&logo=cloud&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 🌟 Características Principales

### 🏢 1. Arquitectura Multi-Tenant (Múltiples Empresas)
- Cada cliente registrado (*La Papería*, *Café Central*, etc.) opera en un **espacio de trabajo completamente aislado**.
- Selección y conmutación ágil de empresas en el portal de acceso.
- Módulo de auto-registro para nuevas empresas con catálogo de cuentas sugerido según la industria (Restaurantes, Cafeterías, Tiendas, Servicios).

### 💵 2. Perfil de Cajero (Operativo & Arqueos)
- Interfaz simplificada y amigable para operarios de turno.
- **Contador Dinámico de Billetes y Monedas** colombianas ($100k, $50k, $20k, $10k, $5k, $2k).
- Registro de ventas por datáfono y canales digitales (Nequi, Daviplata, Bold).
- Cálculo automático de descuadres en tiempo real (Faltante / Sobrante / Cuadrado).
- Registro de gastos de turno y nómina pagada en el día.

### 🛡️ 3. Perfil de Administrador (Gerencia Financiera)
- **Dashboard Ejecutivo:** Consulta de acumulados por Día, Semana, Mes, Año o Histórico Total.
- **Conciliación de Liquidez:** Diferenciación precisa entre **Caja Física (Efectivo)** y **Bancos / Digital (Nequi/Didi/Tarjetas)**.
- **Aprobación de Cierres:** Auditoría y aprobación de turnos de cajeros con inyección automática al libro contable.
- **Libro de Movimientos:** Registro categorizado de entradas y salidas con búsqueda y filtrado.
- **Control de Acceso por PIN:** Teclado táctil de seguridad para desbloqueo de vistas gerenciales.
- **Gestión de Personal & Accesos:** Registro y modificación de claves/PIN para cajeros y colaboradores.

### 🔐 4. Autenticación & Seguridad
- Inicio de sesión por correo electrónico y contraseña.
- **Flujo de Recuperación de Contraseña:** Restablecimiento seguro con código OTP de 6 dígitos.
- Separación estricta de roles (`admin` vs `cajero`).

### ☁️ 5. Base de Datos en la Nube (Supabase Cloud)
- Tablas PostgreSQL con soporte para tiempo real (`companies`, `app_users`, `categories`, `transactions`, `daily_closes`).
- Script SQL automatizado incluido en el proyecto (`supabase_schema.sql`).
- Modo híbrido (persistencia en la nube con respaldo local para funcionamiento offline).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite, Lucide Icons.
- **Estilos:** CSS Vanilla con diseño moderno (Glassmorphism, dark theme, micro-animaciones).
- **Backend / Database:** Supabase PostgreSQL + Realtime.
- **Exportación:** Soporte para respaldo JSON y hojas de cálculo Excel.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/juanse9402/gastos.git
cd gastos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz (puedes guiarte de `.env.example`):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key-aqui
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173/`.

---

## 👥 Cuentas de Demostración

| Empresa | Rol | Correo | Clave |
| :--- | :--- | :--- | :--- |
| **🍟 La Papería** | Administrador | `admin@lapaperia.com` | `1234` |
| **🍟 La Papería** | Cajero | `cajero@lapaperia.com` | `1234` |
| **☕ Café Central** | Administrador | `gerencia@cafecentral.com` | `1234` |
| **☕ Café Central** | Cajero | `caja@cafecentral.com` | `1234` |

---

## 📄 Licencia

Este proyecto fue desarrollado como software a la medida para control financiero multi-empresa.
