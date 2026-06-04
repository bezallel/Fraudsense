/* BG CANVAS with colorful gradient orbs */
(function(){
  const cv=document.getElementById('bgc'),ctx=cv.getContext('2d');
  let W,H;
  const orbs=[
    {x:0.15,y:0.2,r:0.28,c:'rgba(94,231,200,0.07)',vx:0.0003,vy:0.0002},
    {x:0.8,y:0.15,r:0.32,c:'rgba(123,111,240,0.09)',vx:-0.0002,vy:0.0003},
    {x:0.5,y:0.75,r:0.35,c:'rgba(255,107,138,0.06)',vx:0.0002,vy:-0.0002},
    {x:0.9,y:0.8,r:0.22,c:'rgba(94,231,200,0.05)',vx:-0.0003,vy:-0.0002},
    {x:0.1,y:0.85,r:0.2,c:'rgba(255,203,107,0.05)',vx:0.0002,vy:0.0003},
  ];
  const pts=Array.from({length:36},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-0.5)*0.0003,vy:(Math.random()-0.5)*0.0003}));
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  function draw(){
    ctx.clearRect(0,0,W,H);
    orbs.forEach(o=>{
      o.x+=o.vx;o.y+=o.vy;
      if(o.x<0||o.x>1)o.vx*=-1;
      if(o.y<0||o.y>1)o.vy*=-1;
      const g=ctx.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r*Math.max(W,H));
      g.addColorStop(0,o.c);g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    });
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;});
    ctx.fillStyle='rgba(94,231,200,0.5)';
    pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x*W,p.y*H,1.2,0,Math.PI*2);ctx.fill();});
    ctx.lineWidth=0.5;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=(pts[i].x-pts[j].x)*W,dy=(pts[i].y-pts[j].y)*H,d=Math.sqrt(dx*dx+dy*dy);
      if(d<90){ctx.globalAlpha=(1-d/90)*0.2;ctx.strokeStyle='rgba(94,231,200,1)';ctx.beginPath();ctx.moveTo(pts[i].x*W,pts[i].y*H);ctx.lineTo(pts[j].x*W,pts[j].y*H);ctx.stroke();ctx.globalAlpha=1;}
    }
    requestAnimationFrame(draw);
  }
  resize();draw();
  window.addEventListener('resize',resize);
})();

/* FEED */
const FEED=[
  {t:'TRANSFER',a:'$181,000',s:'0.97',f:true},
  {t:'PAYMENT',a:'$9,840',s:'0.02',f:false},
  {t:'CASH_OUT',a:'$92,000',s:'0.94',f:true},
  {t:'PAYMENT',a:'$1,864',s:'0.01',f:false},
  {t:'TRANSFER',a:'$450,000',s:'0.99',f:true,al:true},
  {t:'DEBIT',a:'$340',s:'0.00',f:false},
  {t:'CASH_OUT',a:'$67,200',s:'0.88',f:true},
  {t:'PAYMENT',a:'$5,200',s:'0.03',f:false},
  {t:'TRANSFER',a:'$23,100',s:'0.91',f:true},
  {t:'PAYMENT',a:'$780',s:'0.01',f:false},
  {t:'CASH_OUT',a:'$130,000',s:'0.96',f:true,al:true},
  {t:'DEBIT',a:'$2,100',s:'0.00',f:false},
];
(function(){
  const rows=[...FEED,...FEED];
  document.getElementById('feed-inner').innerHTML=rows.map(d=>`<div class="fi"><div class="fd ${d.al?'alert':d.f?'fraud':'clean'}"></div><span class="ft">${d.t}</span><span class="fa ${d.f?'fraud':'clean'}">${d.a}</span><span class="fs ${d.f?'fraud':'clean'}">${d.s}</span></div>`).join('');
})();

/* INTRO */
const HEADING="Welcome to FraudSense.\nHeres how it works.";
function typeIt(el,text,cb){
  let i=0;
  function tick(){el.innerHTML=text.slice(0,i).replace(/\n/g,'<br>')+'<span class="cursor"></span>';if(i<text.length){i++;setTimeout(tick,30+Math.random()*14);}else if(cb)setTimeout(cb,200);}
  tick();
}
setTimeout(()=>{
  typeIt(document.getElementById('typed'),HEADING,()=>{
    document.getElementById('isub').classList.add('show');
    document.getElementById('isteps').classList.add('show');
    setTimeout(()=>{document.getElementById('inote').classList.add('show');setTimeout(()=>document.getElementById('ibtn').classList.add('show'),250);},400);
  });
},280);
function closeIntro(){
  const el=document.getElementById('intro');el.classList.add('out');
  setTimeout(()=>{el.style.display='none';setTimeout(startPreTour,360);},530);
}

