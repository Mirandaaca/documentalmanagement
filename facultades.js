// Archivo: facultades.js

// Elementos del DOM
const facultadesTableBody = document.getElementById('facultadesTableBody');
const addFacultyBtn = document.getElementById('addFacultyBtn');
const facultadForm = document.getElementById('facultadForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const facultadId = document.getElementById('facultadId');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  facultadForm.reset();
  modalTitulo.textContent = "Agregar Facultad";
  facultadId.value = ''; // Limpiar el id
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar las facultades
async function cargarFacultades() {
  try {
    const response = await fetch('https://localhost:7115/api/Facultad/ObtenerFacultades');
    const data = await response.json();
    facultadesTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    data.forEach(facultad => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${facultad.id}</td>
        <td class="py-2 px-4 border-b">${facultad.nombre}</td>
        <td class="py-2 px-4 border-b">${facultad.descripcion}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarFacultad(${facultad.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarFacultad(${facultad.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      facultadesTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando facultades:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las facultades.', 'error');
  }
}

// Función para editar una facultad
async function editarFacultad(id) {
  try {
    // Obtener la facultad por ID desde la API
    const response = await fetch(`https://localhost:7115/api/Facultad/ObtenerFacultadPorId?id=${id}`);
    const facultad = await response.json();

    if (facultad) {
      // Llenar los campos del formulario con los datos de la facultad
      facultadId.value = facultad.id;
      nombre.value = facultad.nombre;
      descripcion.value = facultad.descripcion;

      // Abrir el modal para editar
      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Facultad";
    } else {
      console.error('Facultad no encontrada:', id);
      Swal.fire('Error', 'Facultad no encontrada.', 'error');
    }
  } catch (error) {
    console.error('Error al obtener la facultad:', error);
    Swal.fire('Error', 'Hubo un problema al obtener la facultad.', 'error');
  }
}

// Función para agregar o editar una facultad
async function guardarFacultad(event) {
  event.preventDefault(); // Evitar el envío del formulario

  const id = facultadId.value;
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;

  const facultad = { nombre, descripcion };

  let url = 'https://localhost:7115/api/Facultad/GuardarFacultad'; // URL por defecto para agregar
  let method = 'POST'; // Método por defecto para agregar

  if (id) {
    // Si ya existe un ID, es una solicitud de actualización
    url = 'https://localhost:7115/api/Facultad/ActualizarFacultad';
    method = 'PUT';
    facultad.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facultad),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Facultad ${id ? 'actualizada' : 'agregada'} correctamente.`, 'success');
      cargarFacultades(); // Recargar la lista de facultades
      cerrarFormulario(); // Cerrar el modal
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar la facultad.', 'error');
    }
  } catch (error) {
    console.error('Error al guardar la facultad:', error);
    Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
  }
}

// Función para eliminar una facultad
async function eliminarFacultad(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Esta acción no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await fetch(`https://localhost:7115/api/Facultad/EliminarFacultad?id=${id}`, { method: 'DELETE' });
      Swal.fire('Eliminado', 'La facultad ha sido eliminada.', 'success');
      cargarFacultades(); // Recargar las facultades
    } catch (error) {
      console.error('Error al eliminar la facultad:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar la facultad.', 'error');
    }
  }
}

// Agregar evento para el envío del formulario
facultadForm.addEventListener('submit', guardarFacultad);

// Llamar a cargarFacultades al cargar la página
cargarFacultades();