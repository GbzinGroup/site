    const firebaseConfig = {
      apiKey: "AIzaSyCoItMJvhaxd-B1LqmHBECajkC-ZnWzQDM",
      authDomain: "bancdata-8eb82.firebaseapp.com",
      databaseURL: "https://bancdata-8eb82-default-rtdb.firebaseio.com",
      projectId: "bancdata-8eb82",
      storageBucket: "bancdata-8eb82.firebasestorage.app",
      messagingSenderId: "774993909670",
      appId: "1:774993909670:web:6895c0a91a6bb2799ca167"
    };

    const debugInfo = document.getElementById('debugInfo');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    function updateDebug(message) {
      console.log(message);
      debugInfo.textContent = `Status: ${message}`;
    }

    try {
      firebase.initializeApp(firebaseConfig);
      updateDebug('Firebase inicializado com sucesso');
    } catch (error) {
      updateDebug(`Erro ao inicializar Firebase: ${error.message}`);
    }

    const auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
      if (user) {
        updateDebug(`Usuário logado: ${user.email}`);
        successMessage.textContent = 'Login realizado com sucesso! Redirecionando...';
        successMessage.classList.add('show');
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        updateDebug('Nenhum usuário logado');
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      errorMessage.classList.remove('show');
      successMessage.classList.remove('show');
      
      if (!email || !password) {
        errorMessage.textContent = 'Preencha email e senha';
        errorMessage.classList.add('show');
        return;
      }
      
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="loading-spinner"></span> Entrando...';
      
      updateDebug(`Tentando login com: ${email}`);
      
      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        updateDebug(`Login bem-sucedido: ${userCredential.user.email}`);
        
      } catch (error) {
        console.error('Erro completo:', error);
        
        let friendlyMessage = '';
        
        switch(error.code) {
          case 'auth/invalid-email':
            friendlyMessage = 'Email inválido';
            break;
          case 'auth/user-disabled':
            friendlyMessage = 'Usuário desativado';
            break;
          case 'auth/user-not-found':
            friendlyMessage = 'Usuário não encontrado. Verifique o email.';
            break;
          case 'auth/wrong-password':
            friendlyMessage = 'Senha incorreta. Tente novamente.';
            break;
          case 'auth/invalid-credential':
            friendlyMessage = 'Credenciais inválidas. Email ou senha incorretos.';
            break;
          case 'auth/too-many-requests':
            friendlyMessage = 'Muitas tentativas. Aguarde alguns minutos.';
            break;
          case 'auth/network-request-failed':
            friendlyMessage = 'Erro de conexão. Verifique sua internet.';
            break;
          case 'auth/operation-not-allowed':
            friendlyMessage = 'Login por email/senha não está habilitado no Firebase.';
            break;
          case 'auth/configuration-not-found':
            friendlyMessage = 'Configuração não encontrada. Verifique o Firebase Console.';
            break;
          default:
            friendlyMessage = `Erro: ${error.message}`;
        }
        
        errorMessage.textContent = friendlyMessage;
        errorMessage.classList.add('show');
        updateDebug(`Erro no login: ${error.code}`);
        
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Entrar';
      }
    });

    updateDebug('Sistema pronto para login');