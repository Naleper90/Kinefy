# Checklist de Correcciones (Documentación y Proyecto)

Esta es la lista de tareas manuales que debes realizar para pulir el proyecto antes del viernes 22, dividida entre correcciones de documentación, mejoras técnicas del código y requisitos de entrega.

## 📝 PARTE 1: Mejoras de Documentación

### Documento: `05-diseno.md`
- [x] **Añadir Tabla de API:** Crear una tabla en Markdown debajo del apartado 5.3.1 con las columnas: `MÉTODO` | `ENDPOINT` | `DESCRIPCIÓN` | `REQUIERE TOKEN`. (Escribir al menos 4-5 endpoints reales de tu backend).

### Documento: `08-despliegue-eval.md` (¡CRÍTICO!)
> **Paso previo obligatorio:** Abre la aplicación **Docker Desktop** en tu ordenador y espera a que el icono se ponga verde. Luego abre una terminal en la carpeta de Kinefy y lanza el comando: `docker compose up -d`

- [ ] **Cambiar ID de Docker:** Borrar el ID inventado `1c2d3e4f5g6h` en la sección "Comprobación de Puertos". Ejecuta `docker ps` en tu terminal, copia toda la salida real y pégala en el documento.
- [ ] **Captura Real de cURL:** En la sección "Verificación del Backend", ejecuta el comando `curl -I http://localhost:3000/api/patients` en tu terminal y pega el resultado exacto (debería salir un error 401, que es lo correcto para demostrar seguridad).
- [ ] **Log Real de Vite:** Ejecuta `docker logs kinefy_frontend_1 --tail 5` (asegúrate de que el nombre del contenedor coincide con el que te salió en el `docker ps`). Copia tu log real y pégalo.

### Documento: `09-manual-usuario.md`
- [ ] **Insertar Captura Login:** Buscar el texto `[INSERTA AQUÍ CAPTURA GENERAL DEL LOGIN...]` y cambiarlo por la imagen real.
- [ ] **Insertar Captura Fisio (Lista Pacientes):** Reemplazar placeholder.
- [ ] **Insertar Captura Fisio (Biblioteca):** Reemplazar placeholder.
- [ ] **Insertar Captura Fisio (Informes):** Reemplazar placeholder.
- [ ] **Insertar Captura Paciente (Tarjetas de rutina):** Reemplazar placeholder.
- [ ] **Insertar Captura Paciente (Escala EVA):** Reemplazar placeholder.

---

## 🛠️ PARTE 2: Mejoras del Proyecto (Código y Arquitectura)

### Despliegue (Criterio 5 - Integración Continua)
- [x] **Crear GitHub Action (CI básico):** Crea la carpeta `.github/workflows/` en tu repositorio y dentro un archivo `ci.yml` que simplemente instale dependencias y haga un build cuando hagas `push`. Esto demuestra que sabes hacer Integración Continua.

### DWES (Servidor / Backend)
- [ ] **(Opcional para el 10 absoluto):** Añadir al menos un archivo de test automatizado (ej. con Jest/Supertest) para probar que un endpoint falla si no se le pasa token. Si no da tiempo, memorizar la defensa oral: *"Se priorizó el MVP clínico y los tests automatizados se pasaron al roadmap de la V2. Las pruebas se hicieron manualmente con Postman"*.

### DWEC (Cliente / React)
- [x] **Gestión de errores:** Comprobar qué pasa en la UI (pantalla del móvil) si el backend de Render está dormido o da error. Asegurarte de que, como mínimo, la aplicación no se quede en blanco de forma silenciosa, sino que muestre un mensaje básico de "Cargando..." o "Error de conexión".

### DIW (Diseño de Interfaces / Estilos y Maquetación)
- [x] **Consolidar Arquitectura CSS & Cero !important:**
  - [x] Agrupar, ordenar y unificar todas las Media Queries responsive y colocarlas al fondo de la hoja de estilos en prioridad descendente de cascada (`1200px ➔ 768px`).
  - [x] Optimizar la especificidad de selectores críticos usando las mejores prácticas de BEM (`.btn.btn-sm` y `.patient-exercises__card.patient-exercises__card--active`).
  - [x] Eliminar el **100% de los !important** en toda la aplicación (tanto en `_dashboard.css` como en `_auth.css`) para cumplir estrictamente la rúbrica del profesor.
  - [x] Mantener y verificar un ratio semántico superior al 50% en el DOM (logrado **52.7% de etiquetas HTML5 ricas** en los JSX frente a divs estructurales mínimos).


---

## 🎯 PARTE 3: Entrega Final y Presentación (Tutor)

### 3.1. Entregables (Revisar en Modo Incógnito)
- [ ] **Repositorio GitHub:** Comprobar que es PÚBLICO.
- [ ] **GitHub Project:** Comprobar que es PÚBLICO.
- [ ] **Figma:** Comprobar que el enlace al prototipo es PÚBLICO.
- [ ] **Aplicación Desplegada (Render):** Comprobar que el enlace carga correctamente.
- [ ] **Credenciales de Prueba:** Crear un usuario Fisioterapeuta y un Paciente en la base de datos de producción (Render/Atlas) con datos de relleno. Anotar el email y contraseña y añadirlos a la memoria o al README para que los profesores puedan entrar sin tener que registrarse.

### 3.2. Preparación de la Defensa (Máximo 15 min - Junio)
- [ ] **Grabar Vídeo de Respaldo:** Grabar la pantalla haciendo la demo completa de la app. Entregarlo el día 22 en el último sprint review por si el día de la presentación falla el internet o se cae Render.
- [ ] **Estructurar el Guion (Ensayo con Cronómetro):**
  1. **El Problema y Valor Añadido (2-3 min):** Explicar por qué Kinefy es único (Organic Minimalism, enfocado en reducir carga cognitiva en pacientes con dolor frente a los clásicos gestores de clínicas).
  2. **Demo Funcional (5-7 min):** Mostrar solo lo más interesante (Alta de rutina, vista paciente móvil, escalar dolor EVA y ver la gráfica de informes). Destacar que el resto de cosas secundarias están explicadas en el manual de usuario (`docs/09-manual-usuario.md`).
  3. **Explicación Técnica (3-5 min):** Explicar las decisiones clave (Por qué MERN, uso de CSS Puro y BEM frente a Tailwind, seguridad con JWT) y los problemas resueltos (Borrados de Mongoose, animar `border-radius` sin bajar FPS, etc.).

  ### 🗣️ Defensa Oral (Argumentario Estratégico)
- [ ] **Moderar el lenguaje comercial:** Evitar sonar a anuncio de marketing frente al tribunal. Usar jerga técnica de ingeniería (ej: no digas *"interfaz viva y fluida"*, di *"reducción de reflows en el DOM gracias a interpolaciones matemáticas nativas de CSS"*).
- [ ] **Defensa del "Happy Path":** Tener preparada una respuesta técnica si te preguntan cómo gestionas en la base de datos si un Fisio borra un ejercicio que ya estaba asignado a la rutina de un Paciente (¿Borrados lógicos? ¿Borrados en cascada?).