# 9. Manual de Usuario

El presente manual describe de forma visual y secuencial el funcionamiento de la aplicación Kinefy desde la perspectiva de sus dos tipos de usuario: Fisioterapeuta y Paciente.

> **Nota de redacción:** Para una correcta comprensión visual, cada paso va acompañado de una captura de la interfaz de la aplicación.
![Pantalla de inicio de sesión de Kinefy](assets/login.png)

---

## 9.1. Guía para el Profesional (Fisioterapeuta)

El fisioterapeuta es el administrador del tratamiento. Sus flujos principales de trabajo son:

### 1. Gestión de Pacientes (Alta y Baja)
Al iniciar sesión, el profesional accede a su Dashboard, donde puede ver alertas y próximos pacientes. Para registrar un nuevo perfil:
1. Navegar a la pestaña **"Pacientes"** usando la barra lateral.
2. Hacer clic en el botón principal flotante **"Añadir Paciente"**.
3. Rellenar los datos básicos (Nombre, correo y diagnóstico inicial).
4. El sistema generará automáticamente las credenciales de acceso para el paciente.

![Ficha del listado de pacientes en la interfaz de fisioterapeuta](assets/fisio_lista_pacientes.png)

### 2. Biblioteca de Ejercicios
Para evitar asignar ejercicios de forma manual repetitiva, el profesional puede crear su propio repositorio:
1. Acceder a **"Biblioteca"**.
2. Pulsar **"Nuevo Ejercicio"**.
3. Rellenar nombre, descripción textual (técnica correcta), URL del vídeo demostrativo y categoría (ej: "Estiramientos", "Fuerza").

![Biblioteca de ejercicios disponibles y categorizados](assets/fisio_biblioteca.png)

### 3. Asignación de Rutinas y Auditoría
1. Desde la ficha detallada de un paciente, hacer clic en **"Asignar Ejercicio"**.
2. Seleccionar ejercicios de la Biblioteca.
3. Especificar Series, Repeticiones y duración.
4. En la vista **"Informes/Auditoría"**, el profesional puede ver gráficos de la adherencia del paciente y su nivel de dolor medio diario.

![Ficha clínica de paciente y gráficos de evolución de dolor](assets/fisio_informes.png)

### 4. Gestión de Accesos y Seguridad
Para garantizar la protección de la información médica, el profesional no puede editar directamente ni conocer las contraseñas de los usuarios de forma permanente.
*   **Creación del Paciente:** Al dar de alta un paciente, el sistema genera automáticamente una credencial temporal segura y la envía por email al paciente.
*   **Restablecimiento:** Si el paciente olvida su contraseña, el fisioterapeuta puede presionar el botón **"Resetear Contraseña"** en el panel lateral del paciente.
*   **Transmisión segura:** El sistema regenera una clave temporal y la envía por correo encriptada de forma directa. Adicionalmente, la muestra en pantalla una sola vez para comunicación verbal opcional.

---

## 9.2. Guía para el Paciente

La interfaz del paciente está diseñada bajo un estricto principio de "Organic Minimalism" (*Mobile-First*), eliminando distracciones y facilitando la navegación con una sola mano.

### 1. Visualización de la Rutina Diaria
Al hacer login desde el móvil, el paciente es dirigido instantáneamente a su rutina de hoy:
1. Visualizar las tarjetas interactivas (blobs) que representan los ejercicios pendientes.
2. Pulsar sobre una tarjeta para ver el **vídeo/imagen** y la descripción detallada del movimiento.

![Tarjetas de ejercicios de la rutina diaria en el móvil del paciente](assets/paciente_home.png)

### 2. Marcado y Cumplimiento
Tras ejecutar el movimiento, el paciente pulsa el botón **"Completar"**. La tarjeta cambiará visualmente su estado (mediante color menta o icono de *check*) para indicar que ha finalizado con éxito.

### 3. Registro de Dolor (Escala EVA)
Una vez completados todos los ejercicios, el sistema requiere que el paciente indique cómo se siente:
1. Aparece en pantalla un slider o selector interactivo del **1 al 10** (Escala Visual Analógica).
2. El usuario selecciona la intensidad (donde 1 es "Sin dolor" y 10 es "Dolor insoportable").
3. Al guardar, este dato se sincroniza en tiempo real con el panel del fisioterapeuta.

![Registro de nivel de dolor mediante escala EVA interactiva](assets/paciente_eva.png)
