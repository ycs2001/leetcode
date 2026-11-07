(() => {
  'use strict';
  const PROBLEMS = Array.isArray(window.LEETCODE_PROBLEMS) ? window.LEETCODE_PROBLEMS : [];
  const KEY = 'leetflow-interview-prep-v1';
  const WEEK_LABELS = ['Arrays & Hashing','Two Pointers & Sliding Window','Stack & Binary Search','Linked List & Binary Tree','Heap, Trie & Intervals','Graphs, BFS & DFS','Advanced Graphs & Backtracking','Dynamic Programming & Design'];
  const STATUS = {'Not Started':'未开始','In Progress':'进行中','Solved':'已掌握','Review':'需复习'};
  const RESULT_TEXT = {'Solved':'独立完成','In Progress':'练习中','Review':'需要复习'};
  const DIFFICULTY = {Easy:'简单',Medium:'中等',Hard:'困难'};
  const dateFmt = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'short'});
  const shortDateFmt = new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric'});
  const root = document.getElementById('content');
  const modalRoot = document.getElementById('modalRoot');
  const modalInner = document.getElementById('modalInner');
  const toastNode = document.getElementById('toast');
  const byId = new Map(PROBLEMS.map(p=>[Number(p.id),p]));
  let notifyTimer;
  let currentView = 'dashboard';
  let activeWeek = null;
  const filter = {search:'',week:'All',difficulty:'All',track:'Core',status:'All',tab:'All',page:1};
  let state = loadState();

  function pad(n) { return String(n).padStart(2,'0'); }
  function today() { const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function parseDay(v){ const parts=String(v).split('-').map(Number);return new Date(parts[0]||2000,(parts[1]||1)-1,parts[2]||1,12); }
  function daysBetween(a,b) { return Math.floor((parseDay(a)-parseDay(b))/86400000); }
  function shiftDay(v,num){const d=parseDay(v);d.setDate(d.getDate()+num);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
  function fmtDay(v){return shortDateFmt.format(parseDay(v));}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function attr(v){return esc(v);}
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
  function newId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`log_${Date.now()}_${Math.random().toString(36).slice(2)}`;}
  function safeStorageGet(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function safeStorageSet(x){try{localStorage.setItem(KEY,JSON.stringify(x));return true;}catch(e){return false;}}
  function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(parseDay(v).valueOf())&&v===shiftDay(v,0);}
  function sanitizeLog(s){
    if(!s||!byId.has(Number(s.problemId))||!validDate(s.date))return null;
    const status=['Solved','In Progress','Review'].includes(s.outcome)?s.outcome:'In Progress';
    return {id:String(s.id||newId()).slice(0,120),problemId:Number(s.problemId),date:s.date,minutes:clamp(Math.round(Number(s.minutes)||0),0,1440),outcome:status,confidence:clamp(Math.round(Number(s.confidence)||3),1,5),notes:String(s.notes||'').slice(0,10000),createdAt:Number(s.createdAt)||Date.now()};
  }
  function defaultState(){return {version:1,startDate:today(),sessions:[],starred:[]};}
  function loadState(){
    const def=defaultState();
    try{const raw=safeStorageGet();if(!raw)return def;const x=JSON.parse(raw);return {...def,startDate:validDate(x.startDate)?x.startDate:def.startDate,sessions:Array.isArray(x.sessions)?x.sessions.map(sanitizeLog).filter(Boolean).slice(0,30000):[],starred:Array.isArray(x.starred)?x.starred.map(Number).filter(id=>byId.has(id)):[]};}catch(err){return def;}
  }
  function saveState(){if(!safeStorageSet(state))toast('浏览器储存不可用；请使用「导出备份」保留记录');}
  function toast(message){clearTimeout(notifyTimer);toastNode.textContent=message;toastNode.classList.add('show');notifyTimer=setTimeout(()=>toastNode.classList.remove('show'),3300);}
  function counts(){const totals={total:PROBLEMS.length,core:0,stretch:0,review:0,solved:0,solvedCore:0,solvedStretch:0,doneToday:0,minutesToday:0,minutesTotal:0};for(const p of PROBLEMS){if(p.track==='Core')totals.core++;else if(p.track==='Stretch')totals.stretch++;else totals.review++;if(statusFor(p)==='Solved'){totals.solved++;if(p.track==='Core')totals.solvedCore++;if(p.track==='Stretch')totals.solvedStretch++;}}for(const s of state.sessions){totals.minutesTotal+=s.minutes;if(s.date===today()){totals.doneToday++;totals.minutesToday+=s.minutes;}}return totals;}
  function statusFor(p){const logs=state.sessions.filter(s=>s.problemId===p.id).sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt);let status=p.status==='Review'?'Review':'Not Started';for(const log of logs){if(log.outcome==='Solved')status='Solved';else if(log.outcome==='Review')status='Review';else if(status!=='Solved')status='In Progress';}return status;}
  function sessionsFor(id){return state.sessions.filter(s=>s.problemId===id);}
  function completedWeek(w){return PROBLEMS.filter(p=>p.week===`Week ${w}`&&statusFor(p)==='Solved').length;}
  function currentWeek(){return clamp(Math.floor(daysBetween(today(),state.startDate)/7)+1,1,8);}
  function streak(){const dates=new Set(state.sessions.map(s=>s.date));let d=today();if(!dates.has(d))d=shiftDay(d,-1);let n=0;while(dates.has(d)&&n<30000){n++;d=shiftDay(d,-1);}return n;}
  function lastPracticeDate(p){const xs=sessionsFor(p.id).sort((a,b)=>b.date.localeCompare(a.date));return xs[0]?.date||null;}
  function statusTag(p,clickable=false){const s=statusFor(p);const cls={'Solved':'status-solved','In Progress':'status-progress','Review':'status-review','Not Started':'status-new'}[s];return clickable?`<button type="button" class="tag table-status ${cls}" data-action="log" data-id="${p.id}" title="记录或更新练习状态">${STATUS[s]}</button>`:`<span class="tag ${cls}">${STATUS[s]}</span>`;}
  function difficultyTag(diff){return `<span class="tag ${String(diff).toLowerCase()}">${esc(DIFFICULTY[diff]||diff)}</span>`;}
  function sectionTitle(head,sub,action){return `<div class="section-head"><div><h2>${head}</h2><p>${sub}</p></div>${action||''}</div>`;}
  function statCard(label,value,unit,sub,icon,style){return `<article class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon ${style||''}">${icon}</span></div><div class="stat-value">${value}${unit?`<span class="unit">${unit}</span>`:''}</div><div class="stat-sub">${sub}</div></article>`;}
  function weekChart(){let b='';for(let w=1;w<=8;w++){const n=completedWeek(w),pct=Math.round(n/9*100);b+=`<div class="week-bar-wrap ${w===currentWeek()?'current':''}" title="Week ${w}: ${n}/9"><div class="week-bar"><div class="week-bar-fill" style="height:${pct}%"></div></div><span>W${w}</span></div>`;}return `<div class="weekly-chart">${b}</div><div class="chart-legend"><span class="legend-dot"></span>已完成比例 <span class="legend-dot green"></span>当前周</div>`;}
  function renderProblemCard(p){return `<article class="problem-card"><div><div class="problem-header"><span class="problem-num">LC #${p.id}</span>${statusTag(p)}</div><a class="problem-title" href="${attr(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)} ↗</a><div class="problem-tag-line">${esc(p.pattern)}</div></div><div class="problem-card-bottom">${difficultyTag(p.difficulty)}<button type="button" class="quick-log" data-action="log" data-id="${p.id}">＋ 记录</button></div></article>`;}
  function recentEntries(limit=5){const arr=state.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).slice(0,limit);if(!arr.length)return emptyState('目前还没有学习记录','完成第一道题之后，在这里记录耗时、状态和反思。','＋ 记录第一条','log');return `<div class="recent-list">${arr.map(s=>{const p=byId.get(s.problemId);return `<div class="recent-line"><span class="recent-icon">{ }</span><div class="recent-main"><strong>${esc(p.title)}</strong><span>${fmtDay(s.date)} · ${RESULT_TEXT[s.outcome]} · 信心 ${s.confidence}/5</span></div><span class="recent-time">${s.minutes} min</span></div>`;}).join('')}</div>`;}
  function emptyState(head,description,cta,action){return `<div class="empty-state"><div class="empty-icon">◇</div><strong>${head}</strong><p>${description}</p>${cta?`<button type="button" class="btn btn-soft btn-sm" data-action="${action}">${cta}</button>`:''}</div>`;}
  function renderDashboard(){
    const c=counts(),cw=currentWeek(),progress=Math.round(c.solvedCore/72*100),weekDone=completedWeek(cw);
    const hour=new Date().getHours();const greeting=hour<11?'早上好':hour<18?'下午好':'晚上好';
    const tasks=PROBLEMS.filter(p=>p.week===`Week ${cw}`);
    return `<div class="intro-row"><div><div class="eyebrow">INTERVIEW READINESS</div><h1>${greeting}，继续积累你的算法实力。</h1><p>Google L3 · Amazon SDE I · Microsoft New Grad &nbsp; / &nbsp; Go-first practice</p></div><div class="intro-actions"><button class="btn btn-white" data-action="settings">⚙ 设置</button><button class="btn btn-soft" data-action="problems">查看全部题目 ↗</button></div></div>
      <div class="stats-grid">${statCard('核心题已完成',c.solvedCore,'/ 72',`全部题目 ${c.solved} / ${c.total}`,'✓')}${statCard('今日练习',c.minutesToday,'min',`${c.doneToday} 次练习记录`,'◷','blue')}${statCard('连续打卡',streak(),'天',streak()>0?'保持节奏，继续加油':'今天记一条练习，开始打卡','↗','orange')}${statCard(`Week ${cw} 进度`,weekDone,'/ 9',`${WEEK_LABELS[cw-1]}`,'▥','green')}</div>
      <div class="two-col"><section class="panel"><div class="panel-head"><div><h2>每周完成进度</h2><div class="subdued">8 周核心路线 · 72 道必刷</div></div><button class="panel-link" data-action="analytics">详细统计 ↗</button></div>${weekChart()}</section><section class="panel"><div class="panel-head"><div><h2>整体掌握程度</h2><div class="subdued">完成标准：能独立用 Go 解出并解释</div></div></div><div class="daily-meter"><div class="meter-circle" style="--meter:${progress}%"><div class="meter-center">${progress}%</div></div><div class="meter-copy"><strong>${c.solvedCore} / 72 道核心题</strong><span>按 8 周计划推进<br>进阶挑战：${c.solvedStretch} / 12</span></div></div><div class="tiny-progress"><span style="width:${progress}%"></span></div><div class="quick-info"><b>今日目标</b> 先做 1 道题，再记录思路与耗时</div></section></div>
      <div class="overview-banner"><div><h3>今天学了什么？</h3><p>每次做题记录结果、耗时、信心和错误。连续积累，比一次刷很多题更重要。</p></div><button class="btn" data-action="log">＋ 添加今日记录</button></div>
      ${sectionTitle(`Week ${cw} · 本周刷题`,`9 道核心题 · ${WEEK_LABELS[cw-1]}`,`<button class="panel-link" data-action="week" data-week="${cw}">查看这一周全部题目 ↗</button>`)}
      <div class="problem-grid">${tasks.map(renderProblemCard).join('')}</div>
      ${sectionTitle('最近练习记录','不只是标记完成，记录你做题的过程',`<button class="panel-link" data-action="journal">查看全部记录 ↗</button>`)}
      <section class="panel">${recentEntries(5)}</section>`;
  }
  function renderProblems(){
    const c=counts();const weeks=['All',...Array.from({length:8},(_,i)=>`Week ${i+1}`),'Stretch','Review'];
    const categories=['Core','Stretch','Review','All'];
    const tracks=categories.map(v=>`<button class="filter-tab ${filter.track===v?'active':''}" data-action="track-filter" data-val="${v}">${v==='Core'?'核心 Core':v==='Stretch'?'进阶 Stretch':v==='Review'?'旧题 Review':'全部 All'} <span>${v==='Core'?c.core:v==='Stretch'?c.stretch:v==='Review'?c.review:c.total}</span></button>`).join('');
    const matches=PROBLEMS.filter(p=>(filter.track==='All'||p.track===filter.track)&&(filter.week==='All'||p.week===filter.week)&&(filter.difficulty==='All'||p.difficulty===filter.difficulty)&&(filter.status==='All'||statusFor(p)===filter.status)&&(!filter.search||`${p.id} ${p.title} ${p.pattern} ${p.topic}`.toLowerCase().includes(filter.search.toLowerCase())));
    const totalPages=Math.max(1,Math.ceil(matches.length/20));filter.page=clamp(filter.page,1,totalPages);
    const list=matches.slice((filter.page-1)*20,filter.page*20);
    return `<div class="intro-row"><div><div class="eyebrow">PROBLEM LIBRARY</div><h1>LeetCode 刷题清单</h1><p>从原始 Excel 同步的 90 道题 · 状态由练习记录自动计算</p></div><div class="intro-actions"><button class="btn btn-white" data-action="settings">导入 / 导出数据</button><button class="btn btn-primary" data-action="log">＋ 添加练习</button></div></div>
      <div class="filter-tabs">${tracks}</div>
      <div class="toolbar"><div class="search-wrap"><input class="field search-field" type="search" id="problemSearch" placeholder="搜索题号、名称或算法模式…" value="${attr(filter.search)}" autocomplete="off" aria-label="搜索题目" /></div><select id="weekFilter" class="select" aria-label="周次">${weeks.map(w=>`<option value="${w}" ${filter.week===w?'selected':''}>${w==='All'?'全部周次':w}</option>`).join('')}</select><select id="difficultyFilter" class="select" aria-label="难度">${['All','Easy','Medium','Hard'].map(w=>`<option value="${w}" ${filter.difficulty===w?'selected':''}>${w==='All'?'全部难度':w}</option>`).join('')}</select><select id="statusFilter" class="select" aria-label="状态">${['All','Not Started','In Progress','Solved','Review'].map(w=>`<option value="${w}" ${filter.status===w?'selected':''}>${w==='All'?'全部状态':STATUS[w]}</option>`).join('')}</select></div>
      <div class="table-wrap"><table class="problem-table"><thead><tr><th>题目 Problem</th><th>周次</th><th>难度</th><th>算法模式 Pattern</th><th>学习状态</th><th>最近练习</th><th>操作</th></tr></thead><tbody>${list.length?list.map(p=>`<tr><td><a class="table-title" href="${attr(p.url)}" target="_blank" rel="noopener noreferrer"><span class="table-num">${p.id}.</span>${esc(p.title)} ↗</a></td><td>${esc(p.week)}</td><td>${difficultyTag(p.difficulty)}</td><td>${esc(p.pattern)}</td><td>${statusTag(p,true)}</td><td>${lastPracticeDate(p)?fmtDay(lastPracticeDate(p)):'—'}</td><td><button class="btn btn-soft btn-sm" data-action="log" data-id="${p.id}">记录</button></td></tr>`).join(''):`<tr><td colspan="7">${emptyState('没有找到匹配的题目','尝试清空搜索条件或切换筛选。','','')}</td></tr>`}</tbody></table></div>
      <div class="table-foot"><span>显示 ${matches.length?((filter.page-1)*20+1):0}–${Math.min(filter.page*20,matches.length)} / ${matches.length} 道题</span><div class="page-actions"><button class="btn btn-white btn-sm" data-action="previous-page" ${filter.page===1?'disabled':''}>上一页</button><button class="btn btn-white btn-sm" data-action="next-page" ${filter.page>=totalPages?'disabled':''}>下一页</button></div></div>`;
  }
  function renderJournal(){
    const logs=state.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);
    const distinctDays=new Set(logs.map(s=>s.date)).size;
    return `<div class="intro-row"><div><div class="eyebrow">YOUR PRACTICE DIARY</div><h1>每日练习记录</h1><p>${logs.length} 条练习 · ${distinctDays} 个学习日 · ${counts().minutesTotal} 分钟累计训练</p></div><div class="intro-actions"><button class="btn btn-white" data-action="export">↓ 导出备份</button><button class="btn btn-primary" data-action="log">＋ 新增记录</button></div></div>
      <section class="panel" style="margin-bottom:17px"><div class="panel-head"><div><h2>最近 13 周的学习热力图</h2><div class="subdued">一格代表一天，颜色越深表示练习次数越多</div></div><span class="small-muted">连续 ${streak()} 天</span></div>${calendarHeatmap()}</section>
      ${sectionTitle('全部练习流水','支持编辑、删除。每天同一道题也可以记录多次。','')}
      ${logs.length?logs.map(s=>{const p=byId.get(s.problemId);return `<article class="journal-card"><div><div class="journal-date">${fmtDay(s.date)} · ${s.date}</div><div class="journal-title"><a href="${attr(p.url)}" target="_blank" rel="noopener noreferrer">#${p.id} ${esc(p.title)} ↗</a></div><div class="journal-meta"><span>${difficultyTag(p.difficulty)}</span><span class="tag ${s.outcome==='Solved'?'status-solved':s.outcome==='Review'?'status-review':'status-progress'}">${RESULT_TEXT[s.outcome]}</span><span>◷ ${s.minutes} min</span><span>信心 ${s.confidence}/5</span></div>${s.notes?`<p class="journal-note">${esc(s.notes)}</p>`:''}</div><div class="journal-actions"><button class="icon-btn" title="编辑记录" aria-label="编辑记录" data-action="edit" data-log="${attr(s.id)}">✎</button><button class="icon-btn" title="删除记录" aria-label="删除记录" data-action="delete" data-log="${attr(s.id)}">×</button></div></article>`;}).join(''):emptyState('你的学习日志尚为空','先记录第一道题，以后可以查看自己的做题历史和复盘笔记。','＋ 添加今日记录','log')}`;
  }
  function calendarHeatmap(){
    const map={};for(const s of state.sessions)map[s.date]=(map[s.date]||0)+1;
    const d=parseDay(today());const mondayDelta=(d.getDay()+6)%7;const thisMonday=shiftDay(today(),-mondayDelta);const start=shiftDay(thisMonday,-12*7);let cells='';for(let i=0;i<91;i++){const day=shiftDay(start,i),n=map[day]||0;const className=n>=4?'lv4':n===3?'lv3':n===2?'lv2':n===1?'lv1':'';cells+=`<div class="calendar-cell ${className}" title="${day}: ${n} 次练习" aria-label="${day} ${n} 次练习"></div>`;}
    return `<div class="calendar-months"><span>${fmtDay(start)}</span><span>MON → SUN</span><span>${fmtDay(shiftDay(start,90))}</span></div><div class="calendar-grid">${cells}</div><div class="calendar-legend"><span class="level-text">Less</span><span class="calendar-cell"></span><span class="calendar-cell lv1"></span><span class="calendar-cell lv2"></span><span class="calendar-cell lv3"></span><span class="calendar-cell lv4"></span><span class="level-text">More</span></div>`;
  }
  function renderAnalytics(){
    const c=counts();const topics=Array.from(new Set(PROBLEMS.filter(p=>p.track==='Core').map(p=>p.topic)));
    const ds={Easy:[0,0],Medium:[0,0],Hard:[0,0]};for(const p of PROBLEMS){ds[p.difficulty][1]++;if(statusFor(p)==='Solved')ds[p.difficulty][0]++;}
    const weekRows=Array.from({length:8},(_,i)=>{const w=i+1,n=completedWeek(w);return `<div class="week-line"><strong>Week ${w}</strong><div class="topic-track"><span style="width:${100*n/9}%"></span></div><span>${n} / 9</span></div>`;}).join('');
    const topicRows=topics.map(topic=>{const ps=PROBLEMS.filter(p=>p.track==='Core'&&p.topic===topic),n=ps.filter(p=>statusFor(p)==='Solved').length;return `<div class="topic-row"><span title="${esc(topic)}" class="topic-label">${esc(topic)}</span><div class="topic-track"><span style="width:${100*n/ps.length}%"></span></div><span class="topic-count">${n}/${ps.length}</span></div>`;}).join('');
    return `<div class="intro-row"><div><div class="eyebrow">PERFORMANCE INSIGHTS</div><h1>学习表现分析</h1><p>看见自己的进步，也找出需要强化的薄弱点。</p></div><button class="btn btn-white" data-action="export">↓ 导出备份</button></div>
      <div class="stats-grid">${statCard('累计练习',state.sessions.length,'次','包含重复练习','↗')}${statCard('累计时间',c.minutesTotal,'分钟',`${Math.floor(c.minutesTotal/60)} 小时 ${c.minutesTotal%60} 分钟`,'◷','blue')}${statCard('学习天数',new Set(state.sessions.map(s=>s.date)).size,'天',`连续打卡 ${streak()} 天`,'▣','green')}${statCard('已掌握题目',c.solved,'/ 90',`Core ${c.solvedCore} · Stretch ${c.solvedStretch}`,'✓','orange')}</div>
      <div class="analytics-grid"><section class="panel"><div class="panel-head"><div><h2>每周达成率</h2><div class="subdued">按核心题的掌握状态统计</div></div></div><div class="weekly-rows">${weekRows}</div></section><section class="panel"><div class="panel-head"><div><h2>各算法方向</h2><div class="subdued">分主题统计已掌握题量</div></div></div>${topicRows}</section><section class="panel"><div class="panel-head"><div><h2>学习热力图</h2><div class="subdued">最近 13 周练习天数和强度</div></div></div>${calendarHeatmap()}</section><section class="panel"><div class="panel-head"><div><h2>按难度完成</h2><div class="subdued">核心题 + 进阶题 + 旧题复习</div></div></div>${Object.keys(ds).map(k=>`<div class="topic-row"><span class="topic-label">${DIFFICULTY[k]} (${k})</span><div class="topic-track"><span style="width:${ds[k][1]?100*ds[k][0]/ds[k][1]:0}%"></span></div><span class="topic-count">${ds[k][0]} / ${ds[k][1]}</span></div>`).join('')}</section></div>`;
  }
  function sideWeekNav(){document.getElementById('weekSideNav').innerHTML=Array.from({length:8},(_,i)=>{const w=i+1,n=completedWeek(w);return `<button type="button" data-action="week" data-week="${w}" class="${currentView==='problems'&&filter.week===`Week ${w}`?'active':''}"><span>Week ${w}</span><small>${n}/9</small></button>`;}).join('');}
  function render(){
    document.getElementById('currentPageName').textContent=({dashboard:'Dashboard',problems:'Problem Library',journal:'Practice Journal',analytics:'Analytics'})[currentView]||'Dashboard';
    document.getElementById('todayPill').textContent=dateFmt.format(new Date());
    document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
    sideWeekNav();
    root.innerHTML=({dashboard:renderDashboard,problems:renderProblems,journal:renderJournal,analytics:renderAnalytics}[currentView]||renderDashboard)();
  }
  function navigate(view,preserveScroll=false){currentView=view;location.hash=view;render();if(!preserveScroll)window.scrollTo({top:0,behavior:'instant'});}
  function setWeek(w){filter.track='Core';filter.week=`Week ${w}`;filter.page=1;filter.status='All';navigate('problems');}
  function modal(content){modalInner.innerHTML=content;modalRoot.classList.remove('hidden');modalRoot.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';const first=modalInner.querySelector('input,select,textarea,button');if(first)setTimeout(()=>first.focus(),10);}
  function closeModal(){modalRoot.classList.add('hidden');modalRoot.setAttribute('aria-hidden','true');document.body.style.overflow='';modalInner.innerHTML='';}
  function modalHeader(title,desc){return `<header class="modal-head"><div><h2 id="modalTitle">${title}</h2><p>${desc}</p></div><button type="button" class="close-modal" data-action="close" aria-label="关闭">×</button></header>`;}
  function openLogModal(problemId=null,logId=null){
    const existing=logId?state.sessions.find(s=>s.id===logId):null;
    const id=existing?.problemId||Number(problemId)||null;
    const selected=id?byId.get(id):null;
    const sorted=PROBLEMS.slice().sort((a,b)=>a.track.localeCompare(b.track)||Number(a.week.replace('Week ',''))-Number(b.week.replace('Week ',''))||a.id-b.id);
    modal(`${modalHeader(existing?'编辑练习记录':'记录一次练习','记录用时与解题过程，保存后自动更新统计。')}<form id="logForm"><div class="modal-body"><div class="form-grid"><div class="form-group full"><label class="form-label" for="logProblem">LeetCode 题目 *</label><select class="form-control" id="logProblem" name="problemId" required>${selected?'':`<option value="">请选择题目…</option>`}${sorted.map(p=>`<option value="${p.id}" ${id===p.id?'selected':''}>#${p.id} ${esc(p.title)} · ${p.week}</option>`).join('')}</select></div><div class="form-group"><label class="form-label" for="logDate">练习日期 *</label><input class="form-control" type="date" id="logDate" name="date" value="${existing?.date||today()}" required /></div><div class="form-group"><label class="form-label" for="logMinutes">耗时（分钟） *</label><input class="form-control" type="number" min="0" max="1440" step="1" id="logMinutes" name="minutes" value="${existing?.minutes??30}" required /></div><div class="form-group"><label class="form-label" for="logOutcome">本次结果 *</label><select class="form-control" id="logOutcome" name="outcome"><option value="In Progress" ${(!existing||existing.outcome==='In Progress')?'selected':''}>练习中 · Practiced</option><option value="Solved" ${existing?.outcome==='Solved'?'selected':''}>独立完成 · Solved</option><option value="Review" ${existing?.outcome==='Review'?'selected':''}>需复习 · Review</option></select></div><div class="form-group"><label class="form-label" for="logConfidence">独立解题信心</label><select class="form-control" id="logConfidence" name="confidence">${[1,2,3,4,5].map(n=>`<option value="${n}" ${(existing?.confidence??3)===n?'selected':''}>${n}/5 ${['','不熟悉','有点吃力','一般','比较稳','可以面试讲清'][n]}</option>`).join('')}</select></div><div class="form-group full"><label class="form-label" for="logNotes">复盘 / 思路 / 错误（可选）</label><textarea class="form-control" id="logNotes" name="notes" maxlength="10000" placeholder="如：Go map 统计频率；忘记检查 empty input；时间复杂度 O(n)…">${esc(existing?.notes||'')}</textarea></div></div></div><div class="modal-foot"><button type="button" class="btn btn-white" data-action="close">取消</button><button type="submit" class="btn btn-primary">${existing?'保存修改':'保存练习记录'}</button></div><input type="hidden" name="logId" value="${attr(existing?.id||'')}" /></form>`);
  }
  function saveLogFromForm(form){
    const fd=new FormData(form);const p=Number(fd.get('problemId')),date=String(fd.get('date'));
    const minutes=Number(fd.get('minutes')),outcome=String(fd.get('outcome'));
    if(!byId.has(p)||!validDate(date)||!Number.isInteger(minutes)||minutes<0||minutes>1440||!['In Progress','Solved','Review'].includes(outcome)){toast('请检查题目、日期、耗时和结果');return;}
    const oldId=String(fd.get('logId')||'');const existing=state.sessions.find(s=>s.id===oldId);
    const s=sanitizeLog({id:existing?.id||newId(),problemId:p,date,minutes,outcome,confidence:Number(fd.get('confidence')),notes:String(fd.get('notes')||''),createdAt:existing?.createdAt||Date.now()});
    if(!s)return;
    if(existing)state.sessions=state.sessions.map(x=>x.id===existing.id?s:x);else state.sessions.push(s);
    saveState();closeModal();render();toast(existing?'已更新练习记录':'练习已保存，继续保持！');
  }
  function openSettings(){modal(`${modalHeader('设置与数据备份','所有数据默认仅保存在当前浏览器中。')}<div class="modal-body"><div class="modal-box"><b>关于数据保存</b><br>每次记录会自动保存至当前浏览器 localStorage。不同浏览器和设备<b>不会自动同步</b>。建议定期导出 JSON 备份，切勿清理本网站的站点数据。</div><div class="setting-line"><div><h4>8 周计划开始日期</h4><p>决定 Dashboard 当前显示 Week 几。</p></div><input class="form-control" id="startDateInput" type="date" value="${attr(state.startDate)}" style="width:150px;flex-shrink:0" /></div><div class="setting-line"><div><h4>备份 / 迁移学习记录</h4><p>导出 JSON 文件，再在另一台设备导入。</p></div><div class="setting-actions"><button type="button" class="btn btn-soft btn-sm" data-action="export">↓ 导出</button><button type="button" class="btn btn-white btn-sm" data-action="import">↑ 导入</button></div></div><div class="setting-line"><div><h4>清空练习数据</h4><p>不可撤销，建议先导出备份。</p></div><button type="button" class="btn btn-danger btn-sm" data-action="reset">清空</button></div></div><div class="modal-foot"><button type="button" class="btn btn-primary" data-action="close">完成</button></div>`);}
  function exportBackup(){const data={app:'LeetFlow',version:1,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`LeetFlow-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('JSON 备份已导出');}
  async function importBackup(file){if(!file)return;try{const input=JSON.parse(await file.text());const x=input?.state||input; if(!x||!Array.isArray(x.sessions)||x.sessions.length>50000)throw Error('Invalid JSON');const clean={version:1,startDate:validDate(x.startDate)?x.startDate:today(),sessions:x.sessions.map(sanitizeLog).filter(Boolean),starred:Array.isArray(x.starred)?x.starred.map(Number).filter(n=>byId.has(n)):[]};if(!confirm(`即将导入 ${clean.sessions.length} 条练习记录，并覆盖当前 ${state.sessions.length} 条记录。确定继续吗？`))return;state=clean;saveState();closeModal();render();toast(`导入成功：${state.sessions.length} 条练习记录`);}catch(err){toast('导入失败：请使用本站导出的 JSON 备份文件');}}
  function deleteLog(id){const s=state.sessions.find(x=>x.id===id);if(!s)return;const p=byId.get(s.problemId);if(!confirm(`确定删除「${p.title}」在 ${s.date} 的练习记录吗？`))return;state.sessions=state.sessions.filter(x=>x.id!==id);saveState();render();toast('记录已删除');}

  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-close-modal]');if(close){closeModal();return;}
    const nav=e.target.closest('[data-view]');if(nav){navigate(nav.dataset.view);return;}
    const el=e.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='log'){openLogModal(el.dataset.id||null);return;}
    if(action==='close'){closeModal();return;}
    if(action==='settings'){openSettings();return;}
    if(action==='week'){setWeek(Number(el.dataset.week));return;}
    if(['dashboard','problems','journal','analytics'].includes(action)){navigate(action);return;}
    if(action==='track-filter'){filter.track=el.dataset.val;filter.week='All';filter.page=1;render();return;}
    if(action==='next-page'){filter.page++;render();return;}
    if(action==='previous-page'){filter.page--;render();return;}
    if(action==='edit'){openLogModal(null,el.dataset.log);return;}
    if(action==='delete'){deleteLog(el.dataset.log);return;}
    if(action==='export'){exportBackup();return;}
    if(action==='import'){document.getElementById('importInput').click();return;}
    if(action==='reset'){if(!confirm('确认清空全部练习记录？此操作无法撤销。'))return;state.sessions=[];saveState();closeModal();render();toast('已清空练习记录');}
  });
  document.addEventListener('submit',e=>{if(e.target.id==='logForm'){e.preventDefault();saveLogFromForm(e.target);}});
  document.addEventListener('change',e=>{
    if(e.target.id==='weekFilter'){filter.week=e.target.value;filter.page=1;render();}
    if(e.target.id==='difficultyFilter'){filter.difficulty=e.target.value;filter.page=1;render();}
    if(e.target.id==='statusFilter'){filter.status=e.target.value;filter.page=1;render();}
    if(e.target.id==='startDateInput'){if(validDate(e.target.value)){state.startDate=e.target.value;saveState();closeModal();render();toast('计划开始日期已更新');}else toast('日期格式不正确');}
    if(e.target.id==='importInput'){importBackup(e.target.files?.[0]);e.target.value='';}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='problemSearch'){
      const pos=e.target.selectionStart;filter.search=e.target.value;filter.page=1;render();const x=document.getElementById('problemSearch');if(x){x.focus();try{x.setSelectionRange(pos,pos);}catch(_){}}
    }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modalRoot.classList.contains('hidden'))closeModal();});
  document.getElementById('openNewLog').addEventListener('click',()=>openLogModal());
  document.getElementById('openSettings').addEventListener('click',()=>openSettings());
  window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(['dashboard','problems','journal','analytics'].includes(v)&&v!==currentView){currentView=v;render();}});
  const initialView=location.hash.slice(1);if(['dashboard','problems','journal','analytics'].includes(initialView))currentView=initialView;
  render();
})();