import './style.css'
const NAV=[
 {id:'index',href:'index.html',label:'Главная'},
 {id:'ugrozy',href:'ugrozy.html',label:'Угрозы'},
 {id:'konstrukcii',href:'konstrukcii.html',label:'Конструкции'},
 {id:'princip',href:'princip.html',label:'Принцип'},
 {id:'proektirovanie',href:'proektirovanie.html',label:'Проектирование'},
 {id:'primenenie',href:'primenenie.html',label:'Применение'},
 {id:'montazh',href:'montazh.html',label:'Монтаж'},
 {id:'kompleksnaya',href:'kompleksnaya.html',label:'Комплекс'},
]
const L='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12 3l7 3v5.2c0 4.6-3 8.1-7 9.8-4-1.7-7-5.2-7-9.8V6l7-3z"/><path d="M9 12l2 2 4-4.5"/></svg>'
const B='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
const X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5"><path d="M6 6l12 12M18 6L6 18"/></svg>'
function cur(){
 const p=location.pathname.replace(/\/+$/,'')
 const f=p.split('/').pop()||'index.html'
 const found=NAV.find(n=>n.href===f)
 return found?found.id:'index'
}
function header(){
 const a=cur()
 const d=NAV.map(n=>{
  const c=n.id===a?'bg-olive-700 text-white':'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  return '<a href="'+n.href+'" class="rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition '+c+'">'+n.label+'</a>'
 }).join('')
 const m=NAV.map(n=>{
  const c=n.id===a?'bg-olive-50 text-olive-800 border border-olive-200':'text-stone-600 hover:bg-stone-100'
  return '<a href="'+n.href+'" class="rounded-xl px-3 py-2.5 text-sm font-medium '+c+'">'+n.label+'</a>'
 }).join('')
 const el=document.getElementById('site-header')
 if(!el) return
 el.innerHTML='<header class="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur"><div class="wrap flex h-[68px] items-center justify-between gap-4"><a href="index.html" class="flex items-center gap-3"><span class="grid h-9 w-9 place-items-center rounded-xl bg-olive-700 text-white">'+L+'</span><span class="leading-tight"><span class="block text-[15px] font-extrabold tracking-tight text-stone-900">БАСТИОН &middot; ЗОК</span><span class="block text-[10px] font-semibold uppercase tracking-[0.16em] text-olive-600">Защита от БПЛА</span></span></a><nav class="hidden items-center gap-1 xl:flex">'+d+'</nav><div class="flex items-center gap-2"><a href="tel:+78005506469" class="hidden text-sm font-semibold text-stone-600 hover:text-stone-900 lg:inline">8 800 550-64-69</a><a href="index.html#cta" class="btn btn-primary hidden lg:inline-flex !px-5 !py-2.5">Получить расчёт</a><button id="menu-btn" type="button" aria-label="Меню" aria-expanded="false" class="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 xl:hidden">'+B+'</button></div></div><div id="mobile-menu" class="hidden border-t border-stone-200 bg-white xl:hidden"><nav class="wrap flex flex-col gap-1 py-4">'+m+'</nav></div></header>'
}
function footer(){
 const el=document.getElementById('site-footer')
 if(!el) return
 const c1=NAV.slice(0,4).map(n=>'<a href="'+n.href+'" class="hover:text-olive-700">'+n.label+'</a>').join('')
 const c2=NAV.slice(4).map(n=>'<a href="'+n.href+'" class="hover:text-olive-700">'+n.label+'</a>').join('')
 el.innerHTML='<footer class="border-t border-stone-200 bg-white"><div class="wrap grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4"><div class="lg:col-span-2"><a href="index.html" class="flex items-center gap-3"><span class="grid h-9 w-9 place-items-center rounded-xl bg-olive-700 text-white">'+L+'</span><span class="text-[15px] font-extrabold tracking-tight text-stone-900">БАСТИОН &middot; ЗОК</span></a><p class="mt-4 max-w-md text-sm leading-relaxed text-stone-500">Проектируем, рассчитываем, изготавливаем и монтируем защитные ограждающие конструкции от БПЛА. Пассивный рубеж для кровель, фасадов и критических узлов — по СП 542.1325800.2024.</p><div class="mt-5 flex flex-wrap gap-2 text-xs"><span class="chip">СП 542.1325800.2024</span><span class="chip">От обследования до сдачи</span></div></div><div><p class="text-xs font-bold uppercase tracking-wider text-stone-400">Разделы</p><nav class="mt-4 flex flex-col gap-2.5 text-sm text-stone-600">'+c1+'</nav></div><div><p class="text-xs font-bold uppercase tracking-wider text-stone-400">Ещё</p><nav class="mt-4 flex flex-col gap-2.5 text-sm text-stone-600">'+c2+'<a href="index.html#cta" class="hover:text-olive-700">Получить расчёт</a></nav></div></div><div class="border-t border-stone-200"><div class="wrap flex flex-col gap-2 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between"><p>&copy; 2026 БАСТИОН &middot; ЗОК. Демонстрационный лендинг.</p><p>Не является рабочей документацией.</p></div></div></footer>'
}
function menu(){
 const b=document.getElementById('menu-btn')
 const mm=document.getElementById('mobile-menu')
 if(!b||!mm) return
 let o=false
 b.addEventListener('click',()=>{
  o=!o;mm.classList.toggle('hidden',!o)
  b.setAttribute('aria-expanded',String(o))
  b.innerHTML=o?X:B
 })
}
function reveal(){
 const els=document.querySelectorAll('.reveal')
 if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('is-visible'));return}
 const io=new IntersectionObserver(ents=>{
  for(const e of ents) if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}
 },{threshold:0.12,rootMargin:'0px 0px -40px 0px'})
 els.forEach(e=>io.observe(e))
}
function form(){
 const f=document.getElementById('lead-form')
 if(!f) return
 f.addEventListener('submit',e=>{
  e.preventDefault()
  const s=document.getElementById('form-status')
  if(s){s.textContent='Спасибо! Заявка принята (демо). Мы свяжемся для уточнения исходных данных.';s.className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800';s.classList.remove('hidden')}
  f.reset()
 })
}
header();footer();menu();reveal();form()

