// Función de logout
function logout() {
  localStorage.removeItem('authInfo');
  window.location.href = 'login.html';
}

// Chequeo de autenticación y personalización del mensaje al cargar el dashboard
document.addEventListener('DOMContentLoaded', () => {
  const authInfo = JSON.parse(localStorage.getItem('authInfo'));
  if (!authInfo) {
    alert('Por favor, inicie sesión');
    window.location.href = 'login.html';
  } else {
    const userName = authInfo.userInfo.nombre;
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Sesión Iniciada: ${userName}`;
  }
});

// Funciones para alternar la visibilidad de los menús
function toggleMenu(menu) {
  const menuElement = document.getElementById(`${menu}Menu`);
  const arrowElement = document.getElementById(`${menu}Arrow`);

  if (menuElement.classList.contains('hidden')) {
    menuElement.classList.remove('hidden');
    arrowElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>';
  } else {
    menuElement.classList.add('hidden');
    arrowElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';
  }
}