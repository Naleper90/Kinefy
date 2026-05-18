# 2. Descripción de la Aplicación

Kinefy es una plataforma web orientada al seguimiento clínico de pacientes en procesos de rehabilitación física. La aplicación actúa como un nexo de comunicación asíncrono entre el profesional sanitario y el paciente, permitiendo pautar ejercicios, recopilar feedback sobre el nivel de dolor y analizar la adherencia al tratamiento.

---

## 2.1. Definición del MVP (Producto Mínimo Viable)

Para esta iteración del Proyecto Final de Ciclo, el MVP de Kinefy se ha acotado a las funcionalidades nucleares que garantizan un flujo de trabajo clínico completo y funcional. 

El sistema debe permitir que un fisioterapeuta gestione su cartera de pacientes, asigne rutinas de ejercicios desde una biblioteca base y visualice la evolución de los mismos. Paralelamente, el paciente debe poder acceder a sus ejercicios pautados, marcarlos como completados y registrar su nivel de dolor diario mediante la escala EVA.

Quedan excluidas de este MVP funcionalidades avanzadas como la videoconsulta, la pasarela de pagos, la facturación de la clínica o la integración con calendarios externos (Google Calendar / Outlook).

---

## 2.2. Perfiles de Usuario (Roles)

La aplicación implementa un sistema de control de acceso basado en roles (RBAC) que divide la interfaz y la lógica de negocio en dos perfiles mutuamente excluyentes:

### Rol: Fisioterapeuta (Profesional)
*   **Propósito:** Es el gestor del tratamiento. Supervisa, pauta y audita.
*   **Vistas principales:** 
    *   *Dashboard (Inicio):* Visión general de pacientes con cita próxima, resumen de alertas y evolución clínica media.
    *   *Listado de Pacientes:* CRM clínico para alta, baja y modificación de perfiles de usuarios bajo su tutela.
    *   *Biblioteca de Ejercicios:* CRUD completo de ejercicios, incluyendo parámetros por defecto (series/repeticiones) y URLs de vídeos explicativos.
    *   *Gestión de Citas y Rutinas:* Asignación de pautas temporales a pacientes específicos.
    *   *Informes:* Visualización de auditorías, historial documental y evolución de la adherencia en formato tabla/gráfico.

### Rol: Paciente
*   **Propósito:** Es el ejecutor del tratamiento. Su flujo debe ser extremadamente sencillo y libre de distracciones.
*   **Vistas principales:**
    *   *Mi Rutina:* Listado de ejercicios a realizar en el día actual, presentados en formato tarjeta táctil interactiva.
    *   *Registro de Dolor (EVA):* Selector visual (de 1 a 10) para cuantificar la molestia post-ejercicio.
    *   *Mi Progreso:* Panel motivacional básico que muestra el porcentaje de cumplimiento semanal para fomentar la adherencia terapéutica.

---

## 2.3. Historias de Usuario (User Stories)

El desarrollo del MVP se ha guiado mediante la metodología de historias de usuario. A continuación, se detallan las más relevantes para cada rol:

### Historias de Usuario - Profesional
*   **HU-01:** Como fisioterapeuta, quiero dar de alta a un nuevo paciente en el sistema para poder digitalizar su historial clínico.
*   **HU-02:** Como fisioterapeuta, quiero añadir ejercicios a una biblioteca global para poder reutilizarlos con distintos pacientes.
*   **HU-03:** Como fisioterapeuta, quiero asignar una rutina de ejercicios a un paciente específico para que pueda consultarla desde su móvil en casa.
*   **HU-04:** Como fisioterapeuta, quiero ver el porcentaje de cumplimiento de un paciente para saber si está siguiendo el tratamiento antes de su próxima cita presencial.
*   **HU-05:** Como fisioterapeuta, quiero ver un histórico del dolor (escala EVA) reportado por el paciente para decidir si aumento o reduzco la carga de los ejercicios.

### Historias de Usuario - Paciente
*   **HU-06:** Como paciente, quiero acceder a la plataforma desde mi teléfono móvil de forma rápida para ver qué ejercicios me tocan hoy.
*   **HU-07:** Como paciente, quiero poder marcar un ejercicio como "Completado" con un simple toque para llevar un control de mi rutina.
*   **HU-08:** Como paciente, quiero poder visualizar un vídeo o imagen de cada ejercicio para asegurarme de que estoy ejecutando la técnica correcta.
*   **HU-09:** Como paciente, quiero registrar mi nivel de dolor al finalizar la rutina para que mi fisio sepa cómo me encuentro sin tener que enviarle un mensaje por otra vía.

---

## 2.4. Flujo Principal del Sistema (Main User Flow)

El ciclo de vida estándar dentro de Kinefy sigue este flujo cronológico:

1.  **Onboarding:** El Fisioterapeuta accede al sistema y da de alta al Paciente con sus datos básicos. El sistema genera unas credenciales de acceso para este último.
2.  **Prescripción:** El Fisioterapeuta selecciona ejercicios de la *Biblioteca*, ajusta las series/repeticiones para el caso concreto y los asigna al calendario del Paciente.
3.  **Ejecución:** El Paciente inicia sesión en su dispositivo móvil. En su pantalla de inicio aparece la rutina del día. Realiza los ejercicios y los marca como completados (interacción que genera un registro en la base de datos).
4.  **Feedback (Telemetría):** Tras completar la rutina, el Paciente rellena la escala EVA para registrar su nivel de dolor en ese momento concreto.
5.  **Auditoría:** El Fisioterapeuta, al revisar la ficha del Paciente días después, observa el gráfico de adherencia (ejercicios hechos vs pautados) y la curva de dolor, utilizando esta información para modificar o mantener el tratamiento en la siguiente cita presencial.
