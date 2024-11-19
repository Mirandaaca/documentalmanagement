const baseUrl = 'https://localhost:7115/api';
let editandoDocumento = false;

// Abrir formulario para agregar
function abrirFormularioAgregar() {
    editandoDocumento = false;
    document.getElementById('documentoId').value = '';
    document.getElementById('modalTitulo').textContent = 'Agregar Documento';
    document.getElementById('documentoForm').reset();
    document.getElementById('archivoDocumento').required = true;
    document.getElementById('archivoActual').classList.add('hidden');
    document.getElementById('modalFormulario').classList.remove('hidden');
    cargarDatosDinamicos();
}

// Función mejorada para abrir el formulario de edición
async function abrirFormularioEditar(id) {
  try {
      editandoDocumento = true;
      document.getElementById('documentoId').value = id;
      document.getElementById('modalTitulo').textContent = 'Editar Documento';
      document.getElementById('archivoDocumento').required = false;
      
      await cargarDatosDinamicos();
      
      const response = await fetch(`${baseUrl}/Documento/ObtenerDocumentoPorId?id=${id}`);
      if (!response.ok) {
          throw new Error('Error al cargar el documento');
      }
      
      const documento = await response.json();
      
      setTimeout(() => {
          // Rellenar campos existentes
          document.getElementById('estudiante').value = documento.idEstudiante;
          document.getElementById('gestion').value = documento.idGestion;
          document.getElementById('tipoDocumento').value = documento.idTipoDocumento;
          document.getElementById('legalizado').value = documento.legalizado ? "true" : "false";
          
          // Mostrar archivo actual
          const archivoActualElement = document.getElementById('archivoActual');
          if (documento.nombreArchivo) {
              archivoActualElement.querySelector('span').textContent = documento.nombreArchivo;
              archivoActualElement.classList.remove('hidden');
          }
          
          document.getElementById('modalFormulario').classList.remove('hidden');
      }, 100);
      
  } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo cargar el documento para editar.', 'error');
  }
}


// Función mejorada para cargar datos dinámicos
async function cargarDatosDinamicos() {
  try {
      const [estudiantes, gestiones, tiposDocumento] = await Promise.all([
          fetch(`${baseUrl}/Estudiante/ObtenerEstudiantes`).then(res => res.json()),
          fetch(`${baseUrl}/Gestion/ObtenerGestiones`).then(res => res.json()),
          fetch(`${baseUrl}/TipoDocumento/ObtenerTipoDocumentos`).then(res => res.json())
      ]);

      

      // Poblar los selects
      poblarSelect('estudiante', estudiantes, 
          est => `${est.nombre} ${est.apellido} (${est.nroRegistro})`, 'id');
      poblarSelect('gestion', gestiones, 
          gestion => gestion.anioGestion, 'id');
      poblarSelect('tipoDocumento', tiposDocumento, 
          tipo => `${tipo.nombre} - ${tipo.descripcion}`, 'id');

  } catch (error) {
      console.error('Error al cargar datos dinámicos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos dinámicos.', 'error');
  }
}

// Función mejorada para poblar selects
function poblarSelect(elementId, datos, labelFn, valueProp = 'id') {
  const select = document.getElementById(elementId);
  if (!select) {
      console.error(`No se encontró el elemento select con id: ${elementId}`);
      return;
  }

  
  // Guardar el valor actual si existe
  const valorActual = select.value;
  
  // Limpiar el select manteniendo solo la opción por defecto
  const defaultOption = select.querySelector('option[value=""]');
  select.innerHTML = '';
  if (defaultOption) {
      select.appendChild(defaultOption);
  }
  
  // Agregar las nuevas opciones
  datos.forEach(item => {
      const option = document.createElement('option');
      option.value = item[valueProp];
      option.textContent = labelFn(item);
      select.appendChild(option);
  });
  
  // Restaurar el valor si existía
  if (valorActual) {
      select.value = valorActual;
  }
}
// Función para verificar si existe un documento similar
async function verificarDocumentoExistente(idEstudiante, idGestion, idTipoDocumento) {
  try {
      const response = await fetch(`${baseUrl}/Documento/VerificarDocumentoExistente`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              idEstudiante,
              idGestion,
              idTipoDocumento
          })
      });
      
      if (!response.ok) {
          throw new Error('Error al verificar documento existente');
      }
      
      return await response.json();
  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
}

