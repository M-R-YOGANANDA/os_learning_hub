const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const COL=['#0f8b8d','#e8a33d','#d1495b','#5a67d8','#3f9b5b','#a15cc2','#d9782d','#2b7a9e'];
const chip=i=>`<span class=chip style="background:${COL[i%8]}">P${i+1}</span>`;
const page=(t,i,b)=>`<h1>${t}</h1><p class=lead>${i}</p>${b}`;
let TM;
const NAV=[['OS Fundamentals',[['what','What is an OS?'],['services','OS services'],['syscall','System calls'],['mode','Kernel vs user mode'],['struct','OS structures'],['boot','Boot process']]],
['Process Management',[['states','Process states'],['pcb','PCB'],['ctx','Context switching'],['create','Process creation'],['threads','Threads'],['ipc','IPC']]],
['CPU Scheduling',[['fcfs','FCFS'],['sjf','SJF'],['srtf','SRTF'],['prio','Priority'],['rr','Round Robin'],['mlq','Multilevel Queue'],['mlfq','Multilevel Feedback Queue']]]];
const NAMES={};NAV.forEach(g=>g[1].forEach(x=>NAMES[x[0]]=x[1]));

/* ---------- reusable widgets ---------- */
function layers(el,items){ // 3D stack: drag to rotate, click a plate
 el.innerHTML=`<div class=scene><div class=stage>${items.map((x,i)=>`<div class=plate data-i=${i} style="background:${x[2]};transform:translateZ(${i*56}px)">${x[0]}</div>`).join('')}</div></div><div class=card id=info>Click a layer to read about it. Drag the scene to rotate it in 3D.</div>`;
 const st=$('.stage',el),sc=$('.scene',el);let rz=-30,d=0,x0=0;
 const rot=()=>st.style.transform=`translateY(60px) rotateX(58deg) rotateZ(${rz}deg)`;rot();
 sc.onpointerdown=e=>{d=1;x0=e.clientX};sc.onpointerup=()=>d=0;sc.onpointerleave=()=>d=0;
 sc.onpointermove=e=>{if(d){rz+=(e.clientX-x0)*.6;x0=e.clientX;rot()}};
 $$('.plate',el).forEach(p=>p.onclick=()=>{const i=+p.dataset.i;$$('.plate',el).forEach(q=>q.classList.toggle('on',q==p));$('#info',el).innerHTML=`<b>${items[i][0]}</b> — ${items[i][1]}`});
}
function stepper(el,steps){
 let i=0;
 el.innerHTML=`<div class=grid2><div>${steps.map((s,k)=>`<div class=st data-k=${k}>${s[0]}</div>`).join('')}</div><div class=card id=sd></div></div><p><button id=pv>◀ Back</button> <button id=nx>Next ▶</button> <button id=au>Auto play</button></p>`;
 const show=()=>{$$('.st',el).forEach((d,k)=>d.className='st'+(k==i?' on':k<i?' done':''));$('#sd',el).innerHTML=`<h3>${steps[i][0]}</h3>${steps[i][1]}`};
 $('#pv',el).onclick=()=>{i=Math.max(0,i-1);show()};$('#nx',el).onclick=()=>{i=Math.min(steps.length-1,i+1);show()};
 $$('.st',el).forEach(d=>d.onclick=()=>{i=+d.dataset.k;show()});
 $('#au',el).onclick=()=>{clearInterval(TM);i=0;show();TM=setInterval(()=>{if(i<steps.length-1){i++;show()}else clearInterval(TM)},1500)};
 show();
}
function cards(el,items){
 el.innerHTML=`<div class=cards>${items.map((x,i)=>`<div class=card data-i=${i}><b>${x[0]}</b><div></div></div>`).join('')}</div>`;
 $$('.card',el).forEach(c=>c.onclick=()=>{const o=c.classList.toggle('on');$('div',c).textContent=o?items[c.dataset.i][1]:''});
}

/* ---------- 1. fundamentals ---------- */
const PG={};
PG.what=el=>{el.innerHTML=page('What is an operating system?','The OS sits between you and the hardware: it shares the machine fairly and hides its complexity.','<div id=w></div>');
 layers($('#w'),[['Hardware','CPU, RAM, disk, network card — raw resources.','#5b6b72'],['Kernel','Schedules the CPU, manages memory, files and devices. Runs in privileged mode.','#0f8b8d'],['Libraries & shell','libc and tools that turn your requests into system calls.','#5a67d8'],['Applications','Browser, editor, game — they ask the OS for services.','#e8a33d'],['You','The OS makes one machine feel like many private ones.','#d1495b']])};
