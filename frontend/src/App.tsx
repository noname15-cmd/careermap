import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, UserRound, Sparkles, Route as RouteIcon, LogOut, Compass, Bell, Search, Plus, ArrowUpRight, BriefcaseBusiness, Target, CheckCircle2, Clock3, Trash2, LoaderCircle, ChevronRight, Menu, X } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import api from './api'
import type { User, Skill, Job, Analysis, Task } from './types'

const demoChart = [{name:'Mon',score:24},{name:'Tue',score:32},{name:'Wed',score:31},{name:'Thu',score:46},{name:'Fri',score:52},{name:'Sat',score:61},{name:'Sun',score:68}]
function errorText(e:any){ return e?.response?.data?.detail || 'Something went wrong. Please try again.' }

function AuthPage({mode,onAuth}:{mode:'login'|'register';onAuth:(token:string)=>void}) {
  const [name,setName]=useState(''), [email,setEmail]=useState(''), [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false), [error,setError]=useState('')
  const nav=useNavigate()
  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true); setError('')
    try{
      const url=mode==='register'?'/api/auth/register':'/api/auth/login'
      const payload=mode==='register'?{name,email,password}:{email,password}
      const {data}=await api.post(url,payload); onAuth(data.access_token); nav('/dashboard')
    }catch(err){setError(errorText(err))}finally{setBusy(false)}
  }
  return <div className="auth-shell">
    <div className="auth-visual"><div className="brand light"><span className="brand-mark"><Compass size={19}/></span>careermap</div><div className="auth-copy"><span className="eyebrow light-eyebrow">YOUR CAREER, IN FOCUS</span><h1>Make your next move <em>with clarity.</em></h1><p>Understand your strengths, close skill gaps, and build a roadmap that moves you forward.</p><div className="auth-mini-card"><div className="mini-icon"><Sparkles size={18}/></div><div><b>Your growth, made visible</b><small>One thoughtful step at a time.</small></div><ArrowUpRight size={18}/></div></div><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/></div>
    <div className="auth-form-side"><div className="auth-form-wrap"><div className="mobile-brand brand"><span className="brand-mark"><Compass size={19}/></span>careermap</div><span className="eyebrow">GET STARTED</span><h2>{mode==='register'?'Create your account':'Welcome back'}</h2><p className="muted">{mode==='register'?'A clearer path to your next opportunity starts here.':'Sign in to continue building your career path.'}</p>
      <form onSubmit={submit} className="form-stack">
        {mode==='register'&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required minLength={2}/></label>}
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8}/></label>
        {error&&<div className="alert">{error}</div>}
        <button className="btn btn-primary full" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:null}{mode==='register'?'Create account':'Sign in'} <ArrowUpRight size={16}/></button>
      </form>
      <p className="auth-switch">{mode==='register'?'Already have an account?':'New to CareerMap?'} <NavLink to={mode==='register'?'/login':'/register'}>{mode==='register'?'Sign in':'Create an account'}</NavLink></p>
      <div className="secure-note"><span/> Your data stays private to your account.</div>
    </div></div>
  </div>
}

