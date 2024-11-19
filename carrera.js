// Elementos del DOM
const carreraTableBody = document.getElementById('carreraTableBody');
const carreraForm = document.getElementById('carreraForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const carreraId = document.getElementById('carreraId');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');
const idFacultad = document.getElementById('idFacultad');

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  carreraForm.reset();
  modalTitulo.textContent = "Agregar Carrera";
  carreraId.value = ''; // Limpiar el id
  cargarFacultades();
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar las facultades
async function cargarFacultades() {
  try {
    const response = await fetch('https://localhost:7115/api/Facultad/ObtenerFacultades'); // Asumiendo el endpoint de Facultades
    const facultades = await response.json();
    idFacultad.innerHTML = '<option value="">Seleccione una facultad</option>';

    facultades.forEach(facultad => {
      const option = document.createElement('option');
      option.value = facultad.id;
      option.textContent = facultad.nombre;
      idFacultad.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando facultades:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las facultades.', 'error');
  }
}

// Función para cargar las carreras
async function cargarCarreras() {
  try {
    const response = await fetch('https://localhost:7115/api/Carrera/ObtenerCarreras');
    const carreras = await response.json();
    carreraTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    carreras.forEach(carrera => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${carrera.id}</td>
        <td class="py-2 px-4 border-b">${carrera.nombre}</td>
        <td class="py-2 px-4 border-b">${carrera.descripcion}</td>
        <td class="py-2 px-4 border-b">${carrera.idFacultad}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarCarrera(${carrera.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarCarrera(${carrera.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      carreraTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando carreras:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las carreras.', 'error');
  }
}

// Función para editar una carrera
async function editarCarrera(id) {
  try {
    const response = await fetch(`https://localhost:7115/api/Carrera/ObtenerCarreraPorId?id=${id}`);
    const carrera = await response.json();

    if (carrera) {
      carreraId.value = carrera.id;
      nombre.value = carrera.nombre;
      descripcion.value = carrera.descripcion;
      cargarFacultades().then(() => {
        idFacultad.value = carrera.idFacultad;
      });

      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Carrera";
    } else {
      Swal.fire('Error', 'Carrera no encontrada.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al obtener la carrera.', 'error');
  }
}

// Función para guardar una carrera
async function guardarCarrera(event) {
  event.preventDefault();

  const id = carreraId.value;
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const idFacultad = document.getElementById('idFacultad').value;

  const carrera = { nombre, descripcion, idFacultad };

  let url = 'https://localhost:7115/api/Carrera/GuardarCarrera';
  let method = 'POST';

  if (id) {
    url = 'https://localhost:7115/api/Carrera/ActualizarCarrera';
    method = 'PUT';
    carrera.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carrera),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Carrera ${id ? 'actualizada' : 'agregada'} correctamente.`, 'success');
      cargarCarreras();
      cerrarFormulario();
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar la carrera.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al guardar la carrera.', 'error');
  }
}

// Función para eliminar una carrera
async function eliminarCarrera(id) {
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
      const response = await fetch(`https://localhost:7115/api/Carrera/EliminarCarrera?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        Swal.fire('Eliminado', 'La carrera ha sido eliminada correctamente.', 'success');
        cargarCarreras();
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la carrera.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar la carrera.', 'error');
    }
  }
}

// Cargar las carreras al cargar la página
cargarCarreras();

// Manejar el envío del formulario
carreraForm.addEventListener('submit', guardarCarrera);