PG.services=el=>{el.innerHTML=page('OS services','Click any card to open it.','<div id=w></div>');
 cards($('#w'),[['Program execution','Loads a program into memory, runs it, ends it (normally or on error).'],['I/O operations','Programs never touch devices directly; the OS drives keyboards, disks, screens.'],['File-system manipulation','Create, read, write, delete files and directories; enforce permissions.'],['Communication','Processes exchange data through shared memory or message passing (see IPC).'],['Error detection','Catches CPU, memory and device faults so one failure does not crash everything.'],['Resource allocation','Divides CPU time, memory and devices among competing processes.'],['Accounting','Tracks who uses how much CPU, memory and disk.'],['Protection & security','Keeps processes out of each other\'s memory and files; controls user access.']])};
PG.syscall=el=>{el.innerHTML=page('System calls','Pick a call and step through what happens between your program and the kernel.',`<p>System call: <select id=c><option>open</option><option>read</option><option>write</option><option>fork</option></select></p><div id=sp></div>`);
 const K={open:'Find the file, check permissions, allocate a file descriptor (e.g. fd = 3).',read:'Locate the data (cache or disk), copy it into the user buffer.',write:'Copy user data into the kernel buffer, schedule the disk write.',fork:'Duplicate the PCB and address space (copy-on-write), return child PID to parent and 0 to child.'};
 const go=()=>{const c=$('#c',el).value;stepper($('#sp',el),[['1. App calls '+c+'()','Your code calls a library wrapper such as <code>'+c+'()</code> in libc. Mode: <b>user</b>.'],['2. Trap instruction','The wrapper puts the call number in a register and executes <code>syscall</code>/<code>int 0x80</code>.'],['3. Mode switch → kernel','The CPU sets the mode bit to <b>kernel</b> and jumps to the system-call handler.'],['4. Kernel does the work',K[c]],['5. Return to user mode','Result placed in a register, mode bit set back to <b>user</b>, execution resumes after the call.']])};
 $('#c',el).onchange=go;go()};
PG.mode=el=>{el.innerHTML=page('Kernel vs user mode','The CPU mode bit decides what code may do. Try each action as a user program.',`<div class=row><div class="ring" id=rg><div id=rt>USER MODE</div></div><div><p><button data-a=0>Add two numbers</button> <button data-a=1>Read a file (system call)</button><br><br><button data-a=2>Disable interrupts directly</button> <button data-a=3>Write to kernel memory</button></p></div></div><div class="card log" id=lg>Log:</div>`);
 const L=s=>{$('#lg',el).innerHTML+='<br>'+s},M=k=>{$('#rg',el).className='ring'+(k?' k':'');$('#rt',el).textContent=k?'KERNEL MODE':'USER MODE'};
 const A=[()=>L('<span class=ok>OK</span> ADD runs in user mode — normal instruction.'),()=>{M(1);L('TRAP → mode bit = 0 (kernel). Kernel reads the file…');setTimeout(()=>{M(0);L('<span class=ok>OK</span> Returned to user mode with the data.')},1500)},()=>{M(1);L('<span class=bad>FAULT</span> CLI is privileged — CPU traps into the kernel.');setTimeout(()=>{M(0);L('Kernel terminates the process (protection works).')},1500)},()=>{M(1);L('<span class=bad>FAULT</span> Address belongs to the kernel — memory protection violation.');setTimeout(()=>{M(0);L('Process killed: segmentation fault.')},1500)}];
 $$('[data-a]',el).forEach(b=>b.onclick=()=>A[b.dataset.a]())};
