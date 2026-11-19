/* Shared Bonnie progress for all stations. No storage or network requests. */
(function(){
 'use strict';
 window.BonnieProgress={create:function(options){
  const topics=options.topics.map(t=>({key:String(t.key),title:t.title,count:t.count}));
  const seen=new Set(),total=topics.reduce((sum,t)=>sum+t.count,0);
  const root=document.querySelector('#bonnieProgress'),button=document.querySelector('#bonnie');
  const totalText=root.querySelector('[data-bonnie-total]'),currentText=root.querySelector('[data-bonnie-current]');
  const bar=root.querySelector('[data-bonnie-bar]'),list=root.querySelector('[data-bonnie-list]');
  const buttonText=button.querySelector('small'),badge=button.querySelector('b');
  let current=null;
  const rows=new Map();
  function countFor(key){const t=topics.find(t=>t.key===String(key));if(!t)return 0;let count=0;for(let i=0;i<t.count;i++)if(seen.has(t.key+':'+i))count++;return count;}
  topics.forEach(t=>{
   const li=document.createElement('li'),link=document.createElement('button'),name=document.createElement('span'),count=document.createElement('span');
   link.type='button';name.textContent=t.title;link.append(name,count);li.append(link);list.append(li);rows.set(t.key,{link,count});
   link.onclick=()=>{root.querySelector('details').open=false;options.navigate(t.key);};
  });
  function refresh(){
   const t=topics.find(t=>t.key===current),remaining=t?t.count-countFor(t.key):0;
   totalText.textContent=seen.size===total?'Alle Bonnie-Hinweise gelesen ✓':'Bonnies Hinweise: '+seen.size+' von '+total+' gelesen';
   bar.style.width=(total?seen.size/total*100:100)+'%';
   bar.parentElement.setAttribute('aria-valuenow',String(seen.size));
   bar.parentElement.setAttribute('aria-valuemax',String(total));
   currentText.textContent=t?t.title+': '+(remaining?remaining+' von '+t.count+' Hinweisen noch offen':'alle '+t.count+' Hinweise gelesen ✓'):'Wähle einen Inhalt.';
   buttonText.textContent=t?(remaining?'Hier noch '+remaining+' neue'+(remaining===1?'r Hinweis':' Hinweise'):'Alle Hinweise hier gelesen ✓'):'Hinweise zur aktuellen Ansicht';
   badge.textContent=remaining?String(remaining):'✓';
   button.classList.toggle('has-new',remaining>0);
   button.setAttribute('aria-label','Frag Bonnie'+(t?' zu '+t.title:'')+'. '+remaining+' Hinweise hier noch offen. Insgesamt '+seen.size+' von '+total+' gelesen.');
   topics.forEach(topic=>{const row=rows.get(topic.key),read=countFor(topic.key),left=topic.count-read;row.count.textContent=left?read+' / '+topic.count+' gelesen · '+left+' offen':'✓ '+topic.count+' / '+topic.count+' gelesen';row.link.classList.toggle('all-read',left===0);if(topic.key===current)row.link.setAttribute('aria-current','true');else row.link.removeAttribute('aria-current');});
   if(!remaining)button.classList.remove('bonnie-nudge');
  }
  function setContext(key){
   key=String(key);if(!topics.some(t=>t.key===key))return;
   const changed=current!==key;current=key;refresh();
   if(changed&&countFor(key)<topics.find(t=>t.key===key).count&&document.querySelector('#chat').hidden){button.classList.remove('bonnie-nudge');void button.offsetWidth;button.classList.add('bonnie-nudge');}
  }
  function displayed(key,index){key=String(key);const t=topics.find(t=>t.key===key);if(!t||!Number.isInteger(index)||index<0||index>=t.count)return;seen.add(key+':'+index);refresh();}
  refresh();
  return {setContext,displayed,getProgress:function(){return {read:seen.size,total,current,remaining:total-seen.size};}};
 }};
})();