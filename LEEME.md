# Plataforma UAA · Colegio Particular EDUCENTER
## Guía de puesta en marcha (Supabase + Google Workspace + Vercel)

Tiempo estimado: 1 a 2 horas. Se necesitan tres cuentas. Conviene crearlas con un correo institucional del colegio, no con uno personal, para que la plataforma no dependa de una persona:

- **Supabase** (base de datos): supabase.com
- **Vercel** (publicación del sitio): vercel.com
- **Google Cloud** (inicio de sesión con Google): console.cloud.google.com, con la cuenta de quien administra Google Workspace del colegio

### Qué contiene esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La plataforma |
| `config.js` | Datos de conexión con Supabase (se completa en el paso 5) |
| `supabase.js` | Librería de conexión con Supabase (incluida, no depende de otros sitios) |
| `api/claude.js` | Consulta a Claude para analizar episodios frente al PAEC (opcional) |
| `vercel.json` | Reglas de seguridad del sitio |
| `supabase/01_estructura.sql` | Tablas y permisos por rol |
| `supabase/02_datos_iniciales.sql` | Colegio, equipo y correos de acceso |

---

### Paso 1 · Crear el proyecto en Supabase
1. En supabase.com, crea una organización y un proyecto nuevo. Nombre sugerido: `uaa-educenter`.
2. Región: **South America (São Paulo)**, la más cercana a Chile.
3. Guarda la contraseña de la base de datos en un lugar seguro.
4. Plan: el gratuito sirve para probar. Para datos reales de estudiantes se recomienda el plan pagado, porque incluye respaldos diarios automáticos y el proyecto no se pausa por inactividad. Revisa los precios vigentes antes de contratar.

### Paso 2 · Crear las tablas y los permisos
1. En Supabase, abre **SQL Editor › New query**.
2. Copia todo el contenido de `supabase/01_estructura.sql`, pégalo y presiona **Run**. Debe terminar sin errores.
3. Abre `supabase/02_datos_iniciales.sql` y **revisa los correos**:
   - Cambia `educenter.cl` por el dominio real del colegio, si es distinto.
   - Corrige la parte antes de la @ de cada persona (viene como `nombre.apellido`).
4. Pega ese archivo en una consulta nueva y presiona **Run**. Al final debe mostrar 7 personas: 1 de coordinación, 4 profesionales y 2 de dirección.

### Paso 3 · Configurar el inicio de sesión con Google (Google Cloud)
Lo hace quien administra Google Workspace del colegio.
1. En console.cloud.google.com, crea un proyecto llamado `UAA EDUCENTER`.
2. Ve a **Google Auth Platform** (antes "Pantalla de consentimiento de OAuth"):
   - Nombre de la aplicación: `Plataforma UAA EDUCENTER`
   - Correo de asistencia: un correo del colegio
   - Público: **Interno**. Con esto solo pueden entrar cuentas del dominio del colegio y Google no pide verificación.
3. Ve a **Clientes › Crear cliente › Aplicación web**:
   - Orígenes autorizados de JavaScript: la dirección del sitio en Vercel (paso 5), por ejemplo `https://uaa-educenter.vercel.app`
   - URI de redireccionamiento autorizados: `https://TU-PROYECTO.supabase.co/auth/v1/callback` (la dirección de tu proyecto aparece en Supabase › Project Settings › API)
4. Copia el **ID de cliente** y el **secreto del cliente**.

### Paso 4 · Conectar Google con Supabase
1. En Supabase, abre **Authentication › Sign In / Providers › Google**, actívalo y pega el ID y el secreto del paso 3.
2. En **Authentication › URL Configuration**:
   - Site URL: la dirección del sitio en Vercel
   - Redirect URLs: agrega esa misma dirección
3. Deja desactivado el ingreso con correo y contraseña. Solo se usará Google.

### Paso 5 · Publicar en Vercel
1. Abre `config.js` y completa:
   - `supabaseUrl`: Supabase › Project Settings › API › Project URL
   - `supabaseAnonKey`: la clave **anon public**. En proyectos nuevos puede aparecer como "publishable key". Nunca uses la clave *service_role* ni la *secret*.
   - `dominio`: el dominio de Google Workspace del colegio
2. Publica la carpeta con una de estas dos opciones:
   - **Opción A, sin programar:** crea un repositorio privado en GitHub, sube todos los archivos de esta carpeta y en Vercel elige **Add New › Project › Import** de ese repositorio. No hay que configurar comandos de construcción.
   - **Opción B, con terminal:** dentro de la carpeta ejecuta `npx vercel --prod`.
