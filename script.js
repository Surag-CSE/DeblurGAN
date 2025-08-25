document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const elements = {
    pages: document.querySelectorAll('.page'),
    navItems: document.querySelectorAll('[data-page]'),
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    preview: document.getElementById('preview'),
    images: {
      original: document.getElementById('original-image'),
      deblurred: document.getElementById('deblurred-image')
    },
    buttons: {
      deblur: document.getElementById('deblur-btn'),
      download: document.getElementById('download-btn'),
      reset: document.getElementById('reset-btn'),
      getStarted: document.querySelector('button[data-page="upload"]')
    },
    error: document.getElementById('error-message')
  };

  // Navigation handling
  const navigate = (pageId, addToHistory = true) => {
    elements.pages.forEach(page => {
      page.classList.add('d-none');
      page.classList.remove('active');
    });

    const activePage = document.getElementById(pageId);
    if (activePage) {
      activePage.classList.remove('d-none');
      activePage.classList.add('active');
    }

    elements.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });

    if (addToHistory) {
      history.pushState({ page: pageId }, '', `#${pageId}`);
    }
  };

  // Handle navigation clicks
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = item.getAttribute('data-page');
      navigate(pageId);
    });
  });

  // "Get Started" button click
  elements.buttons.getStarted.addEventListener('click', () => {
    navigate('upload');
  });

  // File handling
  const handleFile = file => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    elements.images.original.src = url;
    elements.preview.classList.remove('hidden');
    elements.error.classList.add('hidden');
  };

  // Upload area events
  ['dragover', 'dragleave', 'drop'].forEach(event => {
    elements.uploadArea.addEventListener(event, e => {
      e.preventDefault();
      elements.uploadArea.classList.toggle('dragover', event === 'dragover');
      if (event === 'drop') handleFile(e.dataTransfer.files[0]);
    });
  });

  elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', () => handleFile(elements.fileInput.files[0]));

  // Deblur process
  elements.buttons.deblur.addEventListener('click', async () => {
    const file = elements.fileInput.files[0];
    if (!file) {
      elements.error.textContent = 'Please upload an image first.';
      elements.error.classList.remove('hidden');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const spinner = elements.buttons.deblur.querySelector('.spinner');
    elements.buttons.deblur.disabled = true;
    spinner.style.display = 'inline-block';

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Image processing failed.');

      const outputImageUrl = await response.text();
      elements.images.deblurred.src = outputImageUrl;
      elements.buttons.download.href = outputImageUrl;
      elements.buttons.download.classList.remove('hidden');
    } catch (error) {
      elements.error.textContent = error.message;
      elements.error.classList.remove('hidden');
    } finally {
      elements.buttons.deblur.disabled = false;
      spinner.style.display = 'none';
    }
  });

  // Reset and Download
  elements.buttons.download.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = elements.images.deblurred.src;
    link.download = 'enhanced_image.png';
    link.click();
  });

  elements.buttons.reset.addEventListener('click', () => {
    elements.preview.classList.add('hidden');
    elements.images.original.src = '';
    elements.images.deblurred.src = '';
    elements.fileInput.value = '';
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (event) => {
    const pageId = event.state?.page || 'welcome';
    navigate(pageId, false);
  });

  // Initialize page based on URL hash
  const initialPage = window.location.hash.slice(1) || 'welcome';
  navigate(initialPage, false);
});
