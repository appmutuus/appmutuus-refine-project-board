const openModalBtn = document.getElementById('open-modal');
const modeModal = document.getElementById('mode-modal');
const jobModeBtn = document.getElementById('job-mode');
const karmaModeBtn = document.getElementById('karma-mode');
const closeModalBtn = document.getElementById('close-modal');
const jobForm = document.getElementById('job-form');
const karmaForm = document.getElementById('karma-form');
const jobBackBtn = document.getElementById('job-back');
const karmaBackBtn = document.getElementById('karma-back');

function showModal() {
  modeModal.classList.remove('hidden');
  openModalBtn.setAttribute('aria-expanded', 'true');
}
function hideModal() {
  modeModal.classList.add('hidden');
  openModalBtn.setAttribute('aria-expanded', 'false');
}
openModalBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);

jobModeBtn.addEventListener('click', () => {
  hideModal();
  jobForm.classList.remove('hidden');
});
karmaModeBtn.addEventListener('click', () => {
  hideModal();
  karmaForm.classList.remove('hidden');
});

jobBackBtn.addEventListener('click', () => {
  jobForm.reset();
  clearPreview('job');
  jobForm.classList.add('hidden');
  showModal();
});
karmaBackBtn.addEventListener('click', () => {
  karmaForm.reset();
  clearPreview('karma');
  karmaForm.classList.add('hidden');
  showModal();
});

function clearPreview(prefix) {
  const img = document.getElementById(`${prefix}-preview`);
  if (img) {
    img.src = '';
    img.classList.add('hidden');
  }
}

function setupImagePreview(inputId, imgId) {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const error = input.nextElementSibling; // the <p> after input
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      error.textContent = 'Nur JPEG oder PNG erlaubt';
      error.classList.remove('hidden');
      input.value = '';
      img.classList.add('hidden');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error.textContent = 'Datei darf maximal 5 MB sein';
      error.classList.remove('hidden');
      input.value = '';
      img.classList.add('hidden');
      return;
    }
    error.textContent = '';
    error.classList.add('hidden');
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      img.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

setupImagePreview('job-photo', 'job-preview');
setupImagePreview('karma-photo', 'karma-preview');

function validateForm(form) {
  let valid = true;
  const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
  fields.forEach(field => {
    const error = field.nextElementSibling;
    if (!field.checkValidity()) {
      error.textContent = field.validationMessage;
      error.classList.remove('hidden');
      valid = false;
    } else {
      error.textContent = '';
      error.classList.add('hidden');
    }
  });
  const fileInput = form.querySelector('input[type="file"]');
  const fileError = fileInput.nextElementSibling;
  if (fileInput.files.length === 0) {
    fileError.textContent = 'Bitte laden Sie ein Bild hoch';
    fileError.classList.remove('hidden');
    valid = false;
  }
  return valid;
}

jobForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm(jobForm)) return;
  const data = {
    mode: 'job',
    title: document.getElementById('job-title').value,
    description: document.getElementById('job-description').value,
    amount: Number(document.getElementById('job-amount').value),
    timer: Number(document.getElementById('job-timer').value),
    category: document.getElementById('job-category').value,
  };
  console.log(data);
  jobForm.reset();
  clearPreview('job');
  jobForm.classList.add('hidden');
  showModal();
});

karmaForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm(karmaForm)) return;
  const data = {
    mode: 'karma',
    title: document.getElementById('karma-title').value,
    description: document.getElementById('karma-description').value,
    amount: Number(document.getElementById('karma-amount').value),
    timer: Number(document.getElementById('karma-timer').value),
    karmaPoints: Number(document.getElementById('karma-points').value),
  };
  console.log(data);
  karmaForm.reset();
  clearPreview('karma');
  karmaForm.classList.add('hidden');
  showModal();
});

// Keyboard accessibility: close modal with Escape
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modeModal.classList.contains('hidden')) hideModal();
    if (!jobForm.classList.contains('hidden')) jobBackBtn.click();
    if (!karmaForm.classList.contains('hidden')) karmaBackBtn.click();
  }
});