// Guardar documento
async function guardarDocumento(event) {
  event.preventDefault();
  
  try {
      const formData = new FormData();
      const estudiante = document.getElementById('estudiante');
      const gestion = document.getElementById('gestion');
      const tipoDocumento = document.getElementById('tipoDocumento');
      const archivo = document.getElementById('archivoDocumento').files[0];
      
      // Verificar si hay un archivo seleccionado cuando es nuevo documento
      if (!editandoDocumento && !archivo) {
          Swal.fire('Error', 'Debe seleccionar un archivo.', 'error');
          return;
      }

      // Obtener información del documento existente
      const documentoExistente = await verificarDocumentoExistente(
          estudiante.value,
          gestion.value,
          tipoDocumento.value
      );
      
      // Si existe un documento similar, mostrar confirmación
      if (documentoExistente.existe) {
          const nombreEstudiante = estudiante.options[estudiante.selectedIndex].text;
          const anioGestion = gestion.options[gestion.selectedIndex].text;
          
          const result = await Swal.fire({
              title: '¡Atención!',
              html: `
                  <p>Ya existe un documento para:</p>
                  <ul class="text-left mt-2 mb-4">
                      <li><strong>Estudiante:</strong> ${nombreEstudiante}</li>
                      <li><strong>Gestión:</strong> ${anioGestion}</li>
                      <li><strong>Tipo de Documento:</strong> ${tipoDocumento.options[tipoDocumento.selectedIndex].text}</li>
                  </ul>
                  <p>¿Desea reemplazar el documento existente?</p>
              `,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, reemplazar',
              cancelButtonText: 'Cancelar'
          });
          
          if (!result.isConfirmed) {
              return;
          }
      }
      
      // Preparar FormData con los campos del formulario
      formData.append('IdEstudiante', estudiante.value);
      formData.append('IdGestion', gestion.value);
      formData.append('IdTipoDocumento', tipoDocumento.value);
      formData.append('Legalizado', document.getElementById('legalizado').value);
      formData.append('IdUsuario', JSON.parse(localStorage.getItem("authInfo")).userId);
      
      if (archivo) {
          formData.append('documento', archivo);
      }
      
      // Realizar la petición al servidor
      const response = await fetch(`${baseUrl}/Documento/SubirDocumento`, {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al procesar el documento');
      }

      await Swal.fire({
          title: 'Éxito',
          text: documentoExistente.existe ? 
              'Documento actualizado correctamente.' : 
              'Documento guardado correctamente.',
          icon: 'success'
      });
      
      cerrarFormulario();
      cargarDocumentos();
      
  } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', error.message || 'Ocurrió un error al procesar el documento.', 'error');
  }
}

// Cerrar formulario
function cerrarFormulario() {
    document.getElementById('modalFormulario').classList.add('hidden');
    document.getElementById('documentoForm').reset();
}

// Cargar la lista de documentos
async function cargarDocumentos() {
  try {
      const response = await fetch(`${baseUrl}/Documento/ObtenerDocumentos`);
      const documentos = await response.json();

      const tableBody = document.getElementById('documentoTableBody');
      tableBody.innerHTML = documentos
          .map(
              (doc) => `
              <tr>
                  <td class="border px-4 py-2">${doc.id}</td>
                  <td class="border px-4 py-2">${doc.nombreArchivo}</td>
                  <td class="border px-4 py-2">${doc.extension}</td>
                  <td class="border px-4 py-2">${doc.nombreTipoDocumento}</td>
                  <td class="border px-4 py-2">${doc.nombreEstudiante}</td>
                  <td class="border px-4 py-2">${doc.registroEstudiante}</td>
                  <td class="border px-4 py-2">${new Date(doc.fechaSubida).toLocaleDateString()}</td>
                  <td class="border px-4 py-2">
                      ${doc.legalizado 
                          ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">Legalizado</span>'
                          : '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full font-semibold">No Legalizado</span>'
                      }
                  </td>
                  <td class="border px-4 py-2">
                      <button onclick="verDocumento(${doc.id})" class="text-blue-500 hover:text-blue-700 mr-2">
                          <i class="fas fa-eye"></i>
                      </button>
                      <button onclick="abrirFormularioEditar(${doc.id})" class="text-yellow-500 hover:text-yellow-700 mr-2">
                          <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="eliminarDocumento(${doc.id})" class="text-red-500 hover:text-red-700">
                          <i class="fas fa-trash"></i>
                      </button>
                  </td>
              </tr>`
          )
          .join('');
  } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
  }
}

