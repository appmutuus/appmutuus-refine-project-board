// Simple module that exposes a register function
// to avoid undefined errors
const jobModule = {
  register() {
    console.log('register called');
  }
};

// Make the module accessible globally, e.g., window.jobModule
window.jobModule = jobModule;

// Attach event handlers once the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('registerBtn');
  const form = document.getElementById('jobForm');

  if (form) {
    form.addEventListener('reset', () => {
      console.log('form reset');
    });
  }

  if (registerBtn && window.jobModule?.register) {
    registerBtn.addEventListener('click', () => {
      // Safely call the register function
      window.jobModule.register();
    });
  }
});
