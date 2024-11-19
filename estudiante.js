// Elementos del DOM
const estudianteTableBody = document.getElementById('estudianteTableBody');
const estudianteForm = document.getElementById('estudianteForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const estudianteId = document.getElementById('estudianteId');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const nroRegistro = document.getElementById('nroRegistro');
const fechaNacimiento = document.getElementById('fechaNacimiento');
const estado = document.getElementById('estado');
const telefono = document.getElementById('telefono');
const email = document.getElementById('email');
const idCarrera = document.getElementById('idCarrera');

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  estudianteForm.reset();
  modalTitulo.textContent = "Agregar Estudiante";
  estudianteId.value = ''; // Limpiar el id
  cargarCarreras();
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar las carreras
async function cargarCarreras() {
  try {
    const response = await fetch('https://localhost:7115/api/Carrera/ObtenerCarreras');
    const carreras = await response.json();
    idCarrera.innerHTML = '<option value="">Seleccione una carrera</option>';

    carreras.forEach(carrera => {
      const option = document.createElement('option');
      option.value = carrera.id;
      option.textContent = carrera.nombre;
      idCarrera.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando carreras:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las carreras.', 'error');
  }
}

// Función para cargar los estudiantes
async function cargarEstudiantes() {
  try {
    const response = await fetch('https://localhost:7115/api/Estudiante/ObtenerEstudiantes');
    const estudiantes = await response.json();
    estudianteTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    estudiantes.forEach(estudiante => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${estudiante.id}</td>
        <td class="py-2 px-4 border-b">${estudiante.nombre}</td>
        <td class="py-2 px-4 border-b">${estudiante.apellido}</td>
        <td class="py-2 px-4 border-b">${estudiante.nroRegistro}</td>
        <td class="py-2 px-4 border-b">${estudiante.idCarrera}</td>
        <td class="py-2 px-4 border-b">${estudiante.estado}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarEstudiante(${estudiante.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarEstudiante(${estudiante.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      estudianteTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando estudiantes:', error);
    Swal.fire('Error', 'Hubo un problema al cargar los estudiantes.', 'error');
  }
}

// Función para editar un estudiante
async function editarEstudiante(id) {
  try {
    const response = await fetch(`https://localhost:7115/api/Estudiante/ObtenerEstudiantePorId?id=${id}`);
    const estudiante = await response.json();

    if (estudiante) {
      estudianteId.value = estudiante.id;
      nombre.value = estudiante.nombre;
      apellido.value = estudiante.apellido;
      nroRegistro.value = estudiante.nroRegistro;
      fechaNacimiento.value = estudiante.fechaNacimiento.slice(0, 10);
      estado.value = estudiante.estado;
      telefono.value = estudiante.telefono;
      email.value = estudiante.email;
      cargarCarreras().then(() => {
        idCarrera.value = estudiante.idCarrera;
      });

      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Estudiante";
    } else {
      Swal.fire('Error', 'Estudiante no encontrado.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al obtener el estudiante.', 'error');
  }
}

// Función para guardar un estudiante
async function guardarEstudiante(event) {
  event.preventDefault();

  const id = estudianteId.value;
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const nroRegistro = document.getElementById('nroRegistro').value;
  const fechaNacimiento = document.getElementById('fechaNacimiento').value;
  const estado = document.getElementById('estado').value;
  const telefono = document.getElementById('telefono').value;
  const email = document.getElementById('email').value;
  const idCarrera = document.getElementById('idCarrera').value;

  const estudiante = { idCarrera, nombre, apellido, nroRegistro, fechaNacimiento, estado, telefono, email };

  let url = 'https://localhost:7115/api/Estudiante/GuardarEstudiante';
  let method = 'POST';

  if (id) {
    url = 'https://localhost:7115/api/Estudiante/ActualizarEstudiante';
    method = 'PUT';
    estudiante.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estudiante),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Estudiante ${id ? 'actualizado' : 'agregado'} correctamente.`, 'success');
      cargarEstudiantes();
      cerrarFormulario();
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar el estudiante.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al guardar el estudiante.', 'error');
  }
}

// Función para eliminar un estudiante
async function eliminarEstudiante(id) {
  const confirmResult = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (confirmResult.isConfirmed) {
    try {
      const response = await fetch(`https://localhost:7115/api/Estudiante/EliminarEstudiante?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        Swal.fire('Eliminado', 'El estudiante ha sido eliminado correctamente.', 'success');
        cargarEstudiantes();
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar el estudiante.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el estudiante.', 'error');
    }
  }
}

// Cargar los estudiantes al cargar la página
cargarEstudiantes();

// Manejar el envío del formulario
estudianteForm.addEventListener('submit', guardarEstudiante);