const baseUrl = 'https://localhost:7115/api';
let editandoUsuario = false;

// Abrir formulario para agregar usuario
function abrirFormularioAgregarUsuario() {
    editandoUsuario = false;
    document.getElementById('usuarioId').value = '';
    document.getElementById('modalTituloUsuario').textContent = 'Agregar Usuario';
    document.getElementById('usuarioForm').reset();
    document.getElementById('modalFormularioUsuario').classList.remove('hidden');
    document.getElementById('password').required = true;
}

// Abrir formulario para editar usuario
async function abrirFormularioEditarUsuario(id) {
    try {
        editandoUsuario = true;
        document.getElementById('usuarioId').value = id;
        document.getElementById('modalTituloUsuario').textContent = 'Editar Usuario';
        document.getElementById('password').required = false;

        const response = await fetch(`${baseUrl}/Usuarios/ObtenerUsuarios`);
        const result = await response.json();
        const usuario = result.data.find(u => u.id === id);

        if (usuario) {
            document.getElementById('nombre').value = usuario.nombre;
            document.getElementById('apellido').value = usuario.apellido;
            document.getElementById('email').value = usuario.email;
            document.getElementById('role').value = usuario.role;
            document.getElementById('fechaNacimiento').value = new Date(usuario.fechaDeNacimiento).toISOString().split('T')[0];
            document.getElementById('modalFormularioUsuario').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo cargar el usuario para editar.', 'error');
    }
}

// Guardar usuario
async function guardarUsuario(event) {
    event.preventDefault();
    
    try {
        const usuario = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            fechaDeNacimiento: new Date(document.getElementById('fechaNacimiento').value).toISOString()
        };

        // Si hay contraseña o es un nuevo usuario, incluirla
        const password = document.getElementById('password').value;
        if (password || !editandoUsuario) {
            usuario.password = password;
        }

        const response = await fetch(`${baseUrl}/Usuarios/CrearUsuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar el usuario');
        }

        await Swal.fire({
            title: 'Éxito',
            text: editandoUsuario ? 'Usuario actualizado correctamente.' : 'Usuario guardado correctamente.',
            icon: 'success'
        });

        cerrarFormularioUsuario();
        cargarUsuarios();

    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', error.message || 'Ocurrió un error al procesar el usuario.', 'error');
    }
}

// Cerrar formulario
function cerrarFormularioUsuario() {
    document.getElementById('modalFormularioUsuario').classList.add('hidden');
    document.getElementById('usuarioForm').reset();
}

// Cargar la lista de usuarios
async function cargarUsuarios() {
    try {
        const response = await fetch(`${baseUrl}/Usuarios/ObtenerUsuarios`);
        const result = await response.json();
        const usuarios = result.data;

        const tableBody = document.getElementById('usuariosTableBody');
        tableBody.innerHTML = usuarios
            .map(
                (usuario) => `
                <tr>
                    <td class="border px-4 py-2">${usuario.id}</td>
                    <td class="border px-4 py-2">${usuario.nombre}</td>
                    <td class="border px-4 py-2">${usuario.apellido}</td>
                    <td class="border px-4 py-2">${usuario.email}</td>
                    <td class="border px-4 py-2">${usuario.role}</td>
                    <td class="border px-4 py-2">${new Date(usuario.fechaDeNacimiento).toLocaleDateString()}</td>
                    <td class="border px-4 py-2">
                        <button onclick="abrirFormularioEditarUsuario('${usuario.id}')" class="text-yellow-500 hover:text-yellow-700 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarUsuario('${usuario.id}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`
            )
            .join('');
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
    }
}

// Eliminar usuario
async function eliminarUsuario(userId) {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`${baseUrl}/Usuarios/EliminarUsuario?id=${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'No se pudo eliminar el usuario');
            }

            await Swal.fire('Éxito', 'Usuario eliminado correctamente.', 'success');
            cargarUsuarios();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.message || 'Ocurrió un error al eliminar el usuario.', 'error');
        }
    }
}

// Inicializar la carga de usuarios
document.addEventListener('DOMContentLoaded', cargarUsuarios);