function App(){
  const [token,setToken]=useState(localStorage.getItem('careermap_token')||'')
  const [user,setUser]=useState<User|null>(null)
  const [skills,setSkills]=useState<Skill[]>([])
  const [jobs,setJobs]=useState<Job[]>([])
  const [tasks,setTasks]=useState<Task[]>([])
  const [loading,setLoading]=useState(false)
  const [mobileOpen,setMobileOpen]=useState(false)
  const location=useLocation()
  const nav=useNavigate()
  function auth(t:string){localStorage.setItem('careermap_token',t);setToken(t)}
  function logout(){localStorage.removeItem('careermap_token');setToken('');setUser(null);nav('/login')}
  async function refresh(){
    if(!token)return
    setLoading(true)
    try{
      const [u,s,j,t]=await Promise.all([api.get('/api/users/me'),api.get('/api/skills'),api.get('/api/jobs'),api.get('/api/roadmap')])
      setUser(u.data);setSkills(s.data);setJobs(j.data);setTasks(t.data)
    }catch{logout()}finally{setLoading(false)}
  }
  useEffect(()=>{if(token)refresh();else setUser(null)},[token])
  useEffect(()=>{setMobileOpen(false)},[location.pathname])
  if(!token)return <Routes><Route path="/register" element={<AuthPage mode="register" onAuth={auth}/>}/><Route path="*" element={<AuthPage mode="login" onAuth={auth}/>}/></Routes>
  if(!user)return <div className="loading-screen"><div className="loader-mark"><Compass/></div><span>Preparing your workspace…</span></div>
  const shared={user,skills,jobs,tasks,refresh}
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand"><span className="brand-mark"><Compass size={19}/></span>careermap</div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        <NavLink to="/dashboard"><LayoutDashboard size={18}/>Overview</NavLink>
        <NavLink to="/skills"><Target size={18}/>My skills<span className="nav-count">{skills.length}</span></NavLink>
        <NavLink to="/analyzer"><Sparkles size={18}/>Job analyzer</NavLink>
        <NavLink to="/roadmap"><RouteIcon size={18}/>Career roadmap</NavLink>
        <NavLink to="/profile"><UserRound size={18}/>My profile</NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-spark"><Sparkles size={16}/></div><b>Small steps add up.</b><p>Keep your profile current and make your next move intentional.</p><NavLink to="/analyzer">Analyze a role <ArrowUpRight size={13}/></NavLink></div><button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button></div>
    </aside>
    {mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{location.pathname.split('/')[1]||'dashboard'}</b></div><div className="top-actions"><div className="search-pill"><Search size={15}/><span>Career clarity starts here</span></div><button className="icon-btn" title="Notifications"><Bell size={18}/></button><div className="user-chip"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div><b>{user.name}</b><small>{user.target_role}</small></div></div></div></header>
      <div className="page-wrap">
        {loading&&<div className="loading-line"/>}
        <Routes>
          <Route path="/dashboard" element={<Dashboard {...shared}/>}/>
          <Route path="/skills" element={<SkillsPage {...shared}/>}/>
          <Route path="/analyzer" element={<AnalyzerPage {...shared}/>}/>
          <Route path="/roadmap" element={<RoadmapPage {...shared}/>}/>
          <Route path="/profile" element={<ProfilePage {...shared}/>}/>
          <Route path="*" element={<Navigate to="/dashboard"/>}/>
        </Routes>
      </div>
    </main>
  </div>
}

function PageHeading({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:React.ReactNode}){
 return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}
function Dashboard({user,skills,jobs,tasks}:any){
 const completed=tasks.filter((t:Task)=>t.status==='completed').length
 const score=skills.length?Math.min(100,Math.round(skills.reduce((a:number,s:Skill)=>a+s.level,0)/(skills.length*5)*100)):0
 return <><PageHeading eyebrow="YOUR OVERVIEW" title={`Good to see you, ${user.name.split(' ')[0]}.`} subtitle="A little progress today creates more options tomorrow." action={<NavLink className="btn btn-primary" to="/analyzer"><Plus size={17}/> Analyze a role</NavLink>}/>
  <section className="welcome-banner"><div className="welcome-content"><span className="banner-tag"><Sparkles size={13}/> YOUR CAREER SPACE</span><h2>Build a career that<br/><em>fits your potential.</em></h2><p>Turn your current skills into a clear, practical next step.</p><NavLink to="/skills" className="banner-link">Explore my skills <ArrowUpRight size={15}/></NavLink></div><div className="banner-art"><div className="art-ring ring-a"/><div className="art-ring ring-b"/><div className="art-card"><span>CAREER<br/>GROWTH</span><div className="art-bars"><i/><i/><i/><i/><i/></div><Sparkles size={21}/></div><div className="floating-dot dot-a"/><div className="floating-dot dot-b"/></div></section>
  <div className="stat-grid"><Stat icon={<Target/>} label="Skills in profile" value={skills.length} note="Your current toolkit" tone="violet"/><Stat icon={<BriefcaseBusiness/>} label="Roles analyzed" value={jobs.length} note="Opportunities explored" tone="blue"/><Stat icon={<CheckCircle2/>} label="Tasks completed" value={completed} note={`${tasks.length} roadmap tasks`} tone="green"/><Stat icon={<Sparkles/>} label="Skill level index" value={`${score}%`} note="Average self-assessment" tone="amber"/></div>
  <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h3>Your growth journey</h3><p>Illustrative progress trend</p></div><span className="period-chip">7 days</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={demoChart}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b78e8" stopOpacity={.25}/><stop offset="100%" stopColor="#8b78e8" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#9a9baa',fontSize:11}}/><Tooltip/><Area type="monotone" dataKey="score" stroke="#8874e6" strokeWidth={3} fill="url(#chartFill)"/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><i className="legend-dot"/> Growth index</span><small>Sample visualization — not historical user data</small></div></section>
  <section className="panel"><div className="panel-head"><div><h3>Skill snapshot</h3><p>Your self-assessed strengths</p></div><NavLink to="/skills" className="text-link">View all <ArrowUpRight size={14}/></NavLink></div>{skills.slice(0,4).length?skills.slice(0,4).map((s:Skill)=><div className="skill-row" key={s.id}><div className="skill-row-top"><b>{s.name}</b><small>Level {s.level}/5</small></div><div className="meter"><span style={{width:`${s.level*20}%`}}/></div></div>):<Empty icon={<Target/>} title="Your skills live here" text="Add a few skills to start building your profile." link="/skills" linkText="Add your first skill"/>}</section></div>
  <section className="panel recent-panel"><div className="panel-head"><div><h3>Recent roadmap tasks</h3><p>Keep your momentum going</p></div><NavLink to="/roadmap" className="text-link">Open roadmap <ArrowUpRight size={14}/></NavLink></div>{tasks.slice(0,3).length?tasks.slice(0,3).map((t:Task)=><div className="task-line" key={t.id}><span className={`task-status ${t.status}`}>{t.status==='completed'?<CheckCircle2 size={16}/>:<Clock3 size={16}/>}</span><div><b>{t.title}</b><small>{t.description}</small></div><span className="status-label">{t.status.replace('_',' ')}</span></div>):<Empty icon={<RouteIcon/>} title="Your roadmap is waiting" text="Analyze a job description to create your first learning plan." link="/analyzer" linkText="Analyze a role"/>}</section>
 </>
}
function Stat({icon,label,value,note,tone}:any){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}
function Empty({icon,title,text,link,linkText}:any){return <div className="empty-state"><div className="empty-icon">{icon}</div><b>{title}</b><p>{text}</p><NavLink to={link} className="text-link">{linkText} <ArrowUpRight size={14}/></NavLink></div>}

function SkillsPage({skills,refresh}:any){
 const [name,setName]=useState(''),[level,setLevel]=useState(3),[category,setCategory]=useState('Technical'),[busy,setBusy]=useState(false),[error,setError]=useState('')
 async function add(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await api.post('/api/skills',{name,level,category});setName('');setLevel(3);await refresh()}catch(err){setError(errorText(err))}finally{setBusy(false)}}
 async function remove(id:number){if(!confirm('Remove this skill from your profile?'))return;await api.delete(`/api/skills/${id}`);refresh()}
 return <><PageHeading eyebrow="YOUR TOOLKIT" title="My skills" subtitle="Keep your skills up to date. Honest self-assessment makes your analysis more useful."/><div className="content-two"><section className="panel"><div className="panel-head"><div><h3>Your skill library</h3><p>{skills.length} skills added</p></div><span className="count-bubble">{skills.length}</span></div>{skills.length?skills.map((s:Skill)=><div className="skill-manage" key={s.id}><div className="skill-symbol">{s.name.slice(0,1).toUpperCase()}</div><div className="skill-manage-main"><b>{s.name}</b><small>{s.category} · Level {s.level}/5</small><div className="meter"><span style={{width:`${s.level*20}%`}}/></div></div><button className="subtle-icon danger-hover" onClick={()=>remove(s.id)} title="Remove skill"><Trash2 size={16}/></button></div>):<Empty icon={<Target/>} title="No skills added yet" text="Add the tools and abilities you already know." link="/analyzer" linkText="Explore career roles"/>}</section>
 <section className="panel add-skill-panel"><div className="panel-head"><div><h3>Add a skill</h3><p>Build your professional snapshot</p></div><div className="soft-icon"><Plus/></div></div><form className="form-stack" onSubmit={add}><label>Skill name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Python, Communication" required maxLength={100}/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Technical</option><option>Frontend</option><option>Backend</option><option>Database</option><option>Tools</option><option>Design</option><option>Soft skills</option><option>Other</option></select></label><label>Current level <div className="level-picker">{[1,2,3,4,5].map(n=><button type="button" className={level===n?'selected':''} onClick={()=>setLevel(n)} key={n}>{n}</button>)}</div><small className="field-hint">1 · Beginner &nbsp; 3 · Comfortable &nbsp; 5 · Advanced</small></label>{error&&<div className="alert">{error}</div>}<button className="btn btn-primary full" disabled={busy}>{busy?<LoaderCircle className="spin"/>:<Plus size={16}/>} Add skill</button></form></section></div></>
}

