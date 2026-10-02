(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* NAV: transparent -> glass */
  var nav=$('#nav');
  function navState(){nav.classList.toggle('scrolled',scrollY>40)}
  addEventListener('scroll',navState,{passive:true});navState();
  var burger=$('#burger'),mob=$('#mobile');
  function setMenu(o){mob.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':'';
    burger.firstElementChild.firstElementChild.setAttribute('href',o?'#i-x':'#i-menu');nav.classList.toggle('scrolled',o||scrollY>40)}
  burger.addEventListener('click',function(){setMenu(!mob.classList.contains('open'))});
  $$('a',mob).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  /* active link */
  var links={};$$('.links a').forEach(function(a){links[a.dataset.s]=a});
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
    Object.keys(links).forEach(function(k){links[k].classList.toggle('active',k===en.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
  ['home','about','products','gallery','contact'].forEach(function(id){var el=document.getElementById(id);el&&io.observe(el)});

  /* HERO: frame scrub */
  var N=240,FR=[];for(var q=1;q<=N;q++)FR.push('frames/frame-'+('00'+q).slice(-3)+'.jpg');
  var cv=$('#cv'),ctx=cv.getContext('2d',{alpha:false}),imgs=new Array(N),hero=$('#home');
  var b1=$('#b1'),b2=$('#b2'),cue=$('#cue'),fb=$('#fb'),prog=$('#prog');
  var CX=.022,CY=.026,cur=0,target=0,last=-1,p=0;
  function size(){
    var d=Math.min(devicePixelRatio||1,4),w=Math.round(innerWidth*d),h=Math.round(innerHeight*d),m=Math.max(w,h);
    if(m>7680){var k=7680/m;w=Math.round(w*k);h=Math.round(h*k)}
    cv.width=w;cv.height=h;draw(true)}
  function draw(force){
    var i=Math.max(0,Math.min(N-1,Math.round(cur)));
    if(i===last&&!force)return;
    var im=imgs[i];
    if(!im||!im.complete){for(var j=1;j<N&&!im;j++){var a=imgs[i-j],b=imgs[i+j];if(a&&a.complete)im=a;else if(b&&b.complete)im=b}}
    if(!im)return;last=i;
    var sw=im.naturalWidth*(1-CX),sh=im.naturalHeight*(1-CY),s=Math.max(cv.width/sw,cv.height/sh),dw=sw*s,dh=sh*s;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(im,0,0,sw,sh,(cv.width-dw)/2,(cv.height-dh)/2,dw,dh)}
  function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
  function range(x,a,b){return clamp((x-a)/(b-a),0,1)}
  function readScroll(){
    var r=hero.getBoundingClientRect(),max=hero.offsetHeight-innerHeight;
    p=clamp(-r.top/max,0,1);target=p*(N-1);
    var o1=1-range(p,.03,.15);
    b1.style.opacity=o1;b1.style.transform='translateY('+(-(1-o1)*40)+'px)';b1.style.visibility=o1<=0?'hidden':'visible';
    var o2=range(p,.84,.93);b2.style.opacity=o2;b2.style.transform='translateY('+((1-o2)*30)+'px)';b2.style.visibility=o2<=0?'hidden':'visible';
    b2.firstElementChild.style.pointerEvents=o2>.5?'auto':'none';
    cue.style.opacity=1-range(p,.01,.05);
    fb.style.opacity=range(p,.9,1);
    prog.style.transform='scaleY('+p+')'}
  function loop(){
    var k=reduce?1:.14;cur+=(target-cur)*k;if(Math.abs(target-cur)<.01)cur=target;
    draw(false);requestAnimationFrame(loop)}
  FR.forEach(function(b,i){var im=new Image();im.decoding='async';im.onload=function(){if(i===Math.round(cur))draw(true)};im.src=b;imgs[i]=im});
  addEventListener('scroll',readScroll,{passive:true});
  addEventListener('resize',function(){size();readScroll()});
  size();readScroll();loop();

  /* reveal + counters */
  var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{threshold:.12});
  $$('.rv').forEach(function(el){rio.observe(el)});
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=+el.dataset.count,suf=el.dataset.suffix||'',t0=performance.now(),dur=1400;
    (function step(t){var q=clamp((t-t0)/dur,0,1),v=Math.round(to*(1-Math.pow(1-q,3)));el.textContent=v+suf;if(q<1&&!reduce)requestAnimationFrame(step);else el.textContent=to+suf})(t0)})},{threshold:.6});
  $$('[data-count]').forEach(function(el){cio.observe(el)});

  /* products: filter + cart */
  var chips=$$('.chip'),prods=$$('.prod');
  chips.forEach(function(c){c.addEventListener('click',function(){
    chips.forEach(function(x){x.setAttribute('aria-pressed',x===c)});
    var f=c.dataset.f;prods.forEach(function(pr){var show=f==='all'||pr.dataset.t===f;pr.classList.toggle('hide',!show);if(show)pr.classList.add('in')})})});
  var n=0,cartN=$('#cartN'),toast=$('#toast'),tt=$('#toastT'),tm;
  function say(m){tt.textContent=m;toast.classList.add('on');clearTimeout(tm);tm=setTimeout(function(){toast.classList.remove('on')},2400)}
  $$('[data-add]').forEach(function(b){b.addEventListener('click',function(){n++;cartN.textContent=n;cartN.classList.add('on');say(b.dataset.add+' added to your cart')})});

  /* gallery lightbox */
  var lb=$('#lb'),lbi=$('#lbi'),lbc=$('#lbc');
  $$('.tile').forEach(function(t){t.addEventListener('click',function(){lbi.src=t.dataset.lb;lbi.alt=t.dataset.cap;lbc.textContent=t.dataset.cap;
    if(lb.showModal)lb.showModal();else lb.setAttribute('open','')})});
  $('#lbx').addEventListener('click',function(){lb.close()});
  lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});

  /* contact form */
  var form=$('#form');
  function valid(el){var v=el.value.trim();return el.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v):v.length>(el.tagName==='TEXTAREA'?4:1)}
  $$('input,textarea',form).forEach(function(el){el.addEventListener('input',function(){if(el.parentNode.classList.contains('err')&&valid(el))el.parentNode.classList.remove('err')})});
  var box=$('#formBox'),btn=$('#sendBtn'),btnTxt=btn.querySelector('span'),okMsg=$('#okMsg'),busy=false;
  form.addEventListener('submit',function(e){
    e.preventDefault();if(busy)return;
    var ok=true,first;
    $$('input,textarea',form).forEach(function(el){var g=valid(el);el.parentNode.classList.toggle('err',!g);if(!g){ok=false;first=first||el}});
    if(!ok){first.focus();return}
    busy=true;btn.disabled=true;btn.style.opacity='.75';btnTxt.textContent='Sending…';
    var name=form.elements.name.value.trim().split(' ')[0];
    /* TODO: replace this timeout with a real request, e.g.
       fetch('/api/contact',{method:'POST',body:new FormData(form)}).then(showSuccess) */
    setTimeout(function(){
      okMsg.textContent='Thank you, '+name+' — your message has been received and we\'ll be in touch soon.';
      box.classList.add('sent');form.reset();say('Successfully submitted!');
      busy=false;btn.disabled=false;btn.style.opacity='';btnTxt.textContent='Send Message';
      $('#okBox').setAttribute('tabindex','-1');$('#okBox').focus({preventScroll:true});
    },900)});
  $('#again').addEventListener('click',function(){box.classList.remove('sent');form.elements.name.focus()});
  $('#yr').textContent=new Date().getFullYear();
})();
