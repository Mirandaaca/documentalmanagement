let estudiantesData = [];

        async function cargarSeguimiento() {
            try {
                const response = await fetch('https://localhost:7115/api/Documento/SeguimientoEstudiantes');
                estudiantesData = await response.json();
                renderizarEstudiantes(estudiantesData);
            } catch (error) {
                console.error('Error cargando el seguimiento:', error);
                Swal.fire('Error', 'Hubo un problema al cargar los datos de seguimiento.', 'error');
            }
        }

        function renderizarEstudiantes(estudiantes) {
            const studentList = document.getElementById('studentList');
            studentList.innerHTML = '';

            estudiantes.forEach((estudiante, index) => {
                const studentCard = document.createElement('div');
                studentCard.className = 'bg-white rounded-lg shadow-lg p-6';
                
                const menorDiasRestantes = estudiante.documentosFaltantes.reduce((min, doc) => 
                    doc.diasRestantes < min ? doc.diasRestantes : min, 
                    estudiante.documentosFaltantes[0]?.diasRestantes || 0
                );
                
                let borderColor = 'border-gray-200';
                let bgColor = 'bg-white';
                
                if (menorDiasRestantes <= 10) {
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-50';
                } else if (menorDiasRestantes <= 40) {
                    borderColor = 'border-orange-500';
                    bgColor = 'bg-orange-50';
                } else if (menorDiasRestantes > 70) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                }
                
                studentCard.className = `border-2 ${borderColor} ${bgColor} rounded-lg shadow-lg p-6`;

                const contentId = `student-${index}-${estudiante.nroRegistro}`;
                
                studentCard.innerHTML = `
                    <div class="border-b pb-4">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <svg class="w-6 h-6 transform transition-transform duration-200 cursor-pointer" 
                                     id="arrow-${contentId}" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                     onclick="toggleContent('${contentId}')">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                                <h2 class="text-xl font-semibold text-gray-800">
                                    ${estudiante.nombre} ${estudiante.apellido}
                                </h2>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="enviarEmailIndividual('${estudiante.correo}')" 
                                        class="text-blue-600 hover:text-blue-800"
                                        title="Enviar email">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    ${estudiante.nroRegistro}
                                </span>
                            </div>
                        </div>
                        <div class="ml-8 mt-2 space-y-1">
                            <p class="text-gray-600">${estudiante.correo}</p>
                            <p class="text-sm">
                                <span class="font-medium">Próxima expiración:</span> 
                                ${moment(estudiante.fechaProximaExpiracion).format('DD [de] MMMM [del] YYYY')}
                                (${estudiante.diasParaProximaExpiracion} días restantes)
                            </p>
                        </div>
                    </div>
                    
                    <div id="${contentId}" class="hidden mt-4">
                        <div class="space-y-4">
                            <h3 class="text-lg font-medium text-gray-700">Documentos Faltantes</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${estudiante.documentosFaltantes.map(doc => {
                                    let statusColor;
                                    let statusBg;
                                    
                                    if (doc.estaExpirado) {
                                        statusColor = 'text-red-700';
                                        statusBg = 'bg-red-100';
                                    } else if (doc.diasRestantes <= 10) {
                                        statusColor = 'text-red-700';
                                        statusBg = 'bg-red-100';
                                    } else if (doc.diasRestantes <= 40) {
                                        statusColor = 'text-orange-700';
                                        statusBg = 'bg-orange-100';
                                    } else {
                                        statusColor = 'text-green-700';
                                        statusBg = 'bg-green-100';
                                    }
                                    
                                    return `
                                        <div class="border rounded-lg p-4">
                                            <div class="flex justify-between items-start">
                                                <div>
                                                    <h4 class="font-medium text-gray-800">
                                                        ${doc.nombreDocumento}
                                                    </h4>
                                                    <p class="text-sm text-gray-600">
                                                        ${doc.semestre}
                                                    </p>
                                                </div>
                                                <span class="px-3 py-1 rounded-full text-sm ${statusColor} ${statusBg}">
                                                    ${doc.estaExpirado 
                                                        ? `Debió presentarse hace ${Math.abs(doc.diasRestantes)} días`
                                                        : `${doc.diasRestantes} días restantes para presentarse`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;

                studentList.appendChild(studentCard);
            });
        }

        function toggleContent(contentId) {
            const content = document.getElementById(contentId);
            const arrow = document.getElementById(`arrow-${contentId}`);
            content.classList.toggle('hidden');
            arrow.style.transform = content.classList.contains('hidden') 
                ? 'rotate(0deg)' 
                : 'rotate(180deg)';
        }

        function buscarEstudiantes(searchTerm) {
            const termino = searchTerm.toLowerCase();
            const estudiantesFiltrados = estudiantesData.filter(estudiante => 
                estudiante.nombre.toLowerCase().includes(termino) ||
                estudiante.apellido.toLowerCase().includes(termino) ||
                estudiante.nroRegistro.toLowerCase().includes(termino) ||
                estudiante.correo.toLowerCase().includes(termino)
            );
            renderizarEstudiantes(estudiantesFiltrados);
        }

        async function enviarEmailATodos() {
            try {
                const response = await fetch('https://localhost:7115/api/Documento/EnviarEmailATodos', {
                    method: 'POST'
                });

                if (response.ok) {
                    Swal.fire('Éxito', 'Se han enviado los correos exitosamente', 'success');
                } else {
                    throw new Error('Error al enviar los correos');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudieron enviar los correos', 'error');
            }
        }

        async function enviarEmailIndividual(correo) {
            try {
                const response = await fetch('https://localhost:7115/api/Documento/EnviarEmailIndividual', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: estudiante.correo })
                });

                if (response.ok) {
                    Swal.fire('Éxito', 'Se ha enviado el correo exitosamente', 'success');
                } else {
                    throw new Error('Error al enviar el correo');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudo enviar el correo', 'error');
            }
        }
        // Asegúrate de tener incluida la librería html2pdf.js en el head:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

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
        // Mostrar un indicador de carga
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
            const arrowId = `arrow-${content.id}`;
            const arrow = document.getElementById(arrowId);
            if (arrow) {
                arrow.style.transform = 'rotate(180deg)';
            }
        });

        // Configuración para el PDF
        const options = {
            margin: [10, 10, 10, 10],
            filename: `seguimiento-estudiantes-${moment().format('YYYY-MM-DD')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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
            text: 'No se pudo generar el PDF. Por favor, intente nuevamente.',
        });
    } finally {
        // Restaurar el estado original de las secciones
        allContents.forEach(content => {
            if (!expandedSections.has(content.id)) {
                content.classList.add('hidden');
                const arrowId = `arrow-${content.id}`;
                const arrow = document.getElementById(arrowId);
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }
}
// Cargar datos cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarSeguimiento);