function AnalyzerPage({skills,jobs,refresh}:any){
 const [title,setTitle]=useState('Frontend Developer'),[description,setDescription]=useState('We are looking for a Frontend Developer with experience in HTML, CSS, JavaScript, React, TypeScript, Git and REST API development. Strong problem-solving and communication skills are a plus.'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[analysis,setAnalysis]=useState<Analysis|null>(null),[jobId,setJobId]=useState<number|null>(null),[source,setSource]=useState('')
 async function analyze(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setAnalysis(null);try{const created=await api.post('/api/jobs',{title,description});setJobId(created.data.id);const result=await api.post(`/api/jobs/${created.data.id}/analyze`);setAnalysis(result.data);setSource(result.data.source||'');await refresh()}catch(err){setError(errorText(err))}finally{setBusy(false)}}
 async function makeRoadmap(){if(!jobId)return;setBusy(true);try{await api.post(`/api/roadmap/generate/${jobId}`);await refresh()}catch(err){setError(errorText(err))}finally{setBusy(false)}}
 return <><PageHeading eyebrow="CAREER EXPLORATION" title="Analyze a role" subtitle="Paste a job description and discover which skills to strengthen."/><div className="analyzer-layout"><section className="panel analyzer-form"><div className="panel-head"><div><h3>Role details</h3><p>Use a real job description for a more meaningful result.</p></div><div className="soft-icon"><Sparkles/></div></div><form className="form-stack" onSubmit={analyze}><label>Target role<input value={title} onChange={e=>setTitle(e.target.value)} required maxLength={160}/></label><label>Job description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={9} minLength={30} maxLength={12000} placeholder="Paste the responsibilities and requirements here..." required/></label><div className="field-hint">{description.length}/12000 characters · Your profile currently has {skills.length} skills.</div>{error&&<div className="alert">{error}</div>}<button className="btn btn-primary full" disabled={busy}>{busy?<LoaderCircle className="spin"/>:<Sparkles size={17}/>} Analyze skills</button></form><div className="privacy-note">Your analysis is private to your account. AI output is a suggestion and should be reviewed.</div></section>
 <section className="analysis-column">{analysis?<><div className="panel result-hero"><span className="eyebrow">YOUR ROLE MATCH</span><div className="match-number">{analysis.match}<small>%</small></div><p>Skills coverage for <b>{analysis.role}</b></p><div className="match-meter"><span style={{width:`${analysis.match}%`}}/></div><div className="match-legend"><span><i className="legend-dot"/> Current skill coverage</span><span>{analysis.requirements.length} requirements found</span></div></div><div className="panel"><div className="panel-head"><div><h3>Skills to strengthen</h3><p>Prioritized gaps from this job description</p></div><span className="count-bubble">{analysis.gaps.length}</span></div>{analysis.gaps.length?analysis.gaps.map(g=><div className="gap-row" key={g.skill}><div><b>{g.skill}</b><small>Current {g.current_level}/5 · Target {g.required_level}/5</small></div><span className={`importance ${g.importance}`}>{g.importance}</span></div>):<div className="success-note"><CheckCircle2/> Your listed skills meet the extracted levels. Consider building a practical portfolio project.</div>}<button className="btn btn-primary full" onClick={makeRoadmap} disabled={busy}>{busy?<LoaderCircle className="spin"/>:<RouteIcon size={17}/>} Generate my roadmap</button></div><div className="panel"><h3>Skills already in your profile</h3><div className="tag-list">{analysis.matched_skills.length?analysis.matched_skills.map(s=><span className="tag matched" key={s}><CheckCircle2 size={13}/>{s}</span>):<p className="muted">No exact skill matches yet. Add skills in My skills.</p>}</div></div></>:<div className="empty-analysis"><div className="analysis-orbit"><div><Sparkles size={29}/></div></div><span className="eyebrow">YOUR NEXT STEP STARTS HERE</span><h2>See the gap.<br/><em>Shape your path.</em></h2><p>Run an analysis to see how your current skills compare with the requirements of a role you want.</p><div className="mini-benefits"><span><CheckCircle2/> Clear skill gaps</span><span><CheckCircle2/> Practical next steps</span></div></div>}</section></div></>
}

function RoadmapPage({tasks,refresh}:any){
 const [busy,setBusy]=useState<number|null>(null)
 async function update(t:Task,status:string){setBusy(t.id);try{await api.patch(`/api/roadmap/${t.id}`,{status});await refresh()}finally{setBusy(null)}}
 const done=tasks.filter((t:Task)=>t.status==='completed').length
 return <><PageHeading eyebrow="YOUR ACTION PLAN" title="Career roadmap" subtitle="Turn your skill gaps into manageable steps. Progress is built one task at a time."/><section className="panel roadmap-summary"><div><span className="eyebrow">ROADMAP PROGRESS</span><h2>{done} <small>/ {tasks.length} completed</small></h2><p>Every completed task is evidence of your growth.</p></div><div className="roadmap-progress"><div className="big-progress"><span style={{width:`${tasks.length?done/tasks.length*100:0}%`}}/></div><b>{tasks.length?Math.round(done/tasks.length*100):0}%</b></div></section>{tasks.length?<div className="roadmap-list">{tasks.map((t:Task,i:number)=><div className={`roadmap-item ${t.status}`} key={t.id}><div className="roadmap-index">{t.status==='completed'?<CheckCircle2/>:String(i+1).padStart(2,'0')}</div><div className="roadmap-task"><div className="roadmap-task-head"><div><span className="eyebrow">STEP {String(i+1).padStart(2,'0')}</span><h3>{t.title}</h3></div><span className={`status-pill ${t.status}`}>{t.status.replace('_',' ')}</span></div><p>{t.description}</p><div className="task-actions"><button className="btn btn-small btn-ghost" disabled={busy===t.id} onClick={()=>update(t,t.status==='completed'?'pending':t.status==='in_progress'?'completed':'in_progress')}>{busy===t.id?<LoaderCircle className="spin" size={14}/>:null}{t.status==='pending'?'Start task':t.status==='in_progress'?'Mark complete':'Reopen task'}</button></div></div></div>)}</div>:<div className="panel"><Empty icon={<RouteIcon/>} title="Your roadmap is ready to be created" text="Analyze a job description first, then generate a personalized plan." link="/analyzer" linkText="Analyze a role"/>}</div>}</>
}

function ProfilePage({user,refresh}:any){
 const [name,setName]=useState(user.name),[role,setRole]=useState(user.target_role),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{await api.put('/api/users/me',{name,target_role:role});await refresh();setMessage('Profile updated successfully.')}catch(e){setMessage(errorText(e))}finally{setBusy(false)}}
 return <><PageHeading eyebrow="PERSONAL DETAILS" title="My profile" subtitle="Keep your career direction and personal details up to date."/><div className="profile-layout"><div className="panel profile-card"><div className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</div><h2>{user.name}</h2><p>{user.target_role}</p><span className="profile-email">{user.email}</span><div className="profile-note"><Sparkles size={16}/> Your profile helps personalize your career workspace.</div></div><section className="panel profile-edit"><h3>Personal information</h3><p className="muted">Update the details associated with your account.</p><form className="form-stack" onSubmit={save}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} required minLength={2}/></label><label>Target career role<input value={role} onChange={e=>setRole(e.target.value)} required minLength={2}/></label><label>Email address<input value={user.email} disabled/></label>{message&&<div className="success-note">{message}</div>}<button className="btn btn-primary" disabled={busy}>{busy?<LoaderCircle className="spin"/>:null} Save changes</button></form></section></div></>
}
export default App
