const store = window.DevTrack;
const page = document.body.dataset.page;
let data;
let writable = true;
try { data = store.load(localStorage); }
catch (error) {
  data = store.empty();
  writable = false;
  document.getElementById('notice').textContent = 'Your saved workspace could not be read. Changes are disabled to protect it. Check browser storage settings or clear the DevTrack storage entry to start again.';
}
const $ = selector => document.querySelector(selector);
// User content is escaped before inserting HTML; it is never treated as markup.
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let noticeTimer;
function notify(message) {
  $('#notice').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('#notice').textContent = ''; }, 5000);
}
function change(update, message) {
  if (!writable) return false;
  const next = JSON.parse(JSON.stringify(data));
  try { update(next); store.save(localStorage, next); }
  catch (error) { notify('Could not save: ' + error.message); return false; }
  data = next;
  render();
  notify(message);
  return true;
}
function empty(title, description, link = '') {
  return `<div class="empty"><h3>${title}</h3><p>${description}</p>${link}</div>`;
}
function projectRow(project, editable) {
  const progress = store.progress(data, project.id);
  return `<article class="project-row"><div><h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.description || 'No description added.')}</p><span class="badge">${project.status}</span>${project.due ? `<span class="meta">Due ${escapeHTML(project.due)}</span>` : ''}</div><div><div class="progress-label">${progress.done} / ${progress.total} tasks · ${progress.percent}%</div><div class="progress-track" role="progressbar" aria-label="${escapeHTML(project.name)} task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}"><div class="progress-fill" style="width:${progress.percent}%"></div></div></div><div class="actions">${editable ? `<button class="text-button" data-edit="${escapeHTML(project.id)}" aria-label="Edit ${escapeHTML(project.name)}">Edit</button><button class="text-button danger" data-delete="${escapeHTML(project.id)}" aria-label="Delete ${escapeHTML(project.name)}">Delete</button>` : '<a href="tasks.html" class="text-button">View tasks →</a>'}</div></article>`;
}
function taskRow(task, interactive = true) {
  const project = data.projects.find(p => p.id === task.projectId);
  return `<article class="task-row ${task.done ? 'done' : ''}">${interactive ? `<input type="checkbox" id="task-${escapeHTML(task.id)}" data-toggle="${escapeHTML(task.id)}" ${task.done ? 'checked' : ''}>` : '<span aria-hidden="true">○</span>'}<div class="task-info">${interactive ? `<label for="task-${escapeHTML(task.id)}">${escapeHTML(task.title)}</label>` : `<span>${escapeHTML(task.title)}</span>`}<p>${escapeHTML(project.name)}</p></div><span class="priority">${task.priority} priority</span>${interactive ? `<button class="text-button danger" data-remove-task="${escapeHTML(task.id)}" aria-label="Delete task ${escapeHTML(task.title)}">Delete</button>` : ''}</article>`;
}
function render() {
  if (page === 'dashboard') {
    const completed = data.tasks.filter(t => t.done).length;
    const stats = [['Projects', data.projects.length], ['Active projects', data.projects.filter(p => p.status === 'Active').length], ['Open tasks', data.tasks.length - completed], ['Completed tasks', completed]];
    $('#stats').innerHTML = stats.map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('#dashboard-projects').innerHTML = data.projects.map(p => projectRow(p, false)).join('') || empty('Your next project belongs here', 'Create a project to start building your workspace.', '<a class="button" href="projects.html">Create a project</a>');
    const next = data.tasks.filter(t => !t.done).sort((a,b) => ['High','Medium','Low'].indexOf(a.priority) - ['High','Medium','Low'].indexOf(b.priority)).slice(0,5);
    $('#next-tasks').innerHTML = next.map(t => taskRow(t, false)).join('') || empty('Nothing waiting on you', 'Add tasks to a project, or enjoy having everything checked off.');
  }
  if (page === 'projects') {
    const projects = store.filteredProjects(data, $('#search').value, $('#status-filter').value);
    $('#result-count').textContent = `${projects.length} of ${data.projects.length} projects`;
    $('#project-list').innerHTML = projects.map(p => projectRow(p, true)).join('') || empty(data.projects.length ? 'No matching projects' : 'Start with an idea', data.projects.length ? 'Try another search or status filter.' : 'Use “New project” to give your next build a home.');
  }
  if (page === 'tasks') {
    const selectedProject = $('#task-project').value;
    const selectedFilter = $('#project-filter').value;
    const options = data.projects.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join('');
    $('#task-project').innerHTML = options || '<option value="">Create a project first</option>';
    if (data.projects.some(p => p.id === selectedProject)) $('#task-project').value = selectedProject;
    $('#project-filter').innerHTML = '<option value="all">All projects</option>' + options;
    $('#project-filter').value = data.projects.some(p => p.id === selectedFilter) ? selectedFilter : 'all';
    $('#task-form button').disabled = !data.projects.length || !writable;
    const status = $('#task-filter').value;
    const tasks = data.tasks.filter(t => ($('#project-filter').value === 'all' || t.projectId === $('#project-filter').value) && (status === 'all' || (status === 'done' ? t.done : !t.done)));
    $('#task-list').innerHTML = tasks.map(t => taskRow(t)).join('') || empty('No tasks in this view', data.projects.length ? 'Add a task above or change your filters.' : 'Create a project before adding tasks.', !data.projects.length ? '<a class="button" href="projects.html">Create a project</a>' : '');
  }
  if (!writable) document.querySelectorAll('button,input,select,textarea').forEach(element => { element.disabled = true; });
}
if (page === 'projects') {
  const dialog = $('#project-dialog');
  const form = $('#project-form');
  function openProject(project) {
    form.reset();
    $('#form-error').textContent = '';
    $('#form-title').textContent = project ? 'Edit project' : 'New project';
    if (project) Object.keys(project).forEach(key => { if (form.elements[key]) form.elements[key].value = project[key]; });
    dialog.showModal();
    form.elements.name.focus();
  }
  $('#new-project').addEventListener('click', () => openProject());
  $('#close-dialog').addEventListener('click', () => dialog.close());
  $('#search').addEventListener('input', render);
  $('#status-filter').addEventListener('change', render);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(form));
    try { store.project(JSON.parse(JSON.stringify(data)), input, crypto.randomUUID()); }
    catch (error) { $('#form-error').textContent = error.message; return; }
    if (change(next => store.project(next, input, crypto.randomUUID()), input.id ? 'Project updated.' : 'Project created.')) dialog.close();
  });
  $('#project-list').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) openProject(data.projects.find(p => p.id === edit.dataset.edit));
    if (remove) {
      const project = data.projects.find(p => p.id === remove.dataset.delete);
      if (confirm(`Delete “${project.name}” and all of its tasks? This cannot be undone.`)) change(next => store.removeProject(next, project.id), 'Project and associated tasks deleted.');
    }
  });
}
if (page === 'tasks') {
  $('#project-filter').addEventListener('change', render);
  $('#task-filter').addEventListener('change', render);
  $('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.target));
    try { store.task(JSON.parse(JSON.stringify(data)), input, crypto.randomUUID()); }
    catch (error) { $('#task-error').textContent = error.message; return; }
    if (change(next => store.task(next, input, crypto.randomUUID()), 'Task added.')) {
      event.target.elements.title.value = '';
      $('#task-error').textContent = '';
      event.target.elements.title.focus();
    }
  });
  $('#task-list').addEventListener('change', event => {
    if (event.target.matches('[data-toggle]')) {
      const id = event.target.dataset.toggle;
      change(next => { const task = next.tasks.find(t => t.id === id); task.done = !task.done; }, 'Task updated.');
      const checkbox = document.getElementById('task-' + id);
      if (checkbox) checkbox.focus();
    }
  });
  $('#task-list').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-task]');
    if (button && confirm('Delete this task? This cannot be undone.')) change(next => { next.tasks = next.tasks.filter(t => t.id !== button.dataset.removeTask); }, 'Task deleted.');
  });
}
// Keep open pages in the same browser in sync when another tab saves changes.
window.addEventListener('storage', event => {
  if (event.key === store.KEY || event.key === null) location.reload();
});
render();
