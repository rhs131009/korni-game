'use strict';
const $=id=>document.getElementById(id);
const names={check:'Проверяемая гласная',alternate:'Чередование в корне',dict:'Словарное слово'};
let saved={};try{saved=JSON.parse(localStorage.getItem('korni-v1')||'{}')}catch{}
let total=Number(saved.total)||0,correct=Number(saved.correct)||0,errors=new Set(Array.isArray(saved.errors)?saved.errors:[]),queue=[],current=null,locked=false;
const key=x=>x.word+':'+x.index;
function save(){try{localStorage.setItem('korni-v1',JSON.stringify({total,correct,errors:[...errors]}))}catch{}stats()}
function stats(){$('total').textContent=total;$('correct').textContent=correct;$('accuracy').textContent=(total?Math.round(correct/total*100):0)+'%';$('errorTitle').textContent='Слова для повторения · '+errors.size;$('errorList').textContent=BANK.filter(x=>errors.has(key(x))).map(x=>x.word).join(', ')||'Пока пусто. Ошибки будут появляться здесь.'}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pool(){let m=$('mode').value;return BANK.filter(x=>m==='all'||(m==='errors'?errors.has(key(x)):x.cat===m))}
function start(){queue=shuffle(pool().slice());next()}
function next(){locked=false;$('feedback').textContent='';$('next').hidden=true;$('answers').replaceChildren();
if(!queue.length){queue=shuffle(pool().slice());if(queue.length&&current&&queue.length>1&&key(queue[0])===key(current))[queue[0],queue[1]]=[queue[1],queue[0]]}
if(!queue.length){current=null;$('word').textContent='Ошибок нет';$('hint').textContent='Выбери другую тему, чтобы продолжить.';$('category').textContent='Повторение';$('progress').textContent='';return}
current=queue.shift();let p=pool().length;$('progress').textContent=p+' заданий в теме';$('category').textContent=names[current.cat];$('hint').textContent=current.hint||'Выбери пропущенную букву';
let pre=document.createTextNode(current.word.slice(0,current.index)),gap=document.createElement('span');gap.className='gap';gap.textContent='·';$('word').replaceChildren(pre,gap,document.createTextNode(current.word.slice(current.index+1)));
let chars=['а','о','е','и'];if(!chars.includes(current.answer))chars.push(current.answer);for(let char of chars){let b=document.createElement('button');b.textContent=char;b.setAttribute('aria-label','Вставить '+char);b.onclick=()=>answer(char);$('answers').append(b)}}
function answer(char){if(locked||!current)return;locked=true;total++;let ok=char===current.answer;if(ok){correct++;errors.delete(key(current))}else errors.add(key(current));
for(let b of $('answers').children){b.disabled=true;if(b.textContent===current.answer)b.classList.add('right');else if(b.textContent===char)b.classList.add('wrong')}
$('word').querySelector('.gap').textContent=current.answer;$('feedback').replaceChildren();let heading=document.createElement('strong');heading.textContent=ok?'Верно! ':'Запомни: '+current.word+'. ';if(!ok)heading.style.color='var(--bad)';$('feedback').append(heading,document.createTextNode(current.rule));$('next').hidden=false;save()}
$('next').onclick=next;$('mode').onchange=start;$('reset').onclick=()=>{total=0;correct=0;save();start()};$('clearErrors').onclick=()=>{errors.clear();save();if($('mode').value==='errors')start()};
document.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT'||e.target.tagName==='BUTTON')return;if(e.key==='Enter'&&locked){e.preventDefault();next()}else if('аоеияэуюёы'.includes(e.key.toLowerCase())&&e.key.length===1)answer(e.key.toLowerCase())});
$('source').textContent='По темам документа «Задание 9: корни — теория и словник». '+BANK.length+' учебных примеров: '+BANK.filter(x=>x.cat==='check').length+' проверяемых, '+BANK.filter(x=>x.cat==='alternate').length+' на чередование, '+BANK.filter(x=>x.cat==='dict').length+' словарных. Это выборка, а не полный словник. Прогресс сохраняется в этом браузере. Работает без интернета.';stats();start();