/* SCENARIOS */
function loadScenario(id){
  const s={f1:{t:'TRANSFER',a:181000,ob:181000,oa:0,db:0},f2:{t:'CASH_OUT',a:92000,ob:92000,oa:0,db:0},l1:{t:'PAYMENT',a:9840,ob:170136,oa:160296,db:2500}}[id];
  if(!s)return;
  document.getElementById('txtype').value=s.t;
  document.getElementById('amount').value=s.a;
  document.getElementById('ob').value=s.ob;
  document.getElementById('oa').value=s.oa;
  document.getElementById('db').value=s.db;
}
function resetInputs(){
  document.getElementById('txtype').value='TRANSFER';
  ['amount','ob','oa','db'].forEach(id=>document.getElementById(id).value='');
}

/* SCORE */
function calcScore(type,amount,ob,oa,db){
  if(type==='PAYMENT'||type==='DEBIT')return{p:+(Math.random()*0.04).toFixed(3),fraud:false};
  let s=0;
  const drain=ob>0?amount/ob:0;
  s+=drain>0.95?0.38:drain>0.7?0.2:0.05;
  s+=Math.abs(ob-oa-amount)<1?0.2:0.04;
  s+=oa===0?0.14:0;
  s+=db===0?0.1:0.02;
  s+=type==='TRANSFER'?0.04:0.03;
  s=Math.min(s+Math.random()*0.04-0.02,0.999);
  return{p:+Math.max(s,0.01).toFixed(3),fraud:s>=0.5};
}

/* TYPOLOGY */
function getTypo(type,drain,db,fraud){
  if(!fraud)return null;
  if(type==='TRANSFER'&&drain>90&&db===0)return{
    k:'ato',
    name:'Account Takeover',
    fatf:'FATF Financial Crime Typology',
    desc:"Someone gained access to this account without the owner knowing and immediately moved all the money out. This is called an Account Takeover (ATO): a fraudster gets in, empties the account in one move, and disappears before the real owner notices anything is wrong.",
    sigs:[
      'Full account drain (everything sent at once)',
      'Recipient had no prior balance (likely a throwaway account)',
      'Single exit transaction (in and out, no back and forth)',
    ],
    badge:'Account Takeover'
  };
  if(type==='CASH_OUT'&&drain>70)return{
    k:'co',
    name:'Illicit Cash Conversion',
    fatf:'FATF Financial Crime Typology',
    desc:"A large portion of this account is being converted to cash quickly. This is a common first step in money laundering called Placement, where illegally obtained money is introduced into the financial system and immediately pulled out as cash to make it harder to trace.",
    sigs:[
      'High drain ratio (most of the balance sent)',
      'CASH_OUT used as exit method',
      'Rapid cash extraction pattern',
    ],
    badge:'Illicit Cash-Out'
  };
  if(type==='TRANSFER'&&db===0)return{
    k:'lay',
    name:'Layering via Mule Account',
    fatf:'FATF Financial Crime Typology',
    desc:"The recipient account had no money in it before this transfer arrived. This is a strong sign of a mule account, which is a bank account opened or taken over by criminals specifically to receive stolen funds and pass them on quickly. The goal is to put distance between the money and its original source, a process known as Layering.",
    sigs:[
      'Recipient balance was zero (no legitimate account history)',
      'Mule account pattern (account exists only to receive and move funds)',
      'Layering stage (money being shuffled to hide its origin)',
    ],
    badge:'Layering'
  };
  return{
    k:'ato',
    name:'Suspicious Movement',
    fatf:'FATF General Fraud Indicators',
    desc:"This transaction matches several patterns the model associates with fraud. The balance movement is unusual and the transaction type is one the model has learned to watch closely.",
    sigs:[
      'High fraud probability score',
      'Unusual balance movement detected',
    ],
    badge:'Suspicious'
  };
}

let lastState={};

