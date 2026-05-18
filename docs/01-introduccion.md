# 1. Introducción y Antecedentes

Kinefy surge a partir de una experiencia personal durante un proceso de rehabilitación física. Al enfrentarme a una lesión de larga duración, identifiqué que la comunicación bidireccional con el profesional clínico fuera de las paredes de la consulta era prácticamente inexistente. El éxito del tratamiento dependía excesivamente de la capacidad del paciente para memorizar tablas de ejercicios, asimilar posturas correctas y recordar la evolución del dolor diario; datos que, a menudo, se diluían entre sesión y sesión.

En el ámbito clínico tradicional, el profesional entrega al paciente hojas impresas con rutinas genéricas. Este modelo unidireccional genera desmotivación, baja adherencia al tratamiento y, lo que es más crítico, impide al fisioterapeuta conocer la evolución real del paciente hasta que este vuelve a cruzar la puerta de la clínica.

---

## 1.1. Planteamiento del Problema

La falta de digitalización en el seguimiento inter-sesiones genera tres problemas fundamentales en la fisioterapia actual:
1. **Pérdida de datos clínicos:** La memoria del paciente es imprecisa respecto a la fluctuación diaria del dolor (Escala EVA) y la tolerancia a ciertos ejercicios.
2. **Baja adherencia terapéutica:** La entrega de ejercicios en formatos analógicos (fotocopias) o mediante enlaces desordenados resulta fría y poco interactiva, aumentando la tasa de abandono de la rutina de rehabilitación.
3. **Falta de monitorización activa:** El profesional carece de métricas objetivas (porcentaje de ejercicios completados, picos de dolor) para ajustar el tratamiento de forma dinámica, viéndose obligado a tomar decisiones basadas en recuerdos anecdóticos del paciente.

## 1.2. Justificación del Proyecto

La finalidad principal de este Proyecto Final de Ciclo es el desarrollo de **Kinefy**, una aplicación web diseñada específicamente para actuar como el eslabón digital entre el fisioterapeuta y el paciente. 

No se trata únicamente de un gestor de tareas o un repositorio de vídeos, sino de un **canal de comunicación estructurado y bidireccional**. La aplicación proporciona datos constantes (incidencias, adherencia, evolución del dolor) para que el profesional pueda tomar decisiones basadas en evidencias (Evidence-Based Practice).

A nivel tecnológico y de diseño, Kinefy se justifica por su enfoque en el **"Organic Minimalism"** (Minimalismo Orgánico). A diferencia de otras herramientas clínicas de aspecto frío e industrial, Kinefy prescinde de librerías de UI de terceros en favor de un CSS puro y artesanal. Su interfaz utiliza colores cálidos (menta y crema) y formas asimétricas (blobs) con el objetivo explícito de reducir la carga cognitiva y el estrés en usuarios que, por definición, se encuentran en un estado de vulnerabilidad o dolor físico.

---

## 1.3. Objetivos del Proyecto

### Objetivo General
Diseñar, desarrollar y desplegar una plataforma web *Full-Stack* que digitalice la monitorización de tratamientos de fisioterapia, facilitando la prescripción de ejercicios por parte del profesional y garantizando un registro preciso de la evolución por parte del paciente.

### Objetivos Específicos
1. **Desarrollo Frontend:** Construir una *Single Page Application* (SPA) reactiva y *mobile-first*, garantizando un acceso rápido desde dispositivos móviles sin necesidad de instalar aplicaciones nativas.
2. **Diseño Accesible (UI/UX):** Implementar un sistema de diseño propio basado en CSS/BEM que cumpla con los estándares de accesibilidad WCAG AA, priorizando la legibilidad y la usabilidad para usuarios con dolor agudo.
3. **Desarrollo Backend:** Programar una API RESTful escalable y segura utilizando Node.js y Express, con un sistema de autenticación robusto basado en JSON Web Tokens (JWT).
4. **Gestión de Datos:** Modelar y estructurar una base de datos documental (MongoDB) capaz de almacenar de forma eficiente historiales clínicos, asignación de rutinas y telemetría de dolor.
5. **Auditoría Clínica:** Implementar un módulo de informes (*Reports*) que permita la gestión de historiales y la generación de métricas de cumplimiento (SLA de adherencia al tratamiento).

---

## 1.4. Alcance y Limitaciones

### Alcance
El proyecto abarca el ciclo de vida completo de desarrollo de software (SDLC), desde el análisis de requisitos y prototipado hasta el despliegue en entornos de producción. Funcionalmente, la plataforma permite:
* Registro y autenticación diferenciada mediante roles (Fisioterapeuta / Paciente).
* Gestión integral del directorio de pacientes.
* Creación y asignación de rutinas de ejercicios personalizadas a partir de una biblioteca multimedia.
* Registro diario del dolor (Escala Analógica Visual - EVA) por parte del paciente.
* Visualización gráfica de la evolución clínica en el panel del profesional.

### Limitaciones
El sistema está diseñado como una herramienta de apoyo y monitorización, por lo que presenta las siguientes limitaciones explícitas:
* **No realiza diagnósticos automáticos:** La plataforma no utiliza algoritmos predictivos ni Inteligencia Artificial para diagnosticar lesiones; el control clínico es competencia exclusiva del profesional colegiado.
* **No incluye telemedicina sincrónica:** El sistema no soporta videollamadas ni chat en tiempo real. La comunicación se basa en reportes asíncronos y feedback sobre los ejercicios.
* **Integración con hardware:** No se contempla la integración con dispositivos *wearables* (smartwatches o sensores biométricos) en esta iteración del producto.

---

## 1.5. Estado del Arte

En el mercado actual de software para fisioterapia (como *Physitrack* o *Bewe*), predominan dos extremos:
1. **Software de gestión de clínicas (ERP/CRM):** Extremadamente potentes para la facturación y la gestión de agendas, pero con un portal del paciente deficiente o inexistente.
2. **Librerías de ejercicios genéricas:** Aplicaciones orientadas al fitness general que carecen del control clínico riguroso necesario para la rehabilitación traumatológica.

**Kinefy** se posiciona en el punto intermedio, ofreciendo una solución centrada exclusivamente en la *recuperación guiada*. Su principal ventaja competitiva frente a las soluciones existentes es su arquitectura ligera y su diseño humanizado. Mientras que las plataformas tradicionales imponen interfaces densas, frías y basadas en plantillas genéricas (Bootstrap/Material Design), Kinefy ofrece una experiencia táctil, orgánica y libre de estrés, diseñada empáticamente para el usuario final.
