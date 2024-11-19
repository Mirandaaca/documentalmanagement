// Elementos del DOM
const gestionTableBody = document.getElementById('gestionTableBody');
const gestionForm = document.getElementById('gestionForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const gestionId = document.getElementById('gestionId');
const anioGestion = document.getElementById('anioGestion');
const fechaPrimerSemestreInicio = document.getElementById('fechaPrimerSemestreInicio');
const fechaSegundoSemestreInicio = document.getElementById('fechaSegundoSemestreInicio');
const fechaPrimerSemestreFin = document.getElementById('fechaPrimerSemestreFin');
const fechaSegundoSemestreFin = document.getElementById('fechaSegundoSemestreFin');
const correoInstitucion = document.getElementById('correoInstitucion');

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  gestionForm.reset();
  modalTitulo.textContent = "Agregar Gestión";
  gestionId.value = ''; // Limpiar el id
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar las gestiones
async function cargarGestiones() {
  try {
    const response = await fetch('https://localhost:7115/api/Gestion/ObtenerGestiones');
    const data = await response.json();
    gestionTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    data.forEach(gestion => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${gestion.id}</td>
        <td class="py-2 px-4 border-b">${gestion.anioGestion}</td>
        <td class="py-2 px-4 border-b">${new Date(gestion.fechaPrimerSemestreInicio).toLocaleString()}</td>
        <td class="py-2 px-4 border-b">${new Date(gestion.fechaPrimerSemestreFin).toLocaleString()}</td>
        <td class="py-2 px-4 border-b">${new Date(gestion.fechaSegundoSemestreInicio).toLocaleString()}</td>
        <td class="py-2 px-4 border-b">${new Date(gestion.fechaSegundoSemestreFin).toLocaleString()}</td>
        <td class="py-2 px-4 border-b">${gestion.correoInstitucion}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarGestion(${gestion.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarGestion(${gestion.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      gestionTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando gestiones:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las gestiones.', 'error');
  }
}

// Función para editar una gestión
async function editarGestion(id) {
  try {
    const response = await fetch(`https://localhost:7115/api/Gestion/ObtenerGestionPorId?id=${id}`);
    const gestion = await response.json();

    if (gestion) {
      gestionId.value = gestion.id;
      anioGestion.value = gestion.anioGestion;
      fechaPrimerSemestreInicio.value = gestion.fechaPrimerSemestreInicio.substring(0, 16);
      fechaSegundoSemestreInicio.value = gestion.fechaSegundoSemestreInicio.substring(0, 16);
      fechaPrimerSemestreFin.value = gestion.fechaPrimerSemestreFin.substring(0, 16);
      fechaSegundoSemestreFin.value = gestion.fechaSegundoSemestreFin.substring(0, 16);
      correoInstitucion.value = gestion.correoInstitucion;

      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Gestión";
    } else {
      Swal.fire('Error', 'Gestión no encontrada.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al obtener la gestión.', 'error');
  }
}

// Función para guardar una gestión
async function guardarGestion(event) {
  event.preventDefault();

  const id = gestionId.value;
  const gestion = {
    anioGestion: parseInt(anioGestion.value),
    fechaPrimerSemestreInicio: new Date(fechaPrimerSemestreInicio.value).toISOString(),
    fechaSegundoSemestreInicio: new Date(fechaSegundoSemestreInicio.value).toISOString(),
    fechaPrimerSemestreFin: new Date(fechaPrimerSemestreFin.value).toISOString(),
    fechaSegundoSemestreFin: new Date(fechaSegundoSemestreFin.value).toISOString(),
    correoInstitucion: correoInstitucion.value
  };

  let url = 'https://localhost:7115/api/Gestion/GuardarGestion';
  let method = 'POST';

  if (id) {
    url = 'https://localhost:7115/api/Gestion/ActualizarGestion';
    method = 'PUT';
    gestion.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gestion),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Gestión ${id ? 'actualizada' : 'agregada'} correctamente.`, 'success');
      cargarGestiones();
      cerrarFormulario();
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar la gestión.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
  }
}

// Función para eliminar una gestión
async function eliminarGestion(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Esta acción no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`https://localhost:7115/api/Gestion/EliminarGestion?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        Swal.fire('Eliminado', 'La gestión ha sido eliminada.', 'success');
        cargarGestiones();
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la gestión.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
    }
  }
}

// Inicializar
gestionForm.addEventListener('submit', guardarGestion);
window.onload = cargarGestiones;