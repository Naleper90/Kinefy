# 10. Conclusiones y Líneas Futuras

Alcanzar la versión de entrega (MVP) del proyecto Kinefy marca el final del ciclo formativo de Desarrollo de Aplicaciones Web (DAW) y, a su vez, representa un salto cualitativo enorme en mi aprendizaje técnico y profesional como desarrolladora.

---

## 10.1. Cumplimiento de Objetivos y Logros

El objetivo principal de construir una plataforma que digitalice y humanice la rehabilitación física se ha cumplido con éxito. 
1.  **A nivel tecnológico:** He logrado orquestar una arquitectura completa MERN (MongoDB, Express, React, Node) desde cero. Comprender y aplicar flujos complejos como la autenticación mediante JWT (JSON Web Tokens) y la gestión de bases de datos documentales ha asentado mis conocimientos sobre el desarrollo Backend.
2.  **A nivel de diseño (Frontend):** Lograr traducir el concepto abstracto de "Organic Minimalism" a código ha sido el mayor éxito. He demostrado que es posible crear interfaces de alta calidad, responsivas y accesibles usando CSS Puro (Vanilla CSS con metodología BEM) y Vite, sin depender de librerías esclavas de terceros como Bootstrap o Tailwind.

---

## 10.2. Dificultades Encontradas

El proyecto no ha estado exento de retos, algunos de los cuales supusieron picos altos de frustración y un replanteamiento de estrategias:
*   **Gestión del CSS Puro:** Mantener cientos de líneas de CSS para lograr los "botones mancha" (blobs) asimétricos requirió estudiar a fondo propiedades avanzadas como `border-radius` múltiple y `cubic-bezier`. En más de una ocasión el layout de Grid o Flexbox se rompía en la vista móvil, lo que exigió una refactorización constante y auditorías de código exhaustivas.
*   **Despliegue y Contenedores:** Entender el networking de Docker, mapear correctamente los volúmenes de persistencia para la base de datos y hacer que el proxy inverso funcionara en consonancia con la API supuso una fuerte curva de aprendizaje en el módulo de Despliegue.
*   **Gestión del Tiempo:** Ajustar todas estas funcionalidades dentro del cronograma limitado de entregas ha exigido aplicar la priorización estricta del MVP (Product Management), dejando funciones atractivas fuera para asegurar la estabilidad del núcleo del sistema.

---

## 10.3. Líneas de Trabajo Futuras

Aunque el MVP actual cumple todas las especificaciones requeridas, Kinefy está diseñado con una arquitectura escalable que permite su evolución en futuras iteraciones. Las principales líneas de mejora identificadas son:

1.  **Integración con *Wearables*:** Conectar la aplicación mediante API con dispositivos como Apple Watch o pulseras Garmin para automatizar el volcado de datos biométricos (frecuencia cardíaca o movimiento articular) durante los ejercicios.
2.  **Telemedicina Sincrónica:** Integrar WebRTC para permitir llamadas de vídeo seguras integradas en la plataforma, posibilitando que el fisio corrija la postura del paciente en tiempo real.
3.  **Módulo de Notificaciones Push:** Implementar *Service Workers* (PWA) para enviar recordatorios reales al móvil del paciente cuando no haya completado su rutina del día, mejorando aún más la adherencia terapéutica.

---

## 10.4. Reflexión Final

Desarrollar Kinefy me ha enseñado que escribir software no va solo de programar algoritmos o conectar bases de datos; va de entender al usuario final. Diseñar esta aplicación pensando empáticamente en una persona que sufre dolor físico ha cambiado por completo mi forma de entender la interfaz de usuario. El desarrollo web es una herramienta para resolver problemas humanos reales, y Kinefy es mi primera demostración funcional de ello.

**Natalia Alejo Pérez**  
*Proyecto Final de 2º DAW.*
