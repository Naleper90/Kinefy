# Arquitectura y Desarrollo

Kinefy se ha construido bajo un modelo de desacoplamiento total entre cliente y servidor. Esta separación permite que el núcleo de datos (API) y la interfaz sigan ciclos de desarrollo independientes, facilitando la mantenibilidad a largo plazo.

## Frontend (React)

La interfaz se ha desarrollado como una Single Page Application (SPA) utilizando **React y Vite**. He priorizado una estructura de componentes lógica para evitar la redundancia de código:
- **Estructura Modular**: Los componentes atómicos (iconos, botones) residen en su propia lógica, mientras que las páginas gestionan los estados complejos y la navegación.
- **Estilos**: Como se detalla en la guía de diseño, no se han utilizado frameworks de utilidades, optando por una arquitectura ITCSS/BEM para un rendimiento óptimo.

## Backend (API REST)

El servidor, desarrollado en **Node.js con Express**, actúa como una capa de servicios RESTful que gestiona la persistencia y la seguridad.
- **Modelado**: Uso MongoDB y Mongoose para definir esquemas que, aunque flexibles, mantienen una validación estricta de los datos de salud.
- **Seguridad**: He implementado un sistema de autenticación basado en JWT (JSON Web Tokens) para asegurar que la información médica y personal solo sea accesible bajo roles autorizados (Fisio/Paciente), garantizando la integridad de la sesión en cada petición.
