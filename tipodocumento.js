// Elementos del DOM
const tipoDocumentoTableBody = document.getElementById('tipoDocumentoTableBody');
const tipoDocumentoForm = document.getElementById('tipoDocumentoForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const tipoDocumentoId = document.getElementById('tipoDocumentoId');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');
const fechaExpiracion = document.getElementById('fechaExpiracion');
const categoriaDocumento = document.getElementById('categoriaDocumento');

// Función para cargar las categorías de documentos
async function cargarCategoriaDocumentos() {
  try {
    const response = await fetch('https://localhost:7115/api/CategoriaDocumento/ObtenerCategoriaDocumentos');
    const data = await response.json();
    
    categoriaDocumento.innerHTML = '<option value="">Seleccione una categoría</option>'; // Reset first
    
    data.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      categoriaDocumento.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando categorías de documentos:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las categorías de documentos.', 'error');
  }
}

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  tipoDocumentoForm.reset();
  modalTitulo.textContent = "Agregar Tipo de Documento";
  tipoDocumentoId.value = ''; // Limpiar el id
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar los tipos de documento
async function cargarTipoDocumentos() {
  try {
    const response = await fetch('https://localhost:7115/api/TipoDocumento/ObtenerTipoDocumentos');
    const data = await response.json();
    tipoDocumentoTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    data.forEach(tipoDocumento => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${tipoDocumento.id}</td>
        <td class="py-2 px-4 border-b">${tipoDocumento.nombre}</td>
        <td class="py-2 px-4 border-b">${tipoDocumento.descripcion}</td>
        <td class="py-2 px-4 border-b">${new Date(tipoDocumento.fechaExpiracion).toLocaleString()}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarTipoDocumento(${tipoDocumento.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarTipoDocumento(${tipoDocumento.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tipoDocumentoTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando tipos de documento:', error);
    Swal.fire('Error', 'Hubo un problema al cargar los tipos de documento.', 'error');
  }
}

// Función para editar un tipo de documento
async function editarTipoDocumento(id) {
  try {
    const response = await fetch(`https://localhost:7115/api/TipoDocumento/ObtenerTipoDocumentoPorId?id=${id}`);
    const tipoDocumento = await response.json();

    if (tipoDocumento) {
      tipoDocumentoId.value = tipoDocumento.id;
      nombre.value = tipoDocumento.nombre;
      descripcion.value = tipoDocumento.descripcion;
      fechaExpiracion.value = tipoDocumento.fechaExpiracion.substring(0, 16);
      categoriaDocumento.value = tipoDocumento.idCategoriaDocumento;

      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Tipo de Documento";
    } else {
      Swal.fire('Error', 'Tipo de documento no encontrado.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al obtener el tipo de documento.', 'error');
  }
}

// Función para guardar un tipo de documento
async function guardarTipoDocumento(event) {
  event.preventDefault();

  const id = tipoDocumentoId.value;
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const fechaExpiracion = document.getElementById('fechaExpiracion').value;
  const idCategoriaDocumento = categoriaDocumento.value;

  const tipoDocumento = { 
    nombre, 
    descripcion, 
    fechaExpiracion,
    idCategoriaDocumento: parseInt(idCategoriaDocumento)
  };

  let url = 'https://localhost:7115/api/TipoDocumento/GuardarTipoDocumento';
  let method = 'POST';

  if (id) {
    url = 'https://localhost:7115/api/TipoDocumento/ActualizarDocumento';
    method = 'PUT';
    tipoDocumento.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tipoDocumento),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Tipo de documento ${id ? 'actualizado' : 'agregado'} correctamente.`, 'success');
      cargarTipoDocumentos();
      cerrarFormulario();
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar el tipo de documento.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
  }
}

// Función para eliminar un tipo de documento
async function eliminarTipoDocumento(id) {
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
      const response = await fetch(`https://localhost:7115/api/TipoDocumento/EliminarTipoDocumento?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        Swal.fire('Eliminado', 'El tipo de documento ha sido eliminado.', 'success');
        cargarTipoDocumentos();
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar el tipo de documento.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
    }
  }
}

// Inicializar
tipoDocumentoForm.addEventListener('submit', guardarTipoDocumento);
window.onload = () => {
  cargarCategoriaDocumentos();
  cargarTipoDocumentos();
};