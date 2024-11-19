// Elementos del DOM
const categoriaDocumentoTableBody = document.getElementById('categoriaDocumentoTableBody');
const categoriaDocumentoForm = document.getElementById('categoriaDocumentoForm');
const modalFormulario = document.getElementById('modalFormulario');
const modalTitulo = document.getElementById('modalTitulo');
const categoriaDocumentoId = document.getElementById('categoriaDocumentoId');
const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');

// Función para abrir el formulario de agregar
function abrirFormularioAgregar() {
  modalFormulario.classList.remove('hidden');
  categoriaDocumentoForm.reset();
  modalTitulo.textContent = "Agregar Categoría de Documento";
  categoriaDocumentoId.value = ''; // Limpiar el id
}

// Función para cerrar el formulario
function cerrarFormulario() {
  modalFormulario.classList.add('hidden');
}

// Función para cargar las categorías de documento
async function cargarCategoriasDocumento() {
  try {
    const response = await fetch('https://localhost:7115/api/CategoriaDocumento/ObtenerCategoriaDocumentos');
    const data = await response.json();
    categoriaDocumentoTableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    data.forEach(categoria => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${categoria.id}</td>
        <td class="py-2 px-4 border-b">${categoria.nombre}</td>
        <td class="py-2 px-4 border-b">${categoria.descripcion}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editarCategoriaDocumento(${categoria.id})" class="text-indigo-500 hover:text-indigo-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarCategoriaDocumento(${categoria.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      categoriaDocumentoTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando categorías de documento:', error);
    Swal.fire('Error', 'Hubo un problema al cargar las categorías de documento.', 'error');
  }
}

// Función para editar una categoría de documento
async function editarCategoriaDocumento(id) {
  try {
    const response = await fetch(`https://localhost:7115/api/CategoriaDocumento/ObtenerCategoriaDocumentoPorId?id=${id}`);
    const categoria = await response.json();

    if (categoria) {
      categoriaDocumentoId.value = categoria.id;
      nombre.value = categoria.nombre;
      descripcion.value = categoria.descripcion;

      modalFormulario.classList.remove('hidden');
      modalTitulo.textContent = "Editar Categoría de Documento";
    } else {
      Swal.fire('Error', 'Categoría de documento no encontrada.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al obtener la categoría de documento.', 'error');
  }
}

// Función para guardar una categoría de documento
async function guardarCategoriaDocumento(event) {
  event.preventDefault();

  const id = categoriaDocumentoId.value;
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;

  const categoria = { nombre, descripcion };

  let url = 'https://localhost:7115/api/CategoriaDocumento/GuardarCategoriaDocumento';
  let method = 'POST';

  if (id) {
    url = 'https://localhost:7115/api/CategoriaDocumento/ActualizarCategoriaDocumento';
    method = 'PUT';
    categoria.id = id;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoria),
    });

    if (response.ok) {
      Swal.fire('Éxito', `Categoría de documento ${id ? 'actualizada' : 'agregada'} correctamente.`, 'success');
      cargarCategoriasDocumento();
      cerrarFormulario();
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'Hubo un problema al guardar la categoría de documento.', 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
  }
}

// Función para eliminar una categoría de documento
async function eliminarCategoriaDocumento(id) {
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
      const response = await fetch(`https://localhost:7115/api/CategoriaDocumento/EliminarCategoriaDocumento?id=${id}`, { method: 'DELETE' });

      if (response.ok) {
        Swal.fire('Eliminado', 'La categoría de documento ha sido eliminada.', 'success');
        cargarCategoriasDocumento();
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la categoría de documento.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al comunicarse con la API.', 'error');
    }
  }
}

// Inicializar
categoriaDocumentoForm.addEventListener('submit', guardarCategoriaDocumento);
window.onload = cargarCategoriasDocumento;
