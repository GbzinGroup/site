   document.querySelector('.search-btn').addEventListener('click', function() {
      const query = document.querySelector('.search-input').value.trim();
      if (query) {
        window.location.href = 'pages/wiki/index.html?q=' + encodeURIComponent(query);
      } else {
        document.querySelector('.search-input').focus();
      }
    });

    document.querySelector('.search-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          window.location.href = 'pages/wiki/index.html?q=' + encodeURIComponent(query);
        }
      }
    });