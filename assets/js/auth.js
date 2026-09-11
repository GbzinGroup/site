import { auth } from './config.js';

export function initAuth() {
  auth.onAuthStateChanged((user) => {
    console.log('Estado de autenticação mudou:', user ? 'Logado' : 'Deslogado');
    
    if (user) {
      console.log('Usuário logado:', user.email);
      
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userAvatar').textContent = (user.displayName || user.email)[0].toUpperCase();
      
      if (typeof window.loadAllData === 'function') {
        window.loadAllData();
      }
      
    } else {
      console.log('Nenhum usuário logado');
      document.getElementById('loginScreen').style.display = 'flex';
    }
  });

  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const loginBtn = document.getElementById('loginBtn');
      const loginError = document.getElementById('loginError');
      
      console.log('Tentando login com:', email);
      
      if (!email || !password) {
        showLoginError('Preencha email e senha', loginError);
        return;
      }
      
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;
      
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login realizado com sucesso:', userCredential.user.email);
        
        loginError.classList.remove('show');
        loginError.style.display = 'none';
        
        showToast('Login realizado com sucesso!', 'success');
        
      } catch (error) {
        console.error('Erro no login:', error.code, error.message);
        
        let errorMessage = 'Email ou senha incorretos';
        
        switch(error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Usuário não encontrado';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Senha incorreta';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Usuário desativado';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Erro de conexão. Verifique sua internet';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Login não habilitado no Firebase';
            break;
          default:
            errorMessage = `Erro: ${error.message}`;
        }
        
        showLoginError(errorMessage, loginError);
        
      } finally {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
      }
    });
  }
}

function showLoginError(message, element) {
  if (element) {
    element.textContent = message;
    element.classList.add('show');
    element.style.display = 'block';
    
    setTimeout(() => {
      element.classList.remove('show');
      element.style.display = 'none';
    }, 5000);
  }
}

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `admin-toast-item ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  const toastContainer = document.getElementById('adminToast');
  
  if (toastContainer) {
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}