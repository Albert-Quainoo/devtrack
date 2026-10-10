/* Data operations are independent of the DOM so they can be tested directly. */
(function (root) {
  const KEY = 'devtrack-v1';
  const statuses = ['Planned', 'Active', 'Completed'];
  const priorities = ['High', 'Medium', 'Low'];
  function empty() { return { projects: [], tasks: [] }; }
  function load(storage) {
    const raw = storage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.projects) || !Array.isArray(data.tasks) ||
        data.projects.some(p => !p || typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.description !== 'string' || typeof p.due !== 'string' || !statuses.includes(p.status)) ||
        data.tasks.some(t => !t || typeof t.id !== 'string' || typeof t.title !== 'string' || typeof t.done !== 'boolean' || !priorities.includes(t.priority) || !data.projects.some(p => p.id === t.projectId))) {
      throw new Error('Saved workspace is invalid.');
    }
    return data;
  }
  function save(storage, data) { storage.setItem(KEY, JSON.stringify(data)); }
  function project(data, input, id) {
    const name = input.name.trim();
    if (!name || name.length > 80) throw new Error('Enter a project name of 1–80 characters.');
    if (input.description.length > 400 || !statuses.includes(input.status)) throw new Error('Check the project details.');
    if (input.due && (!/^\d{4}-\d{2}-\d{2}$/.test(input.due) || Number.isNaN(Date.parse(input.due)))) throw new Error('Choose a valid due date.');
    const value = { id: input.id || id, name, description: input.description.trim(), status: input.status, due: input.due };
    const index = data.projects.findIndex(p => p.id === input.id);
    if (input.id && index < 0) throw new Error('Project no longer exists.');
    if (index < 0) data.projects.push(value); else data.projects[index] = value;
    return value;
  }
  function removeProject(data, id) {
    data.projects = data.projects.filter(p => p.id !== id);
    data.tasks = data.tasks.filter(t => t.projectId !== id);
  }
  function task(data, input, id) {
    const title = input.title.trim();
    if (!title || title.length > 120) throw new Error('Enter a task name of 1–120 characters.');
    if (!data.projects.some(p => p.id === input.projectId)) throw new Error('Create or choose a project first.');
    if (!priorities.includes(input.priority)) throw new Error('Choose a valid priority.');
    data.tasks.push({ id, title, projectId: input.projectId, priority: input.priority, done: false });
  }
  function filteredProjects(data, query, status) {
    return data.projects.filter(p => (status === 'all' || p.status === status) && (p.name + ' ' + p.description).toLowerCase().includes(query.trim().toLowerCase()));
  }
  function progress(data, id) {
    const tasks = data.tasks.filter(t => t.projectId === id);
    const done = tasks.filter(t => t.done).length;
    return { total: tasks.length, done, percent: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
  }
  const api = { KEY, empty, load, save, project, removeProject, task, filteredProjects, progress };
  if (typeof module !== 'undefined') module.exports = api; else root.DevTrack = api;
})(typeof window !== 'undefined' ? window : globalThis);
