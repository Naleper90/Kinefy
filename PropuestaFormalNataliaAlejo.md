# Propuesta del Proyecto Final – 2º DAW

## Nombre del proyecto y autora

**Título:** Kinefy – Plataforma web de seguimiento de rehabilitación física  
**Autora:** Natalia Alejo Pérez  
**Ciclo:** 2º DAW – I.E.S. Rafael Alberti  
**Curso:** 2025/26

## Índice

1. [Identificación de necesidades](#1-identificación-de-necesidades)  
2. [Oportunidades de negocio](#2-oportunidades-de-negocio)  
3. [Tipo de proyecto](#3-tipo-de-proyecto)  
4. [Características específicas](#4-características-específicas)  
5. [Obligaciones legales y prevención](#5-obligaciones-legales-y-prevención)  
6. [Ayudas y subvenciones](#6-ayudas-y-subvenciones)  
7. [Guión de trabajo](#7-guión-de-trabajo)  
8. [Referencias](#8-referencias)

# 1. Identificación de necesidades

## 1.1. Problema detectado

Durante los últimos meses he estado en un proceso de rehabilitación física por lesión. En mi caso, la comunicación con el fisioterapeuta fuera de la consulta era prácticamente inexistente y el seguimiento del tratamiento dependía casi por completo de mi memoria: recordar qué ejercicios hacer, cuántas repeticiones, qué días tocaba cada cosa y cómo había evolucionado el dolor desde la última sesión.

Tampoco había un registro claro de cómo iba cambiando el dolor o qué ejercicios me daban más problemas en casa. Esa información solo aparecía cuando yo la contaba de palabra en la siguiente sesión, muchas veces de forma incompleta o poco precisa. Si en algún momento cambiara de fisioterapeuta o de clínica, toda esa evolución intermedia se perdería.

## 1.2. Cómo he detectado la necesidad

La necesidad nace de mi experiencia personal como paciente en rehabilitación. A partir de ahí he comentado la situación con otras personas cercanas que también han pasado por procesos similares y me he encontrado con situaciones muy parecidas: ejercicios apuntados en papeles que se pierden, falta de recordatorios, dudas sobre si se está haciendo bien el ejercicio y poca información estructurada para el profesional entre sesión y sesión.

Además, revisando aplicaciones y webs existentes, la mayoría se centran en agenda básica, gestión de pacientes o en ofrecer ejercicios genéricos, pero pocas ponen el foco en el día a día del paciente (qué hace realmente en casa, cómo le duele, qué incidencias tiene) y en cómo esa información llega al fisioterapeuta de forma clara.

## 1.3. Usuarios y beneficiarios

Los usuarios principales de la aplicación serían:

- Fisioterapeutas que trabajan con pacientes en procesos de rehabilitación y necesitan hacer un seguimiento más cercano entre sesiones sin depender solo de lo que el paciente recuerda en la consulta.
- Pacientes en rehabilitación que quieren tener sus ejercicios organizados, con recordatorios y un espacio sencillo donde registrar cómo se encuentran y qué les cuesta más.

De forma indirecta también se podría beneficiar el personal médico (por ejemplo, médicos rehabilitadores) si el fisioterapeuta comparte los informes generados a partir del seguimiento.

# 2. Oportunidades de negocio

## 2.1. Soluciones similares

Al buscar aplicaciones y páginas relacionadas con la fisioterapia y la rehabilitación he encontrado sobre todo herramientas centradas en la gestión de la clínica. Por ejemplo, soluciones como **Fisiomap**, **Clinic Cloud**, **Klinikare** o **Reservio** están muy enfocadas en la agenda, la ficha de pacientes, la facturación y los recordatorios de cita, pero no entran tanto en el detalle de qué hace el paciente en casa entre sesión y sesión. 

También hay plataformas más específicas para rehabilitación y tele-rehabilitación como **PhysiApp**, **Fibbel** o **TRAK Physio**, que permiten prescribir ejercicios con vídeos y hacer seguimiento remoto, en algunos casos incluso con funciones avanzadas como análisis automático del movimiento. En general son productos pensados para clínicas medianas o grandes, o con un enfoque muy médico/empresarial, y no tanto como una herramienta sencilla para que un fisio y sus pacientes puedan gestionar el día a día de la rehabilitación de forma cercana.

## 2.2. Propuesta de valor diferencial

Kinefy se centra justo en ese hueco: el día a día del paciente en rehabilitación y cómo esa información llega al fisioterapeuta de forma clara. La idea no es competir con un software completo de gestión de clínicas, sino complementar ese tipo de herramientas con una capa de seguimiento que muchas veces no está resuelta.

Los puntos diferenciales serían:

- Un diario de rehabilitación donde el paciente marca qué ha hecho realmente, cómo le duele y qué ejercicios le están costando más en casa.
- Una vista para el fisio que le permita ver de un vistazo la evolución del dolor, el cumplimiento de los ejercicios y las incidencias entre sesiones, sin depender solo de lo que el paciente recuerde cuando llega a la consulta.
- Un sistema de citas con confirmación y recordatorios parecido a cómo funcionan las reservas de algunos restaurantes, pensado para reducir ausencias y ayudar al fisio a organizar mejor su agenda.
- La posibilidad de generar un informe de seguimiento que puedan descargar tanto el fisioterapeuta como el propio paciente, para compartirlo con otros profesionales si cambia de centro.

## 2.3. Potencial de la solución

El proyecto está pensado inicialmente para fisioterapeutas que trabajan con pacientes en procesos de rehabilitación de media o larga duración (lesiones deportivas, post-operatorios, problemas crónicos, etc.), así como para pacientes que quieren tener sus ejercicios y su evolución un poco más bajo control sin complicarse con herramientas demasiado técnicas.

Aunque el alcance del desarrollo será el de un proyecto de fin de ciclo, la idea podría crecer en el futuro como una herramienta que se pueda ofrecer a pequeñas clínicas o fisioterapeutas independientes, o incluso como proyecto open source que se pueda adaptar y desplegar en distintos entornos. El hecho de que sea una aplicación web facilita que se pueda utilizar desde distintos dispositivos sin instalar nada, lo que puede ayudar a que sea más fácil de introducir en un entorno real.

# 3. Tipo de proyecto

## 3.1. Tipo de aplicación

Kinefy será una aplicación web con un enfoque de SPA (Single Page Application) en la parte de cliente. La idea es que el usuario (fisioterapeuta o paciente) pueda moverse entre las distintas pantallas (diario, citas, ejercicios, etc.) sin recargar la página completa cada vez, para que la experiencia sea más fluida, sobre todo en el uso diario.

El frontend estará desarrollado con React y React Router, lo que permite gestionar las distintas vistas desde el navegador y consumir la información a través de una API.

## 3.2. Arquitectura propuesta

La arquitectura se basa en una parte de cliente y otra de servidor bien separadas:

- **Frontend**: aplicación SPA en React que se encarga de la interfaz de usuario, la navegación y las peticiones al servidor.
- **Backend**: API REST desarrollada con Node.js y Express que expone los endpoints necesarios para gestionar usuarios, pacientes, ejercicios, planes de rehabilitación, citas, registros del diario, informes, etc.
- **Base de datos**: MongoDB, usando Mongoose para definir los modelos y trabajar con los datos de forma más estructurada.

La comunicación entre frontend y backend se hará mediante peticiones HTTP (por ejemplo, usando Axios en el cliente) y las operaciones sensibles estarán protegidas mediante autenticación con JWT.

## 3.3. Justificación técnica

Este tipo de proyecto encaja bien con la necesidad que se quiere cubrir porque:

- Una SPA facilita el uso frecuente por parte del paciente (marcar ejercicios, registrar dolor, revisar citas) sin tiempos de carga altos en cada acción, evitando recargar la página completa cada vez.
- Separar frontend y backend permite evolucionar cada parte por separado en el futuro, e incluso desarrollar una app móvil que consuma la misma API si se quisiera.
- El stack elegido (React, Node.js, MongoDB) es el que ya se está trabajando en el ciclo y permite cumplir con las rúbricas de DWEC, DWES, DIW y Despliegue sin introducir tecnologías demasiado ajenas a lo visto en clase.

# 4. Características específicas

## 4.1. Funcionalidades principales (MVP)

Funcionalidades mínimas que debería tener la primera versión de Kinefy:

- Registro e inicio de sesión para fisioterapeutas y pacientes.
- Gestión básica de pacientes por parte del fisioterapeuta (crear, ver, editar, desactivar).
- Definición de planes de rehabilitación por fases o semanas, con lista de ejercicios asociados.
- Gestión de ejercicios: alta y edición de ejercicios con nombre, descripción, series, repeticiones y materiales de apoyo (imágenes o vídeos subidos por el fisio).
- Asignación de ejercicios a cada paciente según su plan de rehabilitación.
- Diario de rehabilitación del paciente:
  - Marcar ejercicios como realizados o no realizados.
  - Registrar nivel de dolor en escala de 1 a 10.
  - Añadir observaciones sobre molestias o incidencias.
- Vista de seguimiento para el fisioterapeuta con evolución del dolor, cumplimiento de los ejercicios y comentarios del paciente.
- Gestión de citas:
  - El fisio crea y modifica citas.
  - El paciente ve sus citas y puede confirmar o cancelar con antelación.
  - Envío de recordatorios antes de la cita.
- Generación de un informe de seguimiento que recoja la evolución del dolor, la adherencia a los ejercicios, incidencias y resumen de documentación médica, descargable tanto por el fisio como por el paciente.
- Subida de documentación médica por parte del paciente y posibilidad de que el fisio añada notas internas/resumen.
- Sistema de notificaciones básicas (correo y/o dentro de la aplicación) para cambios en citas y recordatorios importantes.

## 4.2. Funcionalidades opcionales / ampliaciones

Funcionalidades interesantes pero que se pueden dejar como ampliación si el tiempo no llega:

- Filtros y búsqueda avanzada en la lista de pacientes y en el histórico de sesiones.
- Gráficas más avanzadas de evolución del dolor y de cumplimiento de ejercicios.
- Posibilidad de que el paciente añada fotos o vídeos de cómo hace un ejercicio para que el fisio lo revise.
- Etiquetado de ejercicios por tipo de lesión o zona del cuerpo para facilitar la reutilización por parte del fisioterapeuta.
- Soporte multilenguaje en la interfaz.
- Explorar en un futuro la integración de un agente basado en modelos tipo MedMO para ayudar al fisioterapeuta a extraer o resumir información relevante de los informes médicos, siempre como apoyo y con supervisión humana.

## 4.3. Requisitos técnicos

A nivel técnico, además de las tecnologías ya mencionadas, habrá que tener en cuenta:

- API REST estructurada en recursos claros (pacientes, ejercicios, planes, citas, registros del diario, documentos, informes).
- Sistema de autenticación y autorización basado en JWT, con roles diferenciados (fisioterapeuta, paciente).
- Validación de datos tanto en el frontend como en el backend (formularios, tipos, rangos de valores para el dolor, etc.).
- Gestión de ficheros para las imágenes y vídeos de los ejercicios (subida y almacenamiento en el servidor o en un servicio externo).
- Envío de correos electrónicos para confirmaciones y recordatorios de citas.
- Diseño responsive para que la aplicación sea usable desde ordenador, tablet o móvil.

# 5. Obligaciones legales y prevención

## 5.1. Normativa aplicable

Kinefy va a manejar datos personales de pacientes y, en muchos casos, información relacionada con su salud (lesiones, informes médicos, evolución del dolor). Por ese motivo, el proyecto debe tener en cuenta principalmente:

- **Reglamento General de Protección de Datos (RGPD)**: regula cómo se recogen, guardan y tratan los datos personales en la Unión Europea. En este contexto implica, entre otras cosas:
  - Informar al paciente de forma clara de para qué se usan sus datos y quién los trata.
  - Pedir consentimiento explícito para tratar datos de salud.
  - Permitir que el paciente ejerza sus derechos (acceso, rectificación, cancelación, oposición, portabilidad).
  - No recoger más datos de los necesarios para el objetivo de la aplicación.

- **Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)**: afecta a servicios prestados por vía electrónica. En el proyecto impacta sobre todo en:
  - Identificar claramente quién es el responsable del servicio (por ejemplo, la clínica o el fisioterapeuta que despliegue la aplicación).
  - Cumplir con las obligaciones de información en la web (aviso legal, política de privacidad, política de cookies si se usan).

Además, al tratar datos de salud, también hay que tener en mente la normativa sanitaria general y el deber de confidencialidad del profesional, aunque el proyecto se centre más en la parte técnica que en la gestión legal del centro.

## 5.2. Medidas de seguridad y protección de datos

A nivel técnico y organizativo, la aplicación tendrá en cuenta las siguientes medidas básicas de seguridad:

- **Control de acceso y roles**: solo podrán acceder a la información a través de una cuenta autenticada. Habrá un sistema de roles (fisioterapeuta y paciente) que limitará qué puede ver y hacer cada uno. Por ejemplo, un paciente solo podrá ver sus propios datos y no los de otros pacientes.
- **Contraseñas protegidas**: las contraseñas no se guardarán nunca en texto plano, sino cifradas (hash) en la base de datos.
- **Comunicación cifrada**: el despliegue se hará usando HTTPS para cifrar el tráfico entre el navegador y el servidor, evitando que terceros puedan leer los datos si se intercepta la conexión.
- **Minimización de datos**: solo se pedirá la información estrictamente necesaria para el funcionamiento de la plataforma, evitando campos innecesarios.
- **Gestión de documentación médica**: los archivos subidos (informes, pruebas de imagen) se tratarán como datos sensibles. Se limitará su acceso a la cuenta del propio paciente y al fisioterapeuta que lleve su caso.
- **Registro y borrado de datos**: se tendrá en cuenta la posibilidad de que el paciente pueda solicitar la eliminación de su cuenta y de sus datos, siguiendo el espíritu del derecho de supresión del RGPD.
- **Copias de seguridad básicas**: se contemplará un sistema de copias de seguridad periódicas de la base de datos para evitar pérdida de información por fallos técnicos, siempre manteniendo las mismas medidas de seguridad en las copias.

Aunque se trata de un proyecto de fin de ciclo y no de un producto sanitario real, la intención es que el diseño técnico tenga en mente estas medidas desde el principio, para que la aplicación pueda acercarse lo máximo posible a un uso responsable de los datos.

## 5.3. Accesibilidad web

Al estar dirigido a pacientes que pueden tener limitaciones físicas (dolor, movilidad reducida, etc.), es importante que la interfaz tenga en cuenta algunas pautas básicas de accesibilidad web (WCAG):

- Usar una estructura correcta de encabezados, etiquetas de formulario y textos alternativos en imágenes, para que la aplicación sea entendible también con lectores de pantalla.
- Cuidar el contraste de colores y el tamaño de la tipografía para que los textos sean legibles.
- Evitar depender solo del color para transmitir información importante (por ejemplo, complementando colores con iconos o textos).
- Permitir la navegación por teclado en los elementos más importantes (formularios, botones principales, navegación básica).
- Diseñar vistas responsive que se adapten a distintos tamaños de pantalla, ya que muchos pacientes probablemente accederán desde el móvil.

Estas medidas no garantizan una accesibilidad perfecta, pero sí marcan la intención de que la aplicación no añada más barreras a personas con distintas capacidades.

# 6. Ayudas y subvenciones

## 6.1. Programas de ayuda a la digitalización

Aunque Kinefy nace como proyecto de fin de ciclo, el tipo de solución que plantea (digitalizar el seguimiento entre fisioterapeuta y paciente) encaja bastante con líneas de ayudas orientadas a la digitalización de pymes y autónomos.

Por ejemplo, el **Programa Kit Digital**, impulsado por el Gobierno y financiado con fondos europeos Next Generation, ofrece bonos para que pequeñas empresas, microempresas y autónomos puedan implantar soluciones digitales ya existentes en el mercado (gestión de clientes, presencia online, digitalización de procesos, etc.). En un caso real, una pequeña clínica de fisioterapia podría usar este tipo de ayuda para implantar una herramienta como Kinefy, siempre que el software se ofreciera a través de un proveedor acreditado como agente digitalizador.

Otra referencia sería **ENISA**, que ofrece financiación a pymes y startups con proyectos innovadores de base tecnológica. En ese contexto, Kinefy tendría más sentido como producto de una futura empresa de software sanitario que como simple herramienta interna, pero eso ya se sale del alcance de este trabajo y ahora mismo el enfoque es académico.

En esta fase el objetivo principal es que la solución tenga sentido técnico y responda a una necesidad real. Más adelante, con más desarrollo y un modelo de negocio claro, ya se podría estudiar si encaja en este tipo de programas.

## 6.2. Recursos gratuitos o de bajo coste

Para desarrollar y probar Kinefy quiero usar sobre todo herramientas que ya conozco y que tienen planes gratuitos:

- **GitHub** para el repositorio del código y **GitHub Projects** para organizar las tareas.
- Plataformas como **Vercel**, **Netlify**, **Railway** o **Render** para desplegar el frontend y el backend durante el desarrollo sin tener que pagar hosting desde el principio.
- Servicios de envío de correos     con plan gratuito como **Brevo** (antes Sendinblue) o **Mailgun**, que permiten enviar un número limitado de correos al mes para los recordatorios y confirmaciones de citas.
- Herramientas de diseño como **Figma** (plan gratuito) o **Pencil** para hacer bocetos de las pantallas y prototipos sencillos.

De esta forma, el proyecto se puede levantar y probar sin una gran inversión inicial, algo importante si pensamos en fisioterapeutas autónomos o pequeñas clínicas.

# 7. Guión de trabajo

## 7.1. Fases principales

Para organizar el desarrollo de Kinefy planteo las siguientes fases de trabajo:

1. **Fase 1 – Análisis y diseño funcional**  
   - Detallar bien los casos de uso principales (diario de rehabilitación, citas, informes).  
   - Definir los modelos de datos (usuarios, pacientes, ejercicios, planes, citas, registros del diario, documentos).  
   - Hacer bocetos de las pantallas principales (wireframes) con Pencil Project o Figma.

2. **Fase 2 – Diseño técnico y base de datos**  
   - Definir la estructura de la API REST (endpoints principales y recursos).  
   - Diseñar los esquemas de MongoDB con Mongoose.  
   - Preparar el proyecto base de backend en Node.js/Express y el de frontend en React.

3. **Fase 3 – Desarrollo del backend (API)**  
   - Implementar la autenticación con JWT y la gestión de roles (fisioterapeuta/paciente).  
   - Crear los endpoints para pacientes, ejercicios, planes de rehabilitación, citas y registros del diario.  
   - Implementar la subida de ficheros para documentación médica y materiales de apoyo.  
   - Añadir el envío de correos automáticos para recordatorios y confirmaciones de citas.

4. **Fase 4 – Desarrollo del frontend**  
   - Maquetar las vistas principales (login, panel del fisio, panel del paciente, diario, citas, etc.).  
   - Conectar el frontend con la API usando Axios.  
   - Implementar la lógica de diario, vista de seguimiento para el fisio y gestión de citas.  
   - Ajustar estilos y diseño responsive.

5. **Fase 5 – Pruebas, ajustes y accesibilidad**  
   - Pruebas básicas de funcionamiento (altas, modificaciones, flujos principales).  
   - Comprobación de validaciones en formularios y mensajes de error.  
   - Revisar aspectos básicos de accesibilidad (contraste, etiquetas, textos alternativos).  
   - Revisión general con casos reales de ejemplo.

6. **Fase 6 – Despliegue y documentación**  
   - Despliegue del backend en un servicio como Railway o Render.  
   - Despliegue del frontend en Vercel o Netlify.  
   - Revisión de variables de entorno y configuración para producción.  
   - Documentación de la API y de las principales decisiones de diseño.

## 7.2. Cronograma general y hitos

De forma aproximada, la planificación desde marzo hasta la entrega del 22 de mayo sería:

- **Semana 1–2 (segunda quincena de marzo)**: Fases 1 y 2  
  Análisis de requisitos, definición de modelos de datos, diseño de la API y bocetos de pantallas.

- **Semana 3–5 (principios-mediados de abril)**: Fase 3  
  Desarrollo del backend: autenticación, recursos principales (pacientes, ejercicios, planes, citas, diario) y subida de documentación.

- **Semana 6–8 (mediados-finales de abril)**: Fase 4  
  Desarrollo del frontend: vistas principales para fisio y paciente, conexión con la API y lógica de diario y citas.

- **Semana 9 (principios de mayo)**: Fase 5  
  Pruebas básicas, corrección de errores y revisión de validaciones y accesibilidad mínima.

- **Semana 10 (hasta el 22 de mayo)**: Fase 6  
  Despliegue, ajustes finales y documentación.

Este cronograma es orientativo y puede ajustarse según la carga de trabajo de otros módulos, pero la idea es llegar al final con un MVP funcional y probado.

## 7.3. Herramientas de gestión

Para organizar el trabajo usaré:

- **GitHub** y ramas de Git para el control de versiones.  
- **GitHub Projects** para anotar y seguir las tareas del proyecto (qué hay que hacer, qué está en progreso y qué está terminado).  
- **Toggl Track** para llevar un registro aproximado del tiempo dedicado a cada fase y poder ajustar la planificación si veo que alguna parte lleva más trabajo del previsto.


# 8. Referencias

- [Fisiomap](https://fisiomap.app)
- [Clinic Cloud – Software clínica fisioterapia](https://clinic-cloud.com/programa-gestion-clinicas-de-fisioterapia-software)
- [Klinikare – Software de gestión para clínicas de fisioterapia](https://klinikare.com/klinikare/p/software_clinica_fisioterapia)
- [Reservio – Software para fisioterapeutas](https://www.reservio.com/es/software-para-fisioterapeutas)
- [PhysiApp](https://www.physiapp.es)
- [Fibbel – App para pacientes de fisioterapia](https://www.fibbel.net/app-pacientes-fisioterapia/)
- [TRAK Physio – Fisioterapia digital](https://www.trakphysio.com/es/trak-physio-fisioterapia-digital/)
- [Programa Kit Digital – Red.es](https://www.red.es/es/iniciativas/proyectos/kit-digital)
- [Programa Kit Digital – España Digital 2026](https://espanadigital.gob.es/lineas-de-actuacion/programa-kit-digital)
- [ENISA](https://www.enisa.es)
- [GitHub](https://github.com)
- [GitHub Projects](https://github.com/features/project-management)
- [Vercel](https://vercel.com)
- [Netlify](https://www.netlify.com)
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Brevo (Sendinblue)](https://www.brevo.com/es/)
- [Mailgun](https://www.mailgun.com)
- [Figma](https://www.figma.com)
- [Pencil](https://pencil.dev/)
- [Toggl Track](https://toggl.com/track/)