async function editarDocumento(id) {
  // Obtener el documento a editar (esto depende de cómo tengas almacenados los datos)
  const response = await fetch(`${baseUrl}/Documento/ObtenerDocumentoPorId?id=${id}`);
  const documento = await response.json();
  // Esta es una función ficticia. Aquí debes obtener los datos del documento.

  // Rellenar los campos del formulario con los datos del documento
  document.getElementById("estudiante").value = documento.estudianteId; // Suponiendo que cada documento tiene un estudianteId
  document.getElementById("gestion").value = documento.gestionId;
  document.getElementById("tipoDocumento").value = documento.tipoDocumentoId;
  // Si el formulario contiene un campo de archivo, no puedes establecer un valor directamente en un input tipo file, pero puedes actualizar la interfaz para mostrar que hay un archivo cargado.

  // Cambiar el título del modal
  document.getElementById("modalTitulo").innerText = "Editar Documento";
  
  // Mostrar el modal
  document.getElementById("modalFormulario").classList.remove("hidden");
}
// Ver documento
// Ver documento en un modal
// Función para ver documento
async function verDocumento(docId) {
  try {
      // Obtén el documento desde la API
      const response = await fetch(`${baseUrl}/Documento/ObtenerDocumentoPorId?id=${docId}`);
      const documento = await response.json();
      
      // Accede al modal y los elementos dentro de él
      const modal = document.getElementById('modalVerDocumento');
      const modalContenido = document.getElementById('modalDocumentoContenido');
      const modalTitulo = document.getElementById('modalDocumentoTitulo');
      
      // Asigna los datos del documento al modal
      modalTitulo.innerHTML = `Documento: ${documento.nombreEstudiante} - ${documento.nombreTipoDocumento}`;
      
      // Mostrar el documento en base64 en el modal
      if (documento.contenido) {
          const base64String = documento.contenido;
          const extension = documento.extension.toLowerCase();
          
          // Limpiar el contenido previo
          modalContenido.innerHTML = '';
          
          // Configurar el visor según el tipo de archivo
          if (extension === '.pdf') {
              modalContenido.innerHTML = `
                  <embed 
                      src="data:application/pdf;base64,${base64String}" 
                      type="application/pdf"
                      class="w-full h-full"
                      style="min-height: 600px;"
                  >`;
          } else if (extension === '.jpg' || extension === '.png' || extension === '.jpeg') {
              // Crear un contenedor para la imagen con scroll si es necesario
              const imgContainer = document.createElement('div');
              imgContainer.className = 'w-full h-full flex items-center justify-center';
              
              const img = document.createElement('img');
              img.src = `data:image/${extension.replace('.', '')};base64,${base64String}`;
              img.alt = 'Documento';
              img.className = 'max-w-[90%] max-h-[550px] object-contain';
              
              imgContainer.appendChild(img);
              modalContenido.appendChild(imgContainer);
              
              // Agregar evento para manejar la carga de la imagen
              img.onload = function() {
                  if (this.naturalHeight > this.naturalWidth) {
                      this.style.height = '550px';
                      this.style.width = 'auto';
                  } else {
                      this.style.width = '90%';
                      this.style.height = 'auto';
                  }
              };
          } else {
              modalContenido.innerHTML = `
                  <div class="flex items-center justify-center h-full">
                      <div class="text-center p-4 bg-gray-50 rounded-lg">
                          <i class="fas fa-file text-4xl text-gray-400 mb-2"></i>
                          <p>Documento en formato no soportado para vista previa.</p>
                      </div>
                  </div>`;
          }
          
          // Configurar el botón de descarga
          const descargarBtn = document.getElementById('descargarDocumento');
          descargarBtn.onclick = () => descargarDocumento(base64String, documento.nombreArchivo);
          descargarBtn.style.display = 'block';
      } else {
          modalContenido.innerHTML = `
              <div class="flex items-center justify-center h-full">
                  <div class="text-center p-4 bg-gray-50 rounded-lg">
                      <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-2"></i>
                      <p>No se pudo cargar el documento.</p>
                  </div>
              </div>`;
          document.getElementById('descargarDocumento').style.display = 'none';
      }
      
      // Muestra el modal
      modal.classList.remove('hidden');
  } catch (error) {
      console.error('Error al cargar el documento:', error);
      Swal.fire('Error', 'No se pudo cargar el documento.', 'error');
  }
}

