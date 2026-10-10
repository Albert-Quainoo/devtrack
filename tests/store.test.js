const { test } = require('node:test');
const assert = require('node:assert/strict');
const s = require('../assets/store.js');
const input = { name: ' Portfolio ', description: 'Build a website', status: 'Active', due: '' };
test('project create, update, and case-insensitive combined filtering', () => {
 const d=s.empty(); s.project(d,input,'p1'); assert.equal(d.projects[0].name,'Portfolio');
 s.project(d,{...input,id:'p1',name:'New name',status:'Completed'},'unused');
 assert.equal(d.projects.length,1); assert.equal(s.filteredProjects(d,'WEBSITE','Completed').length,1); assert.equal(s.filteredProjects(d,'website','Active').length,0);
});
test('reject invalid project inputs and missing update targets',()=>{
 for(const value of [{...input,name:'   '},{...input,name:'x'.repeat(81)},{...input,status:'Wrong'},{...input,due:'not-a-date'},{...input,id:'missing'}]) assert.throws(()=>s.project(s.empty(),value,'p'));
});
test('tasks validate project, title and priority; progress follows completion',()=>{
 const d=s.empty();s.project(d,input,'p');
 assert.deepEqual(s.progress(d,'p'),{done:0,total:0,percent:0});
 assert.throws(()=>s.task(d,{title:'Task',projectId:'missing',priority:'High'},'t'));
 assert.throws(()=>s.task(d,{title:' ',projectId:'p',priority:'High'},'t'));
 assert.throws(()=>s.task(d,{title:'Task',projectId:'p',priority:'Wrong'},'t'));
 s.task(d,{title:'Task',projectId:'p',priority:'High'},'t');d.tasks[0].done=true;
 assert.deepEqual(s.progress(d,'p'),{done:1,total:1,percent:100});
});
test('deleting a project cascades only its tasks',()=>{
 const d=s.empty();s.project(d,input,'p');s.project(d,input,'q');
 s.task(d,{title:'A',projectId:'p',priority:'Low'},'a');s.task(d,{title:'B',projectId:'q',priority:'Low'},'b');
 s.removeProject(d,'p');assert.deepEqual(d.projects.map(p=>p.id),['q']);assert.deepEqual(d.tasks.map(t=>t.id),['b']);
});
test('storage roundtrip and invalid saved data',()=>{
 const memory={};const storage={getItem:k=>memory[k]??null,setItem:(k,v)=>memory[k]=v};
 assert.deepEqual(s.load(storage),s.empty());const d=s.empty();s.project(d,input,'p');s.save(storage,d);assert.deepEqual(s.load(storage),d);
 memory[s.KEY]='bad JSON';assert.throws(()=>s.load(storage));memory[s.KEY]='{"projects":[null],"tasks":[]}';assert.throws(()=>s.load(storage));
});