/* ANALYSIS */
async function runAnalysis(){
  const btn=document.getElementById('rbtn');
  btn.classList.add('busy');
  btn.innerHTML='Analysing<span class="ldots"><span class="ld"></span><span class="ld"></span><span class="ld"></span></span>';

  const type  = document.getElementById('txtype').value;
  const amount= parseFloat(document.getElementById('amount').value)||0;
  const ob    = parseFloat(document.getElementById('ob').value)||0;
  const oa    = parseFloat(document.getElementById('oa').value)||0;
  const db    = parseFloat(document.getElementById('db').value)||0;

  let p, fraud;
  try {
    const resp = await fetch('/predict', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        type,
        amount,
        oldBalanceOrig: ob,
        newBalanceOrig: oa,
        oldBalanceDest: db,
      })
    });
    if(!resp.ok) throw new Error('Server error '+resp.status);
    const result = await resp.json();
    p     = result.probability;
    fraud = result.fraud;
  } catch(err){
    btn.classList.remove('busy');
    btn.textContent='Analyse transaction';
    alert('Could not reach the model. Make sure the Flask server is running.');
    return;
  }

  btn.classList.remove('busy');
  btn.textContent='Analyse transaction';

  const pct   = Math.round(p*100);
  const drain = ob>0?Math.round((amount/ob)*100):0;
  const origD = Math.abs(ob-oa-amount);
  lastState   = {type,amount,ob,oa,db,pct,drain,origD,fraud};

  document.getElementById('idle').style.display='none';
  const res=document.getElementById('results');res.style.display='flex';

  const v=document.getElementById('verd');
  v.className='verd '+(fraud?'bad':'ok');
  document.getElementById('vdot').className='vdot '+(fraud?'bad':'ok');
  document.getElementById('vname').textContent=fraud?'Flag for review':'Looks clean';
  document.getElementById('vsub').textContent=(fraud?'High fraud probability · ':'Low risk · ')+type;
  const vp=document.getElementById('vpct');
  vp.className='vpct '+(fraud?'bad':'ok');vp.textContent=pct+'%';
  document.getElementById('ppct').textContent=pct+'%';

  const bf=document.getElementById('bfill');
  bf.style.width='0%';bf.style.background=fraud?'#ff6b8a':'#5ee7c8';
  setTimeout(()=>{bf.style.width=pct+'%';},80);

  document.getElementById('sgrid').innerHTML=[
    {l:'How much was drained',v:drain+'% of balance sent',c:drain>90?'r':drain>50?'a':'g'},
    {l:'Balance adds up',v:origD<1?'Exact to the cent (suspicious)':'Looks normal',c:origD<1?'r':'g'},
    {l:'Recipient had money before',v:db===0?'No — throwaway account risk':'Yes — looks normal',c:db===0?'a':'g'},
    {l:'Transaction type risk',v:(type==='TRANSFER'||type==='CASH_OUT')?'High risk type':'Low risk type',c:(type==='TRANSFER'||type==='CASH_OUT')?'a':'g'}
  ].map(s=>`<div class="sig"><div class="sigl">${s.l}</div><div class="sigv ${s.c}">${s.v}</div></div>`).join('');

  const typo=getTypo(type,drain,db,fraud);
  const tc=document.getElementById('tcard');
  if(typo){
    tc.className='tcard show '+typo.k;
    document.getElementById('tname').textContent=typo.name;
    document.getElementById('tfatf').textContent=typo.fatf;
    document.getElementById('tdesc').textContent=typo.desc;
    document.getElementById('tbadge').textContent=typo.badge;
    document.getElementById('tbadge').className='tbadge '+typo.k;
    document.getElementById('tsigs').innerHTML=typo.sigs.map(s=>`<span class="tsig">${s}</span>`).join('');
  } else {tc.className='tcard';}

  document.getElementById('reasons').innerHTML=(fraud?[
    {t:`The sender sent ${drain}% of their entire balance in a single transaction. Most people do not send everything they have at once.`,c:'r'},
    {t:origD<1?'The amount sent matched the sender balance to the exact cent. That kind of precision is rare in normal transactions and common in automated fraud scripts.':'The numbers do not add up cleanly between what was sent and what was left behind.',c:origD<1?'r':'n'},
    {t:db===0?'The recipient account had zero money in it before this transfer arrived. Legitimate accounts usually have some history. An empty account waiting to receive funds is a warning sign.':'The recipient account looked normal before this transaction.',c:db===0?'a':'g'},
    {t:type+' is the only transaction type in this dataset where fraud consistently appears. The model has learned to treat it as high risk.',c:'a'}
  ]:[
    {t:`Only ${drain}% of the sender balance was used. There is no sign of the account being emptied.`,c:'g'},
    {t:type+' transactions almost never appear as fraud across the full training dataset.',c:'g'},
    {t:'The balance movement on both sides of this transaction looks normal and expected.',c:'g'}
  ]).map(r=>`<div class="ri"><div class="rdot ${r.c}"></div><div class="rtxt">${r.t}</div></div>`).join('');

  const sb=document.getElementById('sarbtn');
  fraud?sb.classList.add('show'):sb.classList.remove('show');
  resetInputs();
  setTimeout(()=>startPostTour(),500);
}

