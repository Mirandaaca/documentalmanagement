// seguimientoestudiante.js
let estudiantesData = [];
async function cargarSeguimiento() {
    try {
        const response = await fetch('https://localhost:7115/api/Estudiante/ObtenerDocumentosFaltantesYPresentadosPorCategoriaDeEstudiantes');
        estudiantesData = await response.json();
        renderizarEstudiantes(estudiantesData);
    } catch (error) {
        console.error('Error cargando el seguimiento:', error);
        Swal.fire('Error', 'Hubo un problema al cargar los datos de seguimiento.', 'error');
    }
}
function renderizarEstudiantes(data){
    const studentList = document.getElementById('studentList');
        studentList.innerHTML = '';

        data.forEach((estudiante, index) => {
            const studentCard = document.createElement('div');
            studentCard.className = 'bg-white rounded-lg shadow-lg p-6';
            
            // Crear un ID único para el contenido expandible usando índice y registro
            const contentId = `student-${index}-${estudiante.registro}`;
            
            // Cabecera del estudiante con botón para expandir/colapsar
            const headerDiv = document.createElement('div');
            headerDiv.className = 'border-b pb-4 cursor-pointer';
            headerDiv.dataset.targetId = contentId; // Guardamos el ID del contenido como data attribute
            
            headerDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <svg class="w-6 h-6 transform transition-transform duration-200" id="arrow-${contentId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                        <h2 class="text-xl font-semibold text-gray-800">${estudiante.nombreCompleto}</h2>
                    </div>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        ${estudiante.registro}
                    </span>
                </div>
                <p class="text-gray-600 mt-1 ml-8">${estudiante.email}</p>
            `;

            // Crear el contenedor del contenido expandible
            const contentDiv = document.createElement('div');
            contentDiv.id = contentId;
            contentDiv.className = 'hidden mt-4';
            contentDiv.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>';

            // Agregar evento click al header
            headerDiv.addEventListener('click', () => toggleContent(contentId));

            // Agregar elementos al studentCard
            studentCard.appendChild(headerDiv);
            studentCard.appendChild(contentDiv);
            
            // Agregar studentCard al studentList
            studentList.appendChild(studentCard);

            const categoriesContainer = contentDiv.querySelector('.grid');
            const allCategories = ['Admision', 'Habilitado', 'Graduado'];
            
            allCategories.forEach(categoria => {
                const categoryCard = document.createElement('div');
                
                // Obtener documentos faltantes y presentados para esta categoría
                const docsFaltantes = estudiante.documentosFaltantes.find(d => d.categoria === categoria);
                const docsPresentados = estudiante.documentosPresentados.find(d => d.categoria === categoria);
                
                // Determinar el estado de la categoría
                let borderColor = 'border-gray-200';
                let bgColor = 'bg-white';
                
                if (docsFaltantes && docsFaltantes.tiposDeDocumentoFaltantes.length > 0) {
                    if (!docsPresentados || docsPresentados.documentosPresentados.length === 0) {
                        borderColor = 'border-red-500';
                        bgColor = 'bg-red-50';
                    } else {
                        borderColor = 'border-orange-500';
                        bgColor = 'bg-orange-50';
                    }
                } else if (docsPresentados && docsPresentados.documentosPresentados.length > 0) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                }
                
                categoryCard.className = `border-2 rounded-lg p-4 ${borderColor} ${bgColor}`;
                
                let categoryContent = `
                    <h3 class="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                        ${categoria}
                    </h3>
                `;

                // Documentos faltantes
                if (docsFaltantes && docsFaltantes.tiposDeDocumentoFaltantes.length > 0) {
                    categoryContent += `
                        <div class="mb-4">
                            <h4 class="text-sm font-medium text-red-600 mb-2">Documentos Faltantes:</h4>
                            <ul class="space-y-2">
                                ${docsFaltantes.tiposDeDocumentoFaltantes.map(doc => `
                                    <li class="flex items-center text-sm">
                                        <svg class="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        ${doc}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `;
                }

                // Documentos presentados
                if (docsPresentados && docsPresentados.documentosPresentados.length > 0) {
                    categoryContent += `
                        <div>
                            <h4 class="text-sm font-medium text-green-600 mb-2">Documentos Presentados:</h4>
                            <ul class="space-y-2">
                                ${docsPresentados.documentosPresentados.map(doc => `
                                    <li class="flex items-center text-sm">
                                        <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <div class="flex-grow">
                                            <p class="font-medium">${doc.tipoDocumentoNombre}</p>
                                            <p class="text-xs text-gray-500">
                                                Archivo: ${doc.nombreArchivo}
                                                <br>
                                                Fecha presentado: ${new Date(doc.fechaSubida).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onclick="event.stopPropagation(); verDocumento(${doc.idDocumento})"
                                            class="ml-2 text-blue-600 hover:text-blue-800"
                                            title="Ver documento"
                                        >
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </svg>
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `;
                }

                // Si no hay documentos en ninguna categoría
                if ((!docsFaltantes || docsFaltantes.tiposDeDocumentoFaltantes.length === 0) && 
                    (!docsPresentados || docsPresentados.documentosPresentados.length === 0)) {
                    categoryContent += `
                        <p class="text-sm text-gray-500 italic">No hay documentos registrados</p>
                    `;
                }

                categoryCard.innerHTML = categoryContent;
                categoriesContainer.appendChild(categoryCard);
            });
        });
}

// Función para expandir/colapsar el contenido
function toggleContent(contentId) {
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(`arrow-${contentId}`);
    
    if (content && arrow) {
        content.classList.toggle('hidden');
        arrow.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

// El resto del código (verDocumento, descargarDocumento, eventos del modal) permanece igual...

async function verDocumento(docId) {
    try {
        const response = await fetch(`https://localhost:7115/api/Documento/ObtenerDocumentoPorId?id=${docId}`);
        const documento = await response.json();
        
        const modal = document.getElementById('modalVerDocumento');
        const modalContenido = document.getElementById('modalDocumentoContenido');
        const modalTitulo = document.getElementById('modalDocumentoTitulo');
        
        modalTitulo.textContent = `Documento: ${documento.nombreEstudiante} - ${documento.nombreTipoDocumento}`;
        
        if (documento.contenido) {
            const base64String = documento.contenido;
            const extension = documento.extension.toLowerCase();
            
            modalContenido.innerHTML = '';
            
            if (extension === '.pdf') {
                modalContenido.innerHTML = `
                    <embed 
                        src="data:application/pdf;base64,${base64String}" 
                        type="application/pdf"
                        class="w-full h-full"
                        style="min-height: 600px;"
                    >`;
            } else if (extension === '.jpg' || extension === '.png' || extension === '.jpeg') {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'w-full h-full flex items-center justify-center';
                
                const img = document.createElement('img');
                img.src = `data:image/${extension.replace('.', '')};base64,${base64String}`;
                img.alt = 'Documento';
                img.className = 'max-w-[90%] max-h-[550px] object-contain';
                
                imgContainer.appendChild(img);
                modalContenido.appendChild(imgContainer);
                
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
// Función de búsqueda
function buscarEstudiantes(searchTerm) {
    const termino = searchTerm.toLowerCase();
    const estudiantesFiltrados = estudiantesData.filter(estudiante => 
        estudiante.nombreCompleto.toLowerCase().includes(termino) ||
        estudiante.registro.toLowerCase().includes(termino) ||
        estudiante.email.toLowerCase().includes(termino)
    );
    renderizarEstudiantes(estudiantesFiltrados);
}

// Función para generar PDF
async function generarPDF() {
    const element = document.getElementById('studentList');
    
    // Guardar el estado actual de las secciones expandidas/colapsadas
    const expandedSections = new Set();
    const allContents = element.querySelectorAll('[id^="student-"]');
    allContents.forEach(content => {
        if (!content.classList.contains('hidden')) {
            expandedSections.add(content.id);
        }
    });
    
    try {
        // Mostrar indicador de carga
        Swal.fire({
            title: 'Generando PDF',
            text: 'Por favor espere...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Expandir todas las secciones para el PDF
        allContents.forEach(content => {
            content.classList.remove('hidden');
        });

        // Configuración para el PDF
        const options = {
            margin: [10, 10, 10, 10],
            filename: `seguimiento-estudiantes-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generar el PDF
        await html2pdf().from(element).set(options).save();

        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: 'PDF Generado',
            text: 'El documento se ha generado exitosamente',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el PDF'
        });
    } finally {
        // Restaurar el estado original de las secciones
        allContents.forEach(content => {
            if (!expandedSections.has(content.id)) {
                content.classList.add('hidden');
            }
        });
    }
}

// Agregar event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarSeguimiento();
    
    // Event listener para el buscador
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        buscarEstudiantes(e.target.value);
    });
});

// Eventos para cerrar el modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalVerDocumento');
    const cerrarModal = document.getElementById('cerrarModal');
    const cerrarModalBtn = document.getElementById('cerrarModalBtn');

    cerrarModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    cerrarModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Cerrar modal al hacer clic fuera de él
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Cargar el seguimiento cuando se cargue la página
    cargarSeguimiento();
});