PG.struct=el=>{el.innerHTML=page('OS structures','Same hardware, different designs. Switch structure and rotate the stack.',`<p><button data-s=0>Monolithic</button> <button data-s=1>Layered</button> <button data-s=2>Microkernel</button></p><div id=w></div>`);
 const S=[[['Hardware','','#5b6b72'],['Monolithic kernel','Scheduler, file system, drivers, memory manager all in one big kernel address space. Fast, but one bug can crash everything (Linux).','#0f8b8d'],['Applications','User programs.','#e8a33d']],
 [['L0 Hardware','','#5b6b72'],['L1 CPU scheduling','Each layer uses only the layer below it.','#0f8b8d'],['L2 Memory management','Easier to debug layer by layer, but each call crosses layers (slower).','#5a67d8'],['L3 I/O devices','','#a15cc2'],['L4 User programs','','#e8a33d']],
 [['Hardware','','#5b6b72'],['Microkernel','Only scheduling, basic memory and IPC live here — tiny and safe.','#0f8b8d'],['User-space servers','File system, drivers and network run as normal processes. Reliable, but more message passing (Minix, QNX).','#5a67d8'],['Applications','','#e8a33d']]];
 const g=k=>layers($('#w',el),S[k]);$$('[data-s]',el).forEach(b=>b.onclick=()=>g(b.dataset.s));g(0)};
PG.boot=el=>{el.innerHTML=page('Boot process','From power button to login prompt.','<div id=w></div>');
 stepper($('#w'),[['Power on','The CPU resets and jumps to a fixed firmware address.'],['BIOS / UEFI + POST','Firmware tests RAM, CPU and devices (Power-On Self Test).'],['Find boot device','Firmware reads the boot order and loads the first sector (MBR) or EFI partition.'],['Bootloader (GRUB)','Lets you pick an OS, loads the kernel image into memory.'],['Kernel starts','Kernel sets up memory, drivers, interrupts and mounts the root file system.'],['First process (init / systemd, PID 1)','Starts services and every other process — the root of the process tree.'],['Login prompt / desktop','User space is ready. You can now run programs.']])};

/* ---------- 2. process management ---------- */
PG.states=el=>{el.innerHTML=page('Process states','Move one process through its life. Only legal transitions are offered.',`<div class=nodes id=nd></div><p id=bt class=row></p><div class="card log" id=lg>Log:</div>`);
 const TR={New:[['Ready','admit']],Ready:[['Running','dispatch (scheduler picks it)']],Running:[['Ready','timer interrupt'],['Waiting','I/O or event wait'],['Terminated','exit']],Waiting:[['Ready','I/O complete']],Terminated:[]};
 let s='New';const draw=()=>{$('#nd',el).innerHTML=Object.keys(TR).map(n=>`<div class="node${n==s?' on':''}">${n}</div>`).join('');
  $('#bt',el).innerHTML=TR[s].map((t,i)=>`<button data-i=${i}>${s} → ${t[0]}: ${t[1]}</button>`).join('')||'<button data-r=1>Create new process</button>';
  $$('button',$('#bt',el)).forEach(b=>b.onclick=()=>{if(b.dataset.r){s='New';$('#lg',el).innerHTML='Log:'}else{const t=TR[s][b.dataset.i];$('#lg',el).innerHTML+=`<br>${s} → ${t[0]} (${t[1]})`;s=t[0]}draw()})};draw()};
PG.pcb=el=>{el.innerHTML=page('Process Control Block (PCB)','The kernel\'s record of a process. Run instructions and watch the PCB change; click a row to learn the field.',`<div class=grid2><div class=card><table id=tb></table><p><button id=ex>Execute instruction</button> <button id=st>Change state</button></p></div><div class=card id=ds>Click a field.</div></div>`);
 const p={pid:42,state:'Running',pc:1024,reg:0,pr:3,mem:'0x4000–0x8000',files:'stdin, stdout, log.txt',cpu:0},S=['Ready','Running','Waiting'];
 const F=[['Process ID','pid','Unique number identifying the process.'],['State','state','New, Ready, Running, Waiting or Terminated.'],['Program counter','pc','Address of the next instruction — saved on a context switch.'],['Registers (AX)','reg','CPU register contents, saved/restored on a context switch.'],['Priority','pr','Used by the scheduler.'],['Memory info','mem','Base/limit or page-table pointers for the address space.'],['Open files','files','I/O status: open file descriptors and devices.'],['CPU time used','cpu','Accounting information.']];
 const d=()=>$('#tb',el).innerHTML=F.map((f,i)=>`<tr data-i=${i} style=cursor:pointer><td><b>${f[0]}</b><td>${p[f[1]]}`).join('');
 d();el.onclick=e=>{const r=e.target.closest('tr');if(r)$('#ds',el).textContent=F[r.dataset.i][2]};
 $('#ex',el).onclick=()=>{p.pc+=4;p.reg++;p.cpu++;d()};$('#st',el).onclick=()=>{p.state=S[(S.indexOf(p.state)+1)%3];d()}};