/* SAR */
function openSAR(){
  const s=lastState;
  const ref='SAR-'+Date.now().toString().slice(-8);
  const today=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  document.getElementById('sarmeta').innerHTML=[
    {l:'Reference',v:ref},{l:'Date',v:today},
    {l:'Type',v:s.type},{l:'Amount',v:'$'+s.amount.toLocaleString()},
    {l:'Fraud score',v:s.pct+'%'},{l:'Risk level',v:s.pct>85?'Critical':s.pct>65?'High':'Medium'}
  ].map(m=>`<div class="sarmi"><div class="sarml">${m.l}</div><div class="sarmv">${m.v}</div></div>`).join('');
  document.getElementById('sarnar').textContent=`On ${today}, a ${s.type} transaction of $${s.amount.toLocaleString()} was flagged by the automated monitoring system with a fraud probability of ${s.pct}%. The sender held $${s.ob.toLocaleString()} before the transaction and $${s.oa.toLocaleString()} after, meaning ${s.drain}% of their balance was sent in a single move. The recipient held $${s.db.toLocaleString()} before receiving the funds. The transaction pattern is consistent with ${s.drain>90&&s.db===0?'an account takeover where a fraudster accessed the account without permission and emptied it, sending funds to a throwaway recipient account with no prior balance':s.type==='CASH_OUT'?'illicit cash conversion, where funds are rapidly withdrawn as cash to make them harder to trace':'suspicious fund movement that requires further investigation'}. This case has been escalated for analyst review.`;
  document.getElementById('sarflags').innerHTML=[
    s.drain>90?`${s.drain}% of the sender balance was sent in a single transaction. This level of account drainage in one move is a strong indicator of account takeover.`:null,
    s.origD<1?'The transaction amount matched the sender pre-transaction balance to the exact cent. Normal transactions rarely align this precisely. This is a pattern commonly seen in automated fraud.':null,
    s.db===0?'The recipient account held zero funds before this transfer. This is consistent with a mule account, an account set up or taken over by criminals specifically to receive and quickly move stolen funds.':null,
    `${s.type} is a transaction type that consistently appears in fraud cases within this dataset and is treated as high risk by the model.`,
    `The model returned a fraud confidence score of ${s.pct}%, which exceeds the threshold required to escalate for human review.`
  ].filter(Boolean).map(f=>`<div class="sarflag">${f}</div>`).join('');
  document.getElementById('sar-modal').classList.add('show');
}
function closeSAR(){document.getElementById('sar-modal').classList.remove('show');}
document.getElementById('sar-modal').addEventListener('click',function(e){if(e.target===this)closeSAR();});

