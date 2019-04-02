/* global window document localStorage fetch alert */

(() => {
  // Change this based on local
  const baseApiUrl = 'http://localhost:3000';
  const PUBLIC_ENDPOINT = `${baseApiUrl}/api/public`;
  const PRIVATE_ENDPOINT = `${baseApiUrl}/api/private`;

  const updateUI = () => {
    const isLoggedIn = localStorage.getItem('id_token');
    if (isLoggedIn) {
      // swap buttons
      document.getElementById('btn-login').style.display = 'none';
      document.getElementById('btn-logout').style.display = 'inline';
      const profile = JSON.parse(localStorage.getItem('profile'));
      // show username
      document.getElementById('nick').textContent = profile.email;
    }
  };

  const getUserInfo = (accessToken) => JSON.parse(atob(accessToken.split('.')[1]));

  // Handle login
  const loginUser = (accessToken) => {
    console.log(accessToken);
    const { name, email } = getUserInfo(accessToken);
    document.getElementById('nick').textContent = name;

    localStorage.setItem('id_token', accessToken);
    localStorage.setItem('profile', JSON.stringify({
      name,
      email
    }));
  };

  const handleLoginRequestResponse = (data) => {
    const loginForm = document.forms.login;

    if (data.error) {
      document.getElementById('message').textContent = data.message;
    } else {
      loginForm.classList.remove('login-form--shown');
      loginForm.reset();
      loginUser(data.accessToken);
      updateUI();
    }
  };

  const listenToEvents = () => {
    // Show login form
    document.getElementById('btn-login').addEventListener('click', () => {
      const loginForm = document.forms.login;
      loginForm.classList.add('login-form--shown');
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { email, password } = e.target.elements;

        fetch(e.target.action, {
          cache: 'no-store',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        })
        .then(response => response.json())
        .then(handleLoginRequestResponse)
        .catch((e) => {
          console.log('error', e);
        });
      }, {
        once: true
      });
    });

    // Handle logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      document.getElementById('btn-login').style.display = 'flex';
      document.getElementById('btn-logout').style.display = 'none';
      document.getElementById('nick').textContent = '';
    });

    // Handle public api call
    document.getElementById('btn-public').addEventListener('click', () => {
      // call public API
      fetch(PUBLIC_ENDPOINT, {
        cache: 'no-store',
        method: 'POST',
      })
        .then(response => response.json())
        .then((data) => {
          console.log('Message:', data);
          document.getElementById('message').textContent = '';
          document.getElementById('message').textContent = data.message;
        })
        .catch((e) => {
          console.log('error', e);
        });
    });

    // Handle private api call
    document.getElementById('btn-private').addEventListener('click', () => {
      // Call private API with JWT in header
      const token = localStorage.getItem('id_token');

      // block request from happening if no JWT token present
      if (!token) {
        document.getElementById('message').textContent = ''
        document.getElementById('message').textContent =
        'You must login to call this protected endpoint!'
        return false
      }
      // Do request to private endpoint
      fetch(PRIVATE_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then((data) => {
          console.log('Token:', data);
          document.getElementById('message').textContent = '';
          document.getElementById('message').textContent = data.message;
        })
        .catch((e) => {
          console.log('error', e);
        });
    });
  };


  const init = () => {
    listenToEvents();
    updateUI();
  };

  init();

})();