PG.ctx=el=>{el.innerHTML=page('Context switching','The CPU saves one process\'s state into its PCB and loads another\'s. Switching is pure overhead — no user work happens.',`<div class=grid2><div class=card id=cA></div><div class=card id=cB></div></div><div class=card><b>CPU registers:</b> <span id=cpu></span></div><p class=row>Switch cost (ticks) <input id=cc type=number min=0 max=6 value=2> <button id=ex>Execute tick</button> <button id=sw>Context switch</button></p><div class=card><div class=bar id=br></div><p id=ut></p></div><div class="card log" id=lg>Log:</div>`);
 const P={A:{pc:100,ax:0,st:'Running'},B:{pc:500,ax:7,st:'Ready'}};let run='A',cpu={pc:100,ax:0},work=0,over=0,busy=0;
 const L=s=>{$('#lg',el).innerHTML+='<br>'+s;$('#lg',el).scrollTop=1e5};
 const d=()=>{['A','B'].forEach(k=>$('#c'+k,el).innerHTML=`<b>PCB of ${k}</b> — ${P[k].st}<br>PC = ${P[k].pc}, AX = ${P[k].ax}`);$('#cpu',el).textContent=`running ${run}: PC=${cpu.pc} AX=${cpu.ax}`;
  const tot=work+over||1;$('#br',el).innerHTML=`<i style="width:${over/tot*100}%"></i>`;$('#ut',el).textContent=`Useful ticks: ${work}, overhead ticks: ${over} (${(work/tot*100).toFixed(0)}% useful)`};
 $('#ex',el).onclick=()=>{if(!busy){cpu.pc+=4;cpu.ax++;work++;d()}};
 $('#sw',el).onclick=()=>{if(busy)return;busy=1;const n=run=='A'?'B':'A',S=[()=>{P[run].pc=cpu.pc;P[run].ax=cpu.ax;L(`1. Save CPU registers into PCB of ${run}`)},()=>{P[run].st='Ready';L(`2. ${run} → Ready`)},()=>L(`3. Scheduler picks ${n}`),()=>{cpu={pc:P[n].pc,ax:P[n].ax};P[n].st='Running';run=n;over+=+$('#cc',el).value;L(`4. Load PCB of ${n} into the CPU, ${n} → Running`);busy=0}];
  S.forEach((f,i)=>setTimeout(()=>{f();d()},i*700))};d()};
