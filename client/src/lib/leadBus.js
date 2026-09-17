// Lets product cards pre-select a subject in the lead form and scroll to it.
export function openLeadForm(subjects = []) {
  window.dispatchEvent(new CustomEvent('focas:lead', { detail: { subjects } }));
  document.getElementById('get-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