3. Si Vercel entrega una dirección distinta a la que usaste en los pasos 3 y 4, actualízala en Google Cloud y en Supabase.
4. Opcional: en Vercel › Settings › Domains puedes usar un subdominio propio, por ejemplo `uaa.educenter.cl`. Si lo haces, actualiza también las direcciones de los pasos 3 y 4.

### Paso 6 · Activar el análisis con Claude (opcional)
El análisis de episodios frente al PAEC funciona sin esto con las reglas de la plataforma. Para agregar la consulta a Claude:
1. Crea una clave en console.anthropic.com. Conviene fijar un límite de gasto mensual.
2. En Vercel › Settings › Environment Variables agrega:
   - `ANTHROPIC_API_KEY`: la clave de Anthropic
   - `SUPABASE_URL`: la misma dirección de `config.js`
   - `SUPABASE_ANON_KEY`: la misma clave de `config.js`
   - `ANTHROPIC_MODEL` (opcional): por defecto `claude-sonnet-5`
3. Vuelve a publicar (Deployments › Redeploy).

La plataforma envía los episodios **sin nombres ni RUN**. La clave de Anthropic queda en el servidor y no llega al navegador. Solo el equipo de la unidad puede usar la consulta; la dirección no.

### Paso 7 · Primer ingreso y prueba
1. Constanza entra con su cuenta de Google y revisa que vea **Inicio, Estudiantes, Agenda, Trabajo e Indicadores**.
2. Un profesional entra y revisa que vea su panel ("Hola, …").
3. Danny o Eliseo entran y revisan que vean solo **Visión general**, sin nombres de estudiantes.
4. Alguien con una cuenta que no está en la lista debe ver "Tu cuenta aún no tiene acceso".

Si registraron datos en la versión de prueba y quieren traerlos: en la versión de prueba, Constanza copia sus datos desde Respaldo › Exportar. Luego, en la versión nueva, los pega en Respaldo › Restaurar.

---

### Cómo quedan los permisos (se aplican en la base de datos, no solo en pantalla)

| | Coordinación | Profesionales | Dirección |
|---|---|---|---|
| Ver estudiantes y registros | Sí | Sí | **No** (solo cifras agregadas) |
| Registrar y editar | Sí | Sí | No |
| Eliminar estudiantes | Sí | No | No |
| Cambiar datos del colegio y del equipo | Sí | No | No |
| Dar acceso a nuevos integrantes | Sí (profesionales) | No | No |
| Ver el registro de auditoría | Sí | Sí | Solo sus revisiones |
| Editar o borrar la auditoría | **Nadie** | **Nadie** | **Nadie** |

- **Auditoría inalterable:** cada acción queda con la hora del servidor y el correo de quien la hizo. Nadie puede modificar ni borrar esos registros desde la plataforma.
- **Historial de versiones:** se guarda una copia de cada ficha por hora de trabajo, y siempre antes de eliminar algo. Está en la tabla `app_data_historial`, que solo ve la coordinación. Sirve como evidencia y para recuperar información.
- **Trabajo simultáneo:** si dos personas editan al mismo estudiante al mismo tiempo, la plataforma combina ambos cambios y avisa. Los cambios de otros aparecen solos, sin recargar.
- **Folios:** son correlativos y únicos para todo el colegio.

### Administración del día a día
- **Nuevo integrante:** la coordinación lo agrega en Indicadores › Agregar integrante, con su correo institucional. El acceso queda habilitado de inmediato.
- **Quitar un acceso** (por ejemplo, cuando alguien deja el colegio): en Supabase › Table Editor › `perfiles`, cambia `activo` a `false`. Conviene además suspender su cuenta en Google Workspace.
- **Cambiar a la dirección** (sostenedor o administrador): solo se puede en Supabase › Table Editor › `perfiles`. La plataforma no lo permite, como resguardo.
- **Respaldo mensual:** la coordinación copia sus datos desde Respaldo › Exportar y los guarda en una carpeta restringida del Drive institucional.

### Protección de datos (Ley 19.628 y Ley 21.719)
Supabase, Vercel y, si se activa, Anthropic tratan datos por encargo del colegio. Se recomienda:
- dejar constancia de estos proveedores en el registro de tratamiento de datos del colegio;
- revisar sus condiciones de tratamiento de datos;
- mantener vigente la autorización de las familias para tratar datos sensibles, que la plataforma controla por estudiante.

Esta guía no reemplaza una revisión legal.
