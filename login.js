// scripts/login.js
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://localhost:7115/api/Usuarios/LogIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.succeded) {
      const authInfo = {
        token: data.data.jwtToken,
        userId: data.data.idUsuario,
        userName: data.data.userName,
        userRole: data.data.rol,
        userInfo: data.data.datosUsuario
      };

      localStorage.setItem('authInfo', JSON.stringify(authInfo));

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = 'dashboard.html';
      });
    } else {
      Swal.fire({
        title: 'Invalid email or password',
        icon: 'error',
        showConfirmButton: true
      });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    Swal.fire({
      title: 'An error occurred during login',
      icon: 'error',
      showConfirmButton: true
    });
  }
});