/* COACH -- positions card AWAY from inputs, always on right panel or above */
const PRE=[
  {tag:'Step 1 of 5',title:'Welcome',body:"This is a live fraud detection model. It reads transaction data and tells you whether something looks suspicious. Walk through in about a minute.",target:'topbar',pos:'bc',total:5},
  {tag:'Step 2 of 5',title:'The live feed',body:"Transactions are being screened in real time up there. Red dots are flagged. Green ones are clean. The numbers are their fraud scores.",target:'feed-strip',pos:'bc',total:5},
  {tag:'Step 3 of 5',title:'Transaction type',body:"TRANSFER and CASH_OUT are the only types where fraud ever shows up. PAYMENT and DEBIT come back clean every time. The model figured that out on its own.",target:'f-type',pos:'rp',total:5},
  {tag:'Step 4 of 5',title:'The balance fields',body:"The model does not just look at the amount. It looks at what was left behind. A sender who sends everything they have and ends up at zero is a strong fraud signal.",target:'f-ob',pos:'rp',total:5},
  {tag:'Step 5 of 5',title:'Try a scenario',body:"Load one of the pre-built transactions below the form, or enter your own values. Hit Analyse and see what the model finds.",target:'rbtn',pos:'rp',total:5}
];
const POST=[
  {tag:'Insight 1 of 4',title:'The fraud score',body:"The model gives every transaction a probability between 0 and 1. Anything above 0.5 gets flagged. This one scored 0.998 on the accuracy test, which means it almost never gets it wrong.",target:'pcard',pos:'lp',total:4},
  {tag:'Insight 2 of 4',title:'What type of fraud is it',body:"Flagging a transaction is just the start. The model also identifies what kind of fraud it looks like: an account takeover (someone breaking in and emptying it), layering (shuffling stolen money through throwaway accounts), or cash conversion (quickly turning funds to cash). This matters because each type gets investigated differently.",target:'tcard',pos:'lp',total:4},
  {tag:'Insight 3 of 4',title:'Why the model flagged it',body:"This section breaks down exactly which signals triggered the flag. Each one maps to a real fraud behaviour pattern.",target:'rcard',pos:'lp',total:4},
  {tag:'Insight 4 of 4',title:'The SAR draft',body:"A Suspicious Activity Report is what gets filed with regulators after a flag. Click the button below to see a pre-filled draft based on this transaction.",target:'sarbtn',pos:'lp',total:4}
];

let cStep=0,cPost=false;

function buildDots(total,active){
  const c=document.getElementById('cdots');c.innerHTML='';
  for(let i=0;i<total;i++){const d=document.createElement('div');d.className='cdot'+(i===active?' on':'');c.appendChild(d);}
}

function posCoach(tid,pos){
  const card=document.getElementById('ccard'),ring=document.getElementById('cring');
  const tel=document.getElementById(tid);
  if(!tel){card.style.cssText='position:fixed;top:80px;left:50%;transform:translateX(-50%);width:218px';return;}
  const r=tel.getBoundingClientRect();
  const vw=window.innerWidth,vh=window.innerHeight;
  const bw=Math.min(218,vw*0.56);
  const bh=180; // approx card height

  ring.style.cssText=`position:fixed;top:${r.top-4}px;left:${r.left-4}px;width:${r.width+8}px;height:${r.height+8}px;`;
  ring.classList.add('on');

  let top,left;

  if(pos==='bc'){
    // below center of target
    top=r.bottom+10;
    left=r.left+r.width/2-bw/2;
  } else if(pos==='rp'){
    // place on RIGHT PANEL side, vertically aligned with target
    // find right panel
    const rp=document.getElementById('panel-r');
    if(rp){
      const rpr=rp.getBoundingClientRect();
      left=rpr.left+12;
      top=r.top;
    } else {
      left=r.right+14;top=r.top;
    }
  } else if(pos==='lp'){
    // place on LEFT PANEL side
    const lp=document.getElementById('panel-l');
    if(lp){
      const lpr=lp.getBoundingClientRect();
      left=lpr.left+12;
      top=r.top;
    } else {
      left=r.left-bw-14;top=r.top;
    }
  } else {
    left=r.right+14;top=r.top;
  }

  // clamp within viewport
  left=Math.max(6,Math.min(left,vw-bw-6));
  top=Math.max(60,Math.min(top,vh-bh-10));

  card.style.cssText=`position:fixed;top:${top}px;left:${left}px;transform:none;width:${bw}px;`;
}

function showStep(idx,post){
  const steps=post?POST:PRE;
  if(idx>=steps.length){endTour();return;}
  const s=steps[idx];
  document.getElementById('ctag').textContent=s.tag;
  document.getElementById('ctitle').textContent=s.title;
  document.getElementById('cbody').textContent=s.body;
  document.getElementById('cnext').textContent=idx===steps.length-1?(post?'Done':'Got it'):'Next';
  buildDots(s.total,idx);
  const card=document.getElementById('ccard');
  card.classList.remove('on');document.getElementById('cring').classList.remove('on');
  setTimeout(()=>{posCoach(s.target,s.pos);card.classList.add('on');},70);
}

function nextStep(){cStep++;showStep(cStep,cPost);}
function endTour(){document.getElementById('ccard').classList.remove('on');document.getElementById('cring').classList.remove('on');}
function startPreTour(){cPost=false;cStep=0;showStep(0,false);}
function startPostTour(){cPost=true;cStep=0;showStep(0,true);}