PG.create=el=>{el.innerHTML=page('Process creation','Select a process, then fork(), exec(), exit() or wait(). Orphans are adopted by init.',`<p class=row><button data-a=fork>fork()</button><button data-a=exec>exec()</button><button data-a=exit>exit()</button><button data-a=wait>wait()</button><button data-a=reset>Reset</button></p><div class=card><div class=tree id=tr></div></div><div class="card" id=ex>fork() makes a child that is a copy of the parent. exec() replaces its program. A finished child stays a <b>zombie</b> until the parent calls wait().</div>`);
 let N,id,sel;const rs=()=>{N=[{id:1,p:0,n:'init',z:0}];id=2;sel=1};rs();const NM=['bash','ls','python','nginx','gcc'];
 const ul=p=>{const k=N.filter(x=>x.p==p);return k.length?'<ul>'+k.map(x=>`<li><span data-i=${x.id} class="${x.id==sel?'on':''}">PID ${x.id}: ${x.n}${x.z?' (zombie)':''}</span>${ul(x.id)}`).join('')+'</ul>':''};
 const d=()=>{$('#tr',el).innerHTML=`<span data-i=1 class="${sel==1?'on':''}">PID 1: init</span>${ul(1)}`.replace(/<span data-i=1 class="[^"]*">PID 1: init<\/span>/,m=>m);};
 el.onclick=e=>{const s=e.target.closest('span[data-i]');if(s){sel=+s.dataset.i;d();return}const a=e.target.dataset.a;if(!a)return;const x=N.find(n=>n.id==sel);
  if(a=='reset')rs();if(a=='fork'&&!x.z)N.push({id:id++,p:sel,n:x.n,z:0});if(a=='exec'&&!x.z&&sel!=1)x.n=NM[(NM.indexOf(x.n)+1)%5];
  if(a=='exit'&&sel!=1&&!x.z){x.z=1;N.forEach(n=>{if(n.p==sel)n.p=1})}if(a=='wait')N=N.filter(n=>!(n.p==sel&&n.z));d()};d()};
PG.threads=el=>{el.innerHTML=page('Threads','Threads share code, data and heap but each has its own stack and registers. Shared data means race conditions — run the experiment.',`<p class=row>Threads <input id=n type=number min=1 max=6 value=3> <label><input type=checkbox id=lk> Use a mutex lock</label> <button id=go>Run: each thread does counter++ ten times</button></p><div class=card id=mm></div><div class=card id=rs>Press Run. Expected total = threads × 10.</div>`);
 const mem=()=>{const n=+$('#n',el).value;$('#mm',el).innerHTML=`<b>Shared:</b> code · global data · heap · open files<br><br>`+[...Array(n)].map((_,i)=>`${chip(i)} own stack + registers + PC &nbsp;`).join('')};
 const race=(n,lock)=>{let c=0,h=-1;const ps=[...Array(n)].map(()=>({k:10,s:0,r:0}));while(ps.some(p=>p.k>0)){const l=ps.filter(p=>p.k>0),p=l[Math.random()*l.length|0],i=ps.indexOf(p);
  if(p.s==0){if(lock&&h>=0&&h!=i)continue;h=i;p.r=c;p.s=1}else if(p.s==1){p.r++;p.s=2}else{c=p.r;p.s=0;p.k--;if(lock)h=-1}}return c};
 $('#n',el).oninput=mem;mem();
 $('#go',el).onclick=()=>{const n=+$('#n',el).value,c=race(n,$('#lk',el).checked),e=n*10;$('#rs',el).innerHTML=`Expected <b>${e}</b>, got <b>${c}</b> — ${c==e?'<span class=ok>correct</span>':`<span class=bad>${e-c} updates lost (race condition)</span>`}. Run again: without the lock the result changes.`}};
PG.ipc=el=>{el.innerHTML=page('Inter-process communication','Process A and process B cannot see each other\'s memory, so they need a channel.',`<p class=row><select id=m><option value=msg>Message passing (kernel mailbox)</option><option value=shm>Shared memory</option><option value=pipe>Pipe (FIFO, capacity 3)</option></select> <input id=t value=hello> <button id=a>A writes</button> <button id=b>B reads</button></p><div class=card><div class=row><span class=chip style="background:#0f8b8d">Process A</span><b>→</b><span id=ch style="flex:1;min-height:34px;background:#eef2f1;border-radius:6px;padding:4px"></span><b>→</b><span class=chip style="background:#d1495b">Process B</span></div><p id=nt style="color:#5b6b72"></p></div><div class="card log" id=lg>Log:</div>`);
 let q=[];const NT={msg:'The kernel copies each message into B\'s mailbox. Safe and simple, but every transfer costs a system call.',shm:'Both processes map the same memory. Fastest, no kernel copy — but you must add synchronization yourself.',pipe:'First-in first-out byte stream. Writer blocks when the pipe is full, reader blocks when it is empty.'};
 const L=s=>{$('#lg',el).innerHTML+='<br>'+s;$('#lg',el).scrollTop=1e5},d=()=>{$('#ch',el).innerHTML=q.map(x=>`<span class=chip style="background:#e8a33d">${x}</span>`).join('')||'(empty)';$('#nt',el).textContent=NT[$('#m',el).value]};
 $('#m',el).onchange=()=>{q=[];d()};
 $('#a',el).onclick=()=>{const m=$('#m',el).value,v=$('#t',el).value;if(m=='shm'){q=[v];L(`A writes "${v}" directly into shared memory`)}else if(m=='pipe'&&q.length>=3)L('<span class=bad>A blocks: pipe full</span>');else{q.push(v);L(`A sends "${v}" ${m=='msg'?'via kernel':'into pipe'}`)}d()};
 $('#b',el).onclick=()=>{const m=$('#m',el).value;if(m=='shm')L(q.length?`B reads "${q[0]}" (still there — reading does not consume)`:'B reads nothing yet');else if(!q.length)L('<span class=bad>B blocks: nothing to read</span>');else L(`B receives "${q.shift()}"`);d()};d()};

/* ---------- 3. CPU scheduling ---------- */
function sim(P,algo,Q){
 const n=P.length,rem=P.map(p=>p.bt),tl=[],ct={},fin=[],lvl=P.map(()=>0),qs=[[],[],[]],isQ=['rr','mlq','mlfq'].includes(algo);
 let t=0,cur=-1,used=0,back=-1;
 const L0=i=>algo=='mlq'&&P[i].pr>2?1:0,qt=l=>algo=='mlfq'?Q*2**l:Q,rr=l=>algo!='mlq'||l==0;
 const key={fcfs:i=>P[i].at,sjf:i=>P[i].bt,srtf:i=>rem[i],prio:i=>P[i].pr,'prio-p':i=>P[i].pr}[algo],pre=algo=='srtf'||algo=='prio-p';
 while(fin.length<n&&t<400){
  if(isQ){P.forEach((p,i)=>{if(p.at==t){lvl[i]=L0(i);qs[lvl[i]].push(i)}});
   if(back>=0){qs[lvl[back]].push(back);back=-1}
   const top=qs.findIndex(q=>q.length);
   if(cur>=0&&top>=0&&top<lvl[cur]){qs[lvl[cur]].unshift(cur);cur=-1}
   if(cur<0&&top>=0){cur=qs[top].shift();used=0}
  }else{
   const rd=[...P.keys()].filter(i=>P[i].at<=t&&rem[i]>0);
   if(cur>=0&&rem[cur]<=0)cur=-1;
   if((cur<0||pre)&&rd.length)cur=rd.reduce((a,b)=>key(b)<key(a)?b:a,rd.includes(cur)?cur:rd[0]);
  }
  if(cur<0){tl.push(-1);t++;continue}
  tl.push(cur);rem[cur]--;used++;t++;
  if(rem[cur]==0){ct[cur]=t;fin.push(cur);cur=-1}
  else if(isQ&&rr(lvl[cur])&&used>=qt(lvl[cur])){if(algo=='mlfq')lvl[cur]=Math.min(lvl[cur]+1,2);back=cur;cur=-1}
 }
 return{tl,ct};
}
let PR=[{at:0,bt:5,pr:2},{at:1,bt:3,pr:1},{at:2,bt:8,pr:4},{at:3,bt:2,pr:3}],Q=2,PRE=false;
const NOTE={fcfs:'First Come First Served: run in arrival order, non-preemptive. Try making P1 very long to see the convoy effect.',sjf:'Shortest Job First (non-preemptive): among arrived jobs, run the one with the shortest burst. Best average waiting time, but long jobs can starve.',srtf:'Shortest Remaining Time First: preemptive SJF — a newly arrived shorter job takes the CPU immediately.',prio:'Priority: lower number = higher priority. Tick Preemptive to let a new high-priority job interrupt. Low priority can starve.',rr:'Round Robin: each process gets a time quantum, then goes to the back of the queue. Compare Q = 1 with Q = 9.',mlq:'Multilevel Queue: priority 1–2 go to Queue 1 (Round Robin, quantum Q); priority 3+ go to Queue 2 (FCFS). Queue 1 always wins.',mlfq:'Multilevel Feedback Queue: 3 levels with quanta Q, 2Q, 4Q. New jobs start at the top; using a full quantum demotes the job.'};
const stats=a=>{const r=sim(PR,a,Q);return{r,rows:PR.map((p,i)=>{const s=r.tl.indexOf(i),c=r.ct[i],ta=c-p.at;return{s,c,ta,w:ta-p.bt,rt:s-p.at}})}};
const avg=(rows,k)=>(rows.reduce((a,x)=>a+x[k],0)/(rows.length||1)).toFixed(2);
function sched(el,id){
 let r,t;const A=()=>id=='prio'&&PRE?'prio-p':id;
 el.innerHTML=page(NAMES[id],NOTE[id],`<div class=card><div class=row id=ctl></div><table id=pt></table><p><button id=add>+ Add process</button> <button id=rnd>Randomize</button></p></div><div class=card><div class=row><button id=pl>▶ Play</button><input type=range id=sl min=0 style="flex:1"><b id=tt></b></div><p id=now></p><div class=gantt id=gt></div></div><div class=card id=res></div><div class=card id=cmp></div>`);
 $('#ctl',el).innerHTML=(['rr','mlq','mlfq'].includes(id)?`Time quantum Q <input id=q type=number min=1 max=9 value=${Q}>`:'')+(id=='prio'?`<label><input type=checkbox id=pre ${PRE?'checked':''}> Preemptive</label>`:'')||'<span style="color:#5b6b72">Edit any number below — the chart updates instantly.</span>';
 const tbl=()=>$('#pt',el).innerHTML='<tr><th>Process<th>Arrival<th>Burst<th>Priority<th></tr>'+PR.map((p,i)=>`<tr><td>${chip(i)}${['at','bt','pr'].map(f=>`<td><input type=number min=${f=='bt'?1:0} max=30 data-i=${i} data-f=${f} value=${p[f]}>`).join('')}<td><button data-x=${i}>×</button>`).join('');
 const draw=()=>{$('#sl',el).value=t;$('#tt',el).textContent='t = '+t;
  $('#gt',el).innerHTML=r.tl.slice(0,t).map((p,k)=>`<i style="background:${p<0?'#b9c7cb':COL[p%8]}">${p<0?'idle':'P'+(p+1)}<s>${k}</s></i>`).join('');
  const u=r.tl[t],rd=PR.map((_,i)=>i).filter(i=>PR[i].at<=t&&r.ct[i]>t&&i!=u);
  $('#now',el).innerHTML=`CPU: ${u==null?'<b>all done</b>':u<0?'idle':chip(u)} &nbsp; Ready queue: ${rd.map(chip).join('')||'—'}`};
 const run=()=>{const s=stats(A());r=s.r;t=r.tl.length;$('#sl',el).max=t;
  $('#res',el).innerHTML='<table><tr><th>Process<th>Finish<th>Turnaround (finish − arrival)<th>Waiting (turnaround − burst)<th>Response (first run − arrival)</tr>'+s.rows.map((x,i)=>`<tr><td>${chip(i)}<td>${x.c}<td>${x.ta}<td>${x.w}<td>${x.rt}`).join('')+`<tr><th>Average<th><th>${avg(s.rows,'ta')}<th>${avg(s.rows,'w')}<th>${avg(s.rows,'rt')}</tr></table>`;
  $('#cmp',el).innerHTML='<b>Same processes, every algorithm</b> (average waiting / turnaround)<table>'+['fcfs','sjf','srtf','prio','rr','mlq','mlfq'].map(a=>{const x=stats(a).rows;return`<tr${a==id?' style="background:#fff4de"':''}><td>${NAMES[a]}<td>${avg(x,'w')}<td>${avg(x,'ta')}`}).join('')+'</table>';draw()};
 el.onchange=e=>{const d=e.target.dataset,i=e.target.id;if(d.f)PR[d.i][d.f]=Math.max(+e.target.min,+e.target.value||0);if(i=='q')Q=Math.max(1,+e.target.value||1);if(i=='pre')PRE=e.target.checked;run()};
 el.onclick=e=>{const b=e.target;if(b.dataset.x!=null){PR.splice(b.dataset.x,1);tbl();run()}};
 $('#add',el).onclick=()=>{if(PR.length<8){PR.push({at:PR.length,bt:3,pr:3});tbl();run()}};
 $('#rnd',el).onclick=()=>{PR=[...Array(5)].map(()=>({at:Math.random()*7|0,bt:1+Math.random()*8|0,pr:1+Math.random()*5|0}));tbl();run()};
 $('#sl',el).oninput=e=>{t=+e.target.value;draw()};
 $('#pl',el).onclick=()=>{clearInterval(TM);t=0;draw();TM=setInterval(()=>{if(t<r.tl.length){t++;draw()}else clearInterval(TM)},450)};
 tbl();run();
}
['fcfs','sjf','srtf','prio','rr','mlq','mlfq'].forEach(k=>PG[k]=el=>sched(el,k));

EXTRA();
/* ---------- shell ---------- */
$('#nav').innerHTML='<h2>OS Learning Hub</h2>'+NAV.map(g=>`<h3>${g[0]}</h3>`+g[1].map(x=>`<a href="#${x[0]}" data-id=${x[0]}>${x[1]}</a>`).join('')).join('');
const route=()=>{clearInterval(TM);const id=PG[location.hash.slice(1)]?location.hash.slice(1):'what';
 $$('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.id==id));$('#crumb').textContent=NAMES[id];
 const v=$('#view');v.onclick=v.onchange=null;PG[id](v);scrollTo(0,0);if(innerWidth<760)document.body.classList.add('hide')};
const tog=()=>document.body.classList.toggle('hide');
$('#tog').onclick=tog;addEventListener('keydown',e=>{if(e.key=='m'&&!/INPUT|SELECT/.test(e.target.tagName))tog()});
addEventListener('hashchange',route);route();