// Función para descargar el documento
function descargarDocumento(base64String, nombreArchivo) {
  try {
      const linkSource = `data:application/octet-stream;base64,${base64String}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = nombreArchivo;
      downloadLink.click();
  } catch (error) {
      console.error('Error al descargar:', error);
      Swal.fire('Error', 'No se pudo descargar el documento.', 'error');
  }
}

// Eventos para cerrar el modal
document.getElementById('cerrarModal').onclick = () => {
  document.getElementById('modalVerDocumento').classList.add('hidden');
};

document.getElementById('cerrarModalBtn').onclick = () => {
  document.getElementById('modalVerDocumento').classList.add('hidden');
};
  
// Eliminar documento
async function eliminarDocumento(docId) {
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará el documento con ID: ${docId}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${baseUrl}/Documento/EliminarDocumento?id=${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Documento eliminado correctamente.', 'success');
        cargarDocumentos(); // Recargar la lista de documentos
      } else {
        const error = await response.json();
        Swal.fire('Error', error.message || 'No se pudo eliminar el documento.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un problema al eliminar el documento.', 'error');
    }
  }
}
// Función para buscar documentos
async function buscarDocumentos() {
    const terminoBusqueda = document.getElementById('searchInput').value.toLowerCase().trim();
    
    try {
        const response = await fetch(`${baseUrl}/Documento/ObtenerDocumentos`);
        const documentos = await response.json();

        // Filtrar documentos según el término de búsqueda
        const documentosFiltrados = documentos.filter(doc => 
            doc.nombreArchivo.toLowerCase().includes(terminoBusqueda) ||
            doc.nombreEstudiante.toLowerCase().includes(terminoBusqueda) ||
            doc.registroEstudiante.toLowerCase().includes(terminoBusqueda) ||
            doc.nombreTipoDocumento.toLowerCase().includes(terminoBusqueda)
        );

        const tableBody = document.getElementById('documentoTableBody');
        tableBody.innerHTML = documentosFiltrados
            .map(
                (doc) => `
                <tr>
                    <td class="border px-4 py-2">${doc.id}</td>
                    <td class="border px-4 py-2">${doc.nombreArchivo}</td>
                    <td class="border px-4 py-2">${doc.extension}</td>
                    <td class="border px-4 py-2">${doc.nombreTipoDocumento}</td>
                    <td class="border px-4 py-2">${doc.nombreEstudiante}</td>
                    <td class="border px-4 py-2">${doc.registroEstudiante}</td>
                    <td class="border px-4 py-2">${new Date(doc.fechaSubida).toLocaleDateString()}</td>
                    <td class="border px-4 py-2">
                        ${doc.legalizado 
                            ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">Legalizado</span>'
                            : '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full font-semibold">No Legalizado</span>'
                        }
                    </td>
                    <td class="border px-4 py-2">
                        <button onclick="verDocumento(${doc.id})" class="text-blue-500 hover:text-blue-700 mr-2">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="abrirFormularioEditar(${doc.id})" class="text-yellow-500 hover:text-yellow-700 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarDocumento(${doc.id})" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`
            )
            .join('');

        // Mostrar mensaje si no hay resultados
        if (documentosFiltrados.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4 text-gray-500">
                        No se encontraron documentos que coincidan con "${terminoBusqueda}"
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error');
    }
}

// Evento para realizar búsqueda al escribir
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', buscarDocumentos);
});
// Inicializar la carga de documentos
document.addEventListener('DOMContentLoaded', cargarDocumentos);
