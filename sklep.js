(function(){
'use strict';
var D=null,P={},K={},app=document.getElementById('app');
var ZAPIS='fd_sklep_v1';
var stan={kosz:[],konto:null,zam:[]};
try{var z=JSON.parse(localStorage.getItem(ZAPIS)||'null');if(z&&z.kosz)stan=z}catch(e){}
function zapisz(){try{localStorage.setItem(ZAPIS,JSON.stringify(stan))}catch(e){}licz()}

var DARMOWA=19900;
var DOSTAWY=[
 {id:'paczkomat',n:'InPost Paczkomat 24/7',o:'Odbiór w wybranym Paczkomacie, zwykle następnego dnia',c:1499,l:'InPost',kl:'l-inpost'},
 {id:'kurier',n:'Kurier InPost',o:'Dostawa pod adres, zwykle następnego dnia',c:1899,l:'InPost',kl:'l-inpost'},
 {id:'poczta',n:'Poczta Polska, przesyłka polecona',o:'Dostawa w 2-3 dni',c:1350,l:'Poczta',kl:'l-pp'}
];
var PLATN=[
 {id:'blik',n:'BLIK',o:'Kod z aplikacji banku, przez Przelewy24',l:'BLIK',kl:'l-blik'},
 {id:'p24',n:'Szybki przelew online',o:'Przelewy24, wybór banku na następnym kroku',l:'P24',kl:'l-p24'},
 {id:'karta',n:'Karta płatnicza, Google Pay, Apple Pay',o:'Przez Przelewy24',l:'P24',kl:'l-p24'}
];
var PUNKTY=[
 ['Paczkomat przy markecie','ul. Lotników Polskich, Świdnik'],
 ['Paczkomat przy stacji paliw','al. Lotników Polskich, Świdnik'],
 ['Paczkomat na osiedlu','ul. Kosmonautów, Świdnik']
];

function zl(g){var s=(g/100).toFixed(2).split('.');return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' zł'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nazwa(n){return n.replace(/\s*\(Kopia\)\s*/gi,' ').replace(/\s*\((?:[^()]*\d\s*m[,)\s][^()]*)\)\s*$/,'').replace(/\s*\(\s*\d[^()]*m\s*\)\s*$/,'').replace(/(\d)\.(\d)/g,'$1,$2').replace(/\s+/g,' ').trim()}
function dl(s){return s.replace(/m$/,' m')}
function sred(p){for(var i=0;i<p.a.length;i++)if(p.a[i][0]==='grubość drutu')return p.a[i][1];var m=p.n.match(/(\d+[.,]?\d*)\s*mm/);return m?m[1].replace('.',','):''}
function sredN(p){var s=sred(p);var v=parseFloat(String(s).replace(',','.').replace(/[^\d.]/g,''));return isNaN(v)?999:v}
function fot(p,duze){var i=p.im[0];if(!i)return '';return duze?'<img src="'+i.d+'" width="'+i.w+'" height="'+i.h+'" alt="'+esc(nazwa(p.n))+'">':'<img src="'+i.m+'" width="'+i.wm+'" height="'+i.hm+'" loading="lazy" alt="'+esc(nazwa(p.n))+'">'}
function cenaW(p,d){if(p.w&&p.w[d])return p.w[d].c;return p.c}
function jestW(p,d){if(p.w&&p.w[d])return p.w[d].s;return p.st}

var GLOWNE=[165,182,183,184,178,172];
function dzieci(id){return D.kategorie.filter(function(k){return k.p===id})}
function wKat(p,id){if(p.k.indexOf(id)>=0)return true;var dz=dzieci(id);for(var i=0;i<dz.length;i++)if(wKat(p,dz[i].id))return true;return false}
function sciezka(k){var w=[];while(k){w.unshift(k);k=K[k.p]}return w}
function katProd(p){var best=null,gl=-1;p.k.forEach(function(id){var k=K[id];if(!k)return;var s=sciezka(k);if(GLOWNE.indexOf(s[0].id)<0)return;if(s.length>gl){gl=s.length;best=k}});return best}

function licz(){var n=stan.kosz.reduce(function(a,x){return a+x.q},0);document.getElementById('licz').textContent=n||''}
function toast(t){var e=document.getElementById('toast');document.getElementById('toast-t').textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},4200)}
function tytul(t){document.title=t+' - Fabryka Drutu'}
function okr(lista){return '<nav class="okr" aria-label="Okruszki"><a href="index.html">Strona główna</a>'+lista.map(function(x){return '<span>'+(x[1]?'<a href="'+x[1]+'">'+esc(x[0])+'</a>':esc(x[0]))+'</span>'}).join('')+'</nav>'}

/* kategoria */
var filtr={q:'',sort:'sr'};
function widokKat(slug){
 var kat=slug?D.kategorie.filter(function(k){return k.s===slug})[0]:null;
 var lista=D.produkty.filter(function(p){return !kat||wKat(p,kat.id)});
 var q=filtr.q.trim().toLowerCase();
 if(q)lista=lista.filter(function(p){return nazwa(p.n).toLowerCase().indexOf(q)>=0||sred(p).indexOf(q)>=0});
 lista.sort(function(a,b){if(filtr.sort==='cr')return a.od-b.od;if(filtr.sort==='cm')return b.od-a.od;if(filtr.sort==='n')return nazwa(a.n).localeCompare(nazwa(b.n),'pl');var x=nazwa(a.n).replace(/\s[\d,]+\s*mm.*$/,''),y=nazwa(b.n).replace(/\s[\d,]+\s*mm.*$/,'');return x===y?sredN(a)-sredN(b):x.localeCompare(y,'pl')});
 var sc=kat?sciezka(kat):[];
 var drz='<li><a href="#/sklep" class="'+(!kat?'on':'')+'">Wszystkie druty <small>'+D.produkty.length+'</small></a></li>';
 GLOWNE.forEach(function(id){var k=K[id];drz+='<li><a href="#/product-category/'+k.s+'" class="'+(kat&&kat.id===id?'on':'')+'">'+esc(k.n)+' <small>'+k.ile+'</small></a></li>';
  if(sc.length&&sc[0].id===id)dzieci(id).forEach(function(d){drz+='<li class="pod"><a href="#/product-category/'+d.s+'" class="'+(kat.id===d.id?'on':'')+'">'+esc(d.n)+' <small>'+d.ile+'</small></a></li>';if(sc.some(function(z){return z.id===d.id}))dzieci(d.id).forEach(function(e){drz+='<li class="pod"><a style="padding-left:30px" href="#/product-category/'+e.s+'" class="'+(kat.id===e.id?'on':'')+'">'+esc(e.n)+' <small>'+e.ile+'</small></a></li>'})})});
 var chipy='<a href="#/sklep" class="'+(!kat?'on':'')+'">Wszystkie</a>';
 var podCh=kat?dzieci(sc[0].id):[];
 GLOWNE.forEach(function(id){var k=K[id];chipy+='<a href="#/product-category/'+k.s+'" class="'+(kat&&sc[0].id===id?'on':'')+'">'+esc(k.n.replace('Drut ',''))+'</a>'});
 var chipy2=podCh.length?'<div class="chipy" style="margin-top:-8px">'+podCh.map(function(d){return '<a href="#/product-category/'+d.s+'" class="'+(kat.id===d.id?'on':'')+'">'+esc(d.n.replace(sc[0].n+' ','').replace('Drut ',''))+'</a>'}).join('')+'</div>':'';
 var h=okr(kat?[['Sklep','#/sklep']].concat(sc.map(function(k,i){return [k.n,i<sc.length-1?'#/product-category/'+k.s:null]})):[['Sklep',null]]);
 h+='<div class="kat"><aside class="boczne"><h3>Kategorie</h3><ul class="drzewo">'+drz+'</ul></aside><div>';
 h+='<div class="kat-glowa"><div><h1>'+esc(kat?kat.n:'Sklep z drutem na metry')+'</h1><span class="pasma"></span><p>Wybierz średnicę, a na karcie produktu długość odcinka. Cena liczy się od razu.</p></div></div>';
 h+='<div class="chipy">'+chipy+'</div>'+chipy2;
 h+='<div class="narz"><input type="search" id="szuk" placeholder="Szukaj, np. Kanthal 0,5" value="'+esc(filtr.q)+'" aria-label="Szukaj drutu"><select id="sort" aria-label="Sortowanie"><option value="sr">Według średnicy</option><option value="cr">Cena: od najniższej</option><option value="cm">Cena: od najwyższej</option><option value="n">Nazwa A-Z</option></select><span class="ile">'+lista.length+' '+(lista.length===1?'produkt':(lista.length%10>=2&&lista.length%10<=4&&(lista.length%100<10||lista.length%100>=20)?'produkty':'produktów'))+'</span></div>';
 h+='<div class="siatka">'+lista.map(function(p){var s=sred(p);return '<a class="kar" href="#/product/'+p.s+'"><div class="fot">'+fot(p)+'</div><div><h3>'+esc(nazwa(p.n))+'</h3>'+(s?'<span><span class="d">'+esc(s)+(s.indexOf('mm')<0&&/\d/.test(s)?' mm':'')+'</span></span>':'')+(p.st?'':'<span class="brak">Chwilowo brak</span>')+'<div class="dol"><span class="cena">'+(p.od!==p.do?'od ':'')+zl(p.od)+'</span><span class="wyb">'+(p.dl.length?'Wybierz długość':'Zobacz')+'</span></div></div></a>'}).join('')+'</div>';
 if(!lista.length)h+='<p>Brak produktów dla tego wyszukiwania.</p>';
 h+='</div></div>';
 app.innerHTML=h;tytul(kat?kat.n:'Sklep');
 var sz=document.getElementById('szuk'),so=document.getElementById('sort');so.value=filtr.sort;
 sz.addEventListener('input',function(){filtr.q=sz.value;var pos=sz.selectionStart;widokKat(slug);var n=document.getElementById('szuk');n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}});
 so.addEventListener('change',function(){filtr.sort=so.value;widokKat(slug)});
}

/* produkt */
function widokProd(slug){
 var p=P[slug];if(!p){app.innerHTML='<p>Nie znaleziono produktu.</p><p><a class="btn btn-z" href="#/sklep">Wróć do sklepu</a></p>';return}
 var kat=katProd(p),sc=kat?sciezka(kat):[];
 var wyb=p.dl.length?(p.dd&&p.w[p.dd]&&p.w[p.dd].s?p.dd:(p.dl.filter(function(d){return p.w[d].s})[0]||p.dl[0])):null;
 var il=1;
 var bliscy=kat?D.produkty.filter(function(x){return katProd(x)===kat}).sort(function(a,b){return sredN(a)-sredN(b)}):[];
 var h=okr([['Sklep','#/sklep']].concat(sc.map(function(k){return [k.n,'#/product-category/'+k.s]})).concat([[nazwa(p.n),null]]));
 h+='<div class="prod"><div class="gal"><div class="glowne" id="gl">'+fot(p,true)+'</div>'+(p.im.length>1?'<div class="min">'+p.im.map(function(i,n){return '<button type="button" data-i="'+n+'" class="'+(n?'':'on')+'" aria-label="Zdjęcie '+(n+1)+'"><img src="'+i.m+'" width="'+i.wm+'" height="'+i.hm+'" alt=""></button>'}).join('')+'</div>':'')+'</div>';
 h+='<div><h1>'+esc(nazwa(p.n))+'</h1><div class="sr">'+(sred(p)?'<span class="d">'+esc(sred(p))+' mm</span>':'')+(kat?'<span>'+esc(kat.n)+'</span>':'')+'</div>';
 h+='<div class="cena-d" id="cena"></div>';
 if(p.dl.length){h+='<span class="etyk">Długość odcinka</span><div class="dlug" id="dlug">'+p.dl.map(function(d){return '<button type="button" data-d="'+esc(d)+'" class="'+(p.w[d].s?'':'niedost')+'" aria-pressed="false">'+esc(dl(d))+'</button>'}).join('')+'</div>'}
 h+='<p class="stan" id="stan"></p>';
 h+='<div class="kup"><div class="ilosc"><button type="button" id="mn" aria-label="Mniej">-</button><input id="il" type="number" min="1" value="1" aria-label="Ilość"><button type="button" id="pl" aria-label="Więcej">+</button></div><button class="btn btn-z" id="dodaj" type="button">Dodaj do koszyka</button></div>';
 h+='<ul class="atuty"><li>Zamówienie do 14:00 wysyłamy tego samego dnia</li><li>Darmowa wysyłka od 199 zł</li><li>InPost Paczkomat, kurier lub Poczta Polska</li><li>Płatność BLIK, przelewem online lub kartą</li></ul>';
 if(bliscy.length>1)h+='<div class="inne"><span class="etyk">Inne średnice: '+esc(kat.n)+'</span><div class="lista">'+bliscy.map(function(x){return '<a href="#/product/'+x.s+'" class="'+(x===p?'on':'')+'">'+esc(sred(x)||nazwa(x.n))+' mm</a>'}).join('')+'</div></div>';
 h+='</div></div>';
 h+='<div class="dane-t"><div><h2>Dane techniczne</h2><span class="pasma"></span><table style="margin-top:18px"><tbody>'+p.a.map(function(a){return '<tr><th>'+esc(a[0].charAt(0).toUpperCase()+a[0].slice(1))+'</th><td>'+esc(a[1])+(a[0]==='grubość drutu'&&/^\d/.test(a[1])?' mm':'')+'</td></tr>'}).join('')+(p.dl.length?'<tr><th>Dostępne długości</th><td>'+p.dl.map(dl).join(', ')+'</td></tr>':'')+'</tbody></table></div>';
 h+='<div><h2>Opis</h2><span class="pasma"></span><div class="opis" style="margin-top:18px">'+(p.op||'<p>'+esc(p.kr)+'</p>')+'</div></div></div>';
 app.innerHTML=h;tytul(nazwa(p.n));
 function odsw(){
  var c=p.dl.length?cenaW(p,wyb):p.c,j=p.dl.length?jestW(p,wyb):p.st;
  document.getElementById('cena').innerHTML=zl(c*il)+'<small>'+(p.dl.length?'za '+dl(wyb)+(il>1?' x '+il+' szt. ('+zl(c)+' za odcinek)':'')+(parseFloat(wyb)>1?', '+zl(Math.round(c/parseFloat(wyb)))+' za metr':''):'za sztukę')+'</small>';
  var s=document.getElementById('stan');s.className='stan '+(j?'jest':'nie');s.textContent=j?'Dostępny, wysyłka w 24 h':'Ta długość jest chwilowo niedostępna';
  document.getElementById('dodaj').disabled=!j;
  document.querySelectorAll('#dlug button').forEach(function(b){var on=b.getAttribute('data-d')===wyb;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
 }
 var dg=document.getElementById('dlug');
 if(dg)dg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;wyb=b.getAttribute('data-d');odsw()});
 var ili=document.getElementById('il');
 function ustIl(v){il=Math.max(1,Math.min(99,parseInt(v,10)||1));ili.value=il;odsw()}
 document.getElementById('mn').onclick=function(){ustIl(il-1)};
 document.getElementById('pl').onclick=function(){ustIl(il+1)};
 ili.onchange=function(){ustIl(ili.value)};
 document.getElementById('dodaj').onclick=function(){
  var id=p.id+'|'+(wyb||''),poz=stan.kosz.filter(function(x){return x.id===id})[0];
  if(poz)poz.q+=il;else stan.kosz.push({id:id,s:p.s,d:wyb,q:il});
  zapisz();toast('Dodano: '+nazwa(p.n)+(wyb?', '+dl(wyb):'')+(il>1?' x '+il:''));
 };
 var mins=document.querySelectorAll('.min button');
 mins.forEach(function(b){b.onclick=function(){var i=p.im[+b.getAttribute('data-i')];document.getElementById('gl').innerHTML='<img src="'+i.d+'" width="'+i.w+'" height="'+i.h+'" alt="'+esc(nazwa(p.n))+'">';mins.forEach(function(x){x.classList.toggle('on',x===b)})}});
 odsw();
}

/* koszyk */
function pozycje(){return stan.kosz.map(function(x){var p=P[x.s];if(!p)return null;var c=x.d?cenaW(p,x.d):p.c;return {x:x,p:p,c:c,s:c*x.q}}).filter(Boolean)}
function suma(){return pozycje().reduce(function(a,x){return a+x.s},0)}
function prog(s){if(s>=DARMOWA)return '<div class="prog"><b>Masz darmową wysyłkę.</b><div class="b"><i style="width:100%"></i></div></div>';return '<div class="prog">Do darmowej wysyłki brakuje <b>'+zl(DARMOWA-s)+'</b><div class="b"><i style="width:'+Math.round(s/DARMOWA*100)+'%"></i></div></div>'}
function widokKosz(){
 var poz=pozycje();tytul('Koszyk');
 if(!poz.length){app.innerHTML=okr([['Koszyk',null]])+'<div class="pusty"><h1>Koszyk jest pusty</h1><span class="pasma" style="margin:14px auto 0"></span><p>Wybierz drut, średnicę i długość, a pojawi się tutaj.</p><a class="btn btn-z" href="#/sklep">Przejdź do sklepu</a></div>';return}
 var s=suma();
 var h=okr([['Koszyk',null]])+'<h1>Koszyk</h1><span class="pasma"></span><div class="kosz-u" style="margin-top:28px"><div>';
 h+=poz.map(function(z,i){return '<div class="poz"><a class="f" href="#/product/'+z.p.s+'">'+fot(z.p)+'</a><div><h3><a href="#/product/'+z.p.s+'">'+esc(nazwa(z.p.n))+'</a></h3><div class="op">'+(z.x.d?'Długość: '+dl(z.x.d)+', ':'')+zl(z.c)+' za sztukę</div><div class="ak"><div class="ilosc"><button type="button" data-a="-" data-i="'+i+'" aria-label="Mniej">-</button><input type="number" min="1" value="'+z.x.q+'" data-i="'+i+'" aria-label="Ilość"><button type="button" data-a="+" data-i="'+i+'" aria-label="Więcej">+</button></div><button class="usun" type="button" data-u="'+i+'">Usuń</button></div></div><div class="suma">'+zl(z.s)+'</div></div>'}).join('');
 h+='<p style="margin-top:18px"><a href="#/sklep">Kontynuuj zakupy</a></p></div><aside class="podsum"><h2>Podsumowanie</h2><div class="wiersz"><span>Produkty</span><span>'+zl(s)+'</span></div><div class="wiersz"><span>Dostawa</span><span>'+(s>=DARMOWA?'0,00 zł':'od '+zl(DOSTAWY[2].c))+'</span></div>'+prog(s)+'<div class="wiersz raz"><span>Razem</span><span>'+zl(s)+'</span></div><a class="btn btn-z" href="#/zamowienie">Przejdź do zamówienia</a><p class="male" style="margin:12px 0 0">Koszt dostawy wybierzesz w następnym kroku.</p></aside></div>';
 app.innerHTML=h;
 app.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){var x=stan.kosz[+b.getAttribute('data-i')];x.q=Math.max(1,x.q+(b.getAttribute('data-a')==='+'?1:-1));zapisz();widokKosz()}});
 app.querySelectorAll('.poz input').forEach(function(n){n.onchange=function(){var x=stan.kosz[+n.getAttribute('data-i')];x.q=Math.max(1,Math.min(99,parseInt(n.value,10)||1));zapisz();widokKosz()}});
 app.querySelectorAll('[data-u]').forEach(function(b){b.onclick=function(){stan.kosz.splice(+b.getAttribute('data-u'),1);zapisz();widokKosz()}});
}

/* zamowienie */
var zam={tryb:'gosc',dost:'paczkomat',pkt:null,plat:'blik'};
function widokZam(){
 var poz=pozycje();if(!poz.length){location.hash='#/koszyk';return}
 if(stan.konto&&zam.tryb==='gosc'&&!zam._u){zam.tryb='konto';zam._u=1}
 tytul('Zamówienie');
 var s=suma();
 function kosztD(d){return s>=DARMOWA?0:d.c}
 var k=stan.konto||{};
 var h=okr([['Koszyk','#/koszyk'],['Zamówienie',null]])+'<h1>Zamówienie</h1><span class="pasma"></span><div class="kosz-u" style="margin-top:28px"><div class="kroki">';
 h+='<div class="blok"><h2><span class="nr">1</span>Dane do zamówienia</h2>';
 if(stan.konto)h+='<p class="uwaga" style="margin-bottom:16px">Zalogowano jako <b>'+esc(k.email)+'</b>. Dane uzupełniły się z konta.</p>';
 else h+='<div class="zakl" role="tablist"><button type="button" data-t="gosc" class="'+(zam.tryb==='gosc'?'on':'')+'">Kupuję bez konta</button><button type="button" data-t="log" class="'+(zam.tryb==='log'?'on':'')+'">Mam konto</button></div>';
 if(!stan.konto&&zam.tryb==='log'){h+='<div class="log"><div class="pola"><label class="cala">E-mail<input type="email" id="l-e" autocomplete="email"></label><label class="cala">Hasło<input type="password" id="l-h" autocomplete="current-password"></label></div><button class="btn btn-g" type="button" id="l-z" style="margin-top:14px">Zaloguj i kontynuuj</button><p class="male" style="margin-top:10px">W podglądzie zadziała dowolny e-mail i hasło.</p></div></div>'}
 else{
  h+='<div class="pola"><label>Imię<input type="text" id="f-i" autocomplete="given-name" value="'+esc(k.imie||'')+'"></label><label>Nazwisko<input type="text" id="f-n" autocomplete="family-name" value="'+esc(k.nazw||'')+'"></label><label>E-mail<input type="email" id="f-e" autocomplete="email" value="'+esc(k.email||'')+'"></label><label>Telefon<input type="tel" id="f-t" autocomplete="tel" value="'+esc(k.tel||'')+'"></label><label class="cala">Ulica i numer<input type="text" id="f-u" autocomplete="street-address" value="'+esc(k.ul||'')+'"></label><label>Kod pocztowy<input type="text" id="f-k" autocomplete="postal-code" inputmode="numeric" value="'+esc(k.kod||'')+'"></label><label>Miejscowość<input type="text" id="f-m" autocomplete="address-level2" value="'+esc(k.m||'')+'"></label><label class="cala zgoda"><input type="checkbox" id="f-fv"><span>Chcę fakturę na firmę (NIP)</span></label><label class="cala" id="nip-w" style="display:none">NIP<input type="text" id="f-nip" inputmode="numeric"></label></div>';
  if(!stan.konto)h+='<label class="zgoda" style="margin-top:12px"><input type="checkbox" id="f-ko"><span>Załóż konto, żeby śledzić zamówienia (hasło przyjdzie e-mailem)</span></label>';
  h+='</div>';
  h+='<div class="blok"><h2><span class="nr">2</span>Dostawa</h2>'+DOSTAWY.map(function(d){var c=kosztD(d);return '<label class="opcja '+(zam.dost===d.id?'on':'')+'"><input type="radio" name="dost" value="'+d.id+'" '+(zam.dost===d.id?'checked':'')+'><span class="logo-op '+d.kl+'">'+d.l+'</span><span class="t"><b>'+d.n+'</b><small>'+d.o+'</small></span><span class="k">'+(c?zl(c):'0,00 zł')+'</span></label>'+(d.id==='paczkomat'&&zam.dost==='paczkomat'?'<div class="pacz"><div class="wyb-p">'+(zam.pkt?'<b>'+esc(zam.pkt[0])+'</b><br>'+esc(zam.pkt[1]):'Nie wybrano Paczkomatu')+'<br><button class="btn btn-l" style="min-height:40px;font-size:14px" type="button" id="wyb-p">'+(zam.pkt?'Zmień Paczkomat':'Wybierz Paczkomat')+'</button></div></div>':'')}).join('')+'<p class="male" style="margin:4px 0 0">Ceny dostawy w podglądzie są przykładowe. W sklepie ustawimy Państwa stawki, a od 199 zł dostawa jest darmowa.</p></div>';
  h+='<div class="blok"><h2><span class="nr">3</span>Płatność</h2>'+PLATN.map(function(p){return '<label class="opcja '+(zam.plat===p.id?'on':'')+'"><input type="radio" name="plat" value="'+p.id+'" '+(zam.plat===p.id?'checked':'')+'><span class="logo-op '+p.kl+'">'+p.l+'</span><span class="t"><b>'+p.n+'</b><small>'+p.o+'</small></span></label>'}).join('')+'<label class="zgoda" style="margin-top:14px"><input type="checkbox" id="f-reg"><span>Akceptuję regulamin sklepu i politykę prywatności.</span></label><p class="blad" id="blad"></p></div>';
 }
 h+='</div><aside class="podsum"><h2>Twoje zamówienie</h2>'+poz.map(function(z){return '<div class="mini"><span>'+esc(nazwa(z.p.n))+(z.x.d?', '+dl(z.x.d):'')+' x '+z.x.q+'</span><b>'+zl(z.s)+'</b></div>'}).join('');
 var d=DOSTAWY.filter(function(x){return x.id===zam.dost})[0],kd=kosztD(d);
 h+='<div class="wiersz" style="margin-top:8px"><span>Produkty</span><span>'+zl(s)+'</span></div><div class="wiersz"><span>Dostawa</span><span>'+zl(kd)+'</span></div><div class="wiersz raz"><span>Do zapłaty</span><span>'+zl(s+kd)+'</span></div><button class="btn btn-z" type="button" id="zloz"'+(!stan.konto&&zam.tryb==='log'?' disabled':'')+'>Zamawiam i płacę</button><p class="male" style="margin:12px 0 0">To podgląd: zamówienie jest testowe, nic nie zostanie pobrane.</p></aside></div>';
 app.innerHTML=h;
 app.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){zachowaj();zam.tryb=b.getAttribute('data-t');widokZam()}});
 var lz=document.getElementById('l-z');
 if(lz)lz.onclick=function(){var e=document.getElementById('l-e').value.trim();if(!/@/.test(e)){document.getElementById('l-e').classList.add('zle');return}stan.konto=kontoDemo(e);zapisz();zam.tryb='konto';widokZam()};
 var fv=document.getElementById('f-fv');if(fv)fv.onchange=function(){document.getElementById('nip-w').style.display=fv.checked?'flex':'none'};
 app.querySelectorAll('input[name=dost]').forEach(function(r){r.onchange=function(){zachowaj();zam.dost=r.value;widokZam()}});
 app.querySelectorAll('input[name=plat]').forEach(function(r){r.onchange=function(){zam.plat=r.value;app.querySelectorAll('input[name=plat]').forEach(function(x){x.closest('.opcja').classList.toggle('on',x.checked)})}});
 var wp=document.getElementById('wyb-p');if(wp)wp.onclick=function(){zachowaj();mapaPaczkomatow()};
 przywroc();
 document.getElementById('zloz').onclick=function(){
  var pola=['f-i','f-n','f-e','f-t'];if(zam.dost!=='paczkomat')pola=pola.concat(['f-u','f-k','f-m']);
  var zle=[];pola.forEach(function(id){var e=document.getElementById(id);var ok=e&&e.value.trim().length>1&&(id!=='f-e'||/@.+\./.test(e.value));e.classList.toggle('zle',!ok);if(!ok)zle.push(id)});
  var b=document.getElementById('blad'),m='';
  if(zle.length)m='Uzupełnij zaznaczone pola.';
  else if(zam.dost==='paczkomat'&&!zam.pkt)m='Wybierz Paczkomat.';
  else if(!document.getElementById('f-reg').checked)m='Zaznacz akceptację regulaminu.';
  if(m){b.textContent=m;b.style.display='block';var c=document.querySelector('.zle')||b;c.scrollIntoView({block:'center',behavior:'smooth'});return}
  zachowaj();
  var nr=String(10480+stan.zam.length+1),dz=new Date();
  var o={nr:nr,data:dz.toLocaleDateString('pl-PL'),poz:poz.map(function(z){return {n:nazwa(z.p.n),d:z.x.d,q:z.x.q,s:z.s}}),dost:d.n,pkt:zam.pkt,kd:kd,plat:PLATN.filter(function(x){return x.id===zam.plat})[0].n,razem:s+kd,status:'Oczekuje na płatność',dane:zam.dane};
  stan.zam.unshift(o);
  if(!stan.konto&&document.getElementById('f-ko')&&document.getElementById('f-ko').checked){stan.konto=kontoDemo(zam.dane.e,zam.dane)}
  zapisz();location.hash='#/platnosc/'+nr;
 };
}
function zachowaj(){var g=function(id){var e=document.getElementById(id);return e?e.value:''};if(!document.getElementById('f-i'))return;zam.dane={i:g('f-i'),n:g('f-n'),e:g('f-e'),t:g('f-t'),u:g('f-u'),k:g('f-k'),m:g('f-m')}}
function przywroc(){if(!zam.dane)return;var m={i:'f-i',n:'f-n',e:'f-e',t:'f-t',u:'f-u',k:'f-k',m:'f-m'};Object.keys(m).forEach(function(k){var e=document.getElementById(m[k]);if(e&&zam.dane[k])e.value=zam.dane[k]})}
function kontoDemo(e,dd){dd=dd||{};return {email:e,imie:dd.i||'Jan',nazw:dd.n||'Kowalski',tel:dd.t||'500 600 700',ul:dd.u||'ul. Przykładowa 5',kod:dd.k||'21-040',m:dd.m||'Świdnik'}}
function mapaPaczkomatow(){
 var o=document.getElementById('okno'),m=document.getElementById('modal');
 o.innerHTML='<h3 id="modal-t">Wybierz Paczkomat</h3><p class="male">W sklepie w tym miejscu otworzy się mapa Paczkomatów InPost z wyszukiwarką po adresie. W podglądzie są trzy przykładowe punkty.</p>'+PUNKTY.map(function(p,i){return '<button class="pkt" type="button" data-p="'+i+'"><b>'+esc(p[0])+'</b>'+esc(p[1])+'</button>'}).join('')+'<button class="btn btn-l" type="button" id="m-z" style="width:100%;margin-top:14px">Zamknij</button>';
 m.classList.add('on');
 o.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){zam.pkt=PUNKTY[+b.getAttribute('data-p')];m.classList.remove('on');widokZam()}});
 document.getElementById('m-z').onclick=function(){m.classList.remove('on')};
}
m_zamk();
function m_zamk(){var m=document.getElementById('modal');m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('on')});document.addEventListener('keydown',function(e){if(e.key==='Escape')m.classList.remove('on')})}

/* platnosc */
function znajdz(nr){return stan.zam.filter(function(z){return z.nr===nr})[0]}
function widokPlat(nr){
 var o=znajdz(nr);if(!o){location.hash='#/sklep';return}
 tytul('Płatność');
 var blik=o.plat==='BLIK';
 var h='<div class="bramka"><div class="gora"><span>Przelewy24</span><small>TRYB TESTOWY</small></div><div class="srodek"><p class="male" style="margin:0">Fabryka Drutu FD, zamówienie nr '+nr+'</p><div class="kw">'+zl(o.razem)+'</div>';
 if(blik)h+='<label style="margin-top:18px">Kod BLIK z aplikacji banku<input type="text" class="blik-in" id="blik" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code"></label><p class="male" style="margin:8px 0 0">W podglądzie wpisz dowolne 6 cyfr.</p>';
 else h+='<p style="margin:18px 0 0">'+esc(o.plat)+'. W sklepie w tym miejscu wybiera się bank albo podaje kartę na stronie Przelewy24.</p>';
 h+='<p class="blad" id="blad"></p><button class="btn btn-z" type="button" id="zap">Zapłać '+zl(o.razem)+'</button><button class="btn btn-l" type="button" id="anu">Anuluj płatność</button></div></div><p class="male" style="text-align:center;margin-top:16px">Testowa bramka płatności. Żadne pieniądze nie są pobierane.</p>';
 app.innerHTML=h;
 document.getElementById('zap').onclick=function(){
  if(blik){var v=document.getElementById('blik').value.replace(/\D/g,'');if(v.length!==6){var b=document.getElementById('blad');b.textContent='Wpisz 6 cyfr kodu BLIK.';b.style.display='block';return}}
  this.disabled=true;this.textContent='Łączę z bankiem...';
  setTimeout(function(){o.status='W realizacji';o.oplacone=true;stan.kosz=[];zapisz();location.hash='#/zamowienie-przyjete/'+nr},1100);
 };
 document.getElementById('anu').onclick=function(){o.status='Oczekuje na płatność';zapisz();location.hash='#/platnosc-przerwana/'+nr};
}
function widokOk(nr){
 var o=znajdz(nr);if(!o){location.hash='#/sklep';return}
 tytul('Zamówienie przyjęte');
 var h='<div class="wynik"><div class="znak ok"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B1D20" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h1>Zamówienie testowe przyjęte, to podgląd</h1><span class="pasma" style="margin:14px auto 0"></span><p class="lead">Płatność testowa przeszła, zamówienie nr '+nr+' ma status „W realizacji”. W działającym sklepie klient dostaje w tej chwili e-mail z potwierdzeniem, a sklep powiadomienie o nowym zamówieniu.</p>';
 h+=ramkaZam(o)+'<div class="akcje"><a class="btn btn-z" href="#/moje-konto/zamowienia">Zobacz w koncie klienta</a><a class="btn btn-l" href="#/sklep">Wróć do sklepu</a></div></div>';
 app.innerHTML=h;
}
function widokPrzerw(nr){
 var o=znajdz(nr);if(!o){location.hash='#/sklep';return}
 tytul('Płatność nie została zakończona');
 var h='<div class="wynik"><div class="znak nie"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#B3261E" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 7v6M12 17h.01"/></svg></div><h1>Płatność nie została zakończona</h1><span class="pasma" style="margin:14px auto 0"></span><p class="lead">Zamówienie nr '+nr+' jest zapisane ze statusem „Oczekuje na płatność”, a produkty zostają w koszyku. Można zapłacić ponownie teraz albo później z konta klienta.</p>';
 h+=ramkaZam(o)+'<div class="akcje"><a class="btn btn-z" href="#/platnosc/'+nr+'">Zapłać ponownie</a><a class="btn btn-l" href="#/koszyk">Wróć do koszyka</a></div></div>';
 app.innerHTML=h;
}
function ramkaZam(o){return '<div class="ramka"><h3>Zamówienie nr '+o.nr+'</h3>'+o.poz.map(function(z){return '<div class="mini"><span>'+esc(z.n)+(z.d?', '+dl(z.d):'')+' x '+z.q+'</span><b>'+zl(z.s)+'</b></div>'}).join('')+'<div class="mini"><span>'+esc(o.dost)+(o.pkt?': '+esc(o.pkt[0])+', '+esc(o.pkt[1]):'')+'</span><b>'+zl(o.kd)+'</b></div><div class="wiersz raz"><span>Razem</span><span>'+zl(o.razem)+'</span></div><p class="male" style="margin:8px 0 0">Płatność: '+esc(o.plat)+'</p></div>'}

/* konto */
var PRZYKL=[];
function przykl(){
 function poz(re,d){var p=D.produkty.filter(function(x){return re.test(x.s)&&x.w&&x.w[d]})[0];return p?{n:nazwa(p.n),d:d,q:1,s:p.w[d].c}:null}
 var a=[poz(/kanthal-a1.*-05-mm/,'20m')].filter(Boolean),b=[poz(/^drut-miedziany-modelarski-miekki-1-mm/,'10m')].filter(Boolean);
 function o(nr,data,st,pz,kd,pl){var s=pz.reduce(function(x,y){return x+y.s},0);return {nr:nr,data:data,status:st,poz:pz,dost:'InPost Paczkomat 24/7',kd:kd,plat:pl,razem:s+kd}}
 if(a.length)PRZYKL.push(o('10421','12.11.2026','Wysłane',a,1499,'BLIK'));
 if(b.length)PRZYKL.push(o('10388','28.10.2026','Zakończone',b,1499,'Szybki przelew online'));
}
function widokKonto(pod){
 tytul('Moje konto');
 if(!stan.konto){
  app.innerHTML=okr([['Moje konto',null]])+'<h1>Moje konto</h1><span class="pasma"></span><div class="log" style="margin-top:28px"><div class="pola"><label class="cala">E-mail<input type="email" id="l-e" autocomplete="email"></label><label class="cala">Hasło<input type="password" id="l-h" autocomplete="current-password"></label></div><button class="btn btn-g" id="l-z" type="button" style="margin-top:14px">Zaloguj się</button><p class="male" style="margin-top:12px">W podglądzie zadziała dowolny e-mail i hasło. Po przeniesieniu sklepu klienci logują się dotychczasowym e-mailem i hasłem.</p><p style="margin-top:18px"><a href="#/moje-konto" id="l-n">Nie masz konta? Załóż je przy pierwszym zamówieniu.</a></p></div>';
  document.getElementById('l-z').onclick=function(){var e=document.getElementById('l-e').value.trim();if(!/@/.test(e)){document.getElementById('l-e').classList.add('zle');return}stan.konto=kontoDemo(e);zapisz();widokKonto('zamowienia')};
  return;
 }
 var k=stan.konto,zak=pod||'pulpit';
 var nav=[['pulpit','Pulpit'],['zamowienia','Zamówienia'],['adresy','Adresy'],['dane','Dane konta']];
 var h=okr([['Moje konto',null]])+'<h1>Moje konto</h1><span class="pasma"></span><div class="konto" style="margin-top:28px"><nav aria-label="Konto">'+nav.map(function(n){return '<a href="#/moje-konto/'+n[0]+'" class="'+(zak===n[0]?'on':'')+'">'+n[1]+'</a>'}).join('')+'<a href="#/moje-konto" id="wyl">Wyloguj</a></nav><div>';
 var wsz=stan.zam.concat(PRZYKL);
 if(zak==='pulpit')h+='<p style="margin-top:0">Witaj, <b>'+esc(k.imie)+'</b>. Tutaj sprawdzisz zamówienia i ich status, zmienisz adres dostawy i hasło.</p><div class="adr" style="margin-top:20px"><div><h3>Ostatnie zamówienie</h3><p style="margin:8px 0 0">Nr '+wsz[0].nr+', '+wsz[0].data+'<br><span class="status '+kl(wsz[0].status)+'">'+wsz[0].status+'</span></p><p style="margin:10px 0 0"><a href="#/moje-konto/zamowienia">Wszystkie zamówienia</a></p></div><div><h3>Adres dostawy</h3><p style="margin:8px 0 0">'+esc(k.imie+' '+k.nazw)+'<br>'+esc(k.ul)+'<br>'+esc(k.kod+' '+k.m)+'</p></div></div>';
 if(zak==='zamowienia')h+='<table class="tab"><thead><tr><th>Nr</th><th class="ukr">Data</th><th>Status</th><th>Razem</th><th></th></tr></thead><tbody>'+wsz.map(function(o){return '<tr><td>'+o.nr+'</td><td class="ukr">'+o.data+'</td><td><span class="status '+kl(o.status)+'">'+o.status+'</span></td><td>'+zl(o.razem)+'</td><td>'+(o.status==='Oczekuje na płatność'?'<a href="#/platnosc/'+o.nr+'">Zapłać</a>':'<a href="#/moje-konto/zamowienie/'+o.nr+'">Szczegóły</a>')+'</td></tr>'}).join('')+'</tbody></table><p class="male" style="margin-top:12px">Zamówienia 10421 i 10388 są przykładowe. Po przeniesieniu sklepu klient widzi tu swoją dotychczasową historię zamówień.</p>';
 if(zak==='zamowienie'){var nr=(location.hash.split('/')[3]||''),o=wsz.filter(function(x){return x.nr===nr})[0];h+=o?ramkaZam(o).replace('<div class="ramka">','<div class="ramka" style="margin-top:0">'):'<p>Brak zamówienia.</p>';h+='<p style="margin-top:16px"><a href="#/moje-konto/zamowienia">Wróć do listy</a></p>'}
 if(zak==='adresy')h+='<div class="adr"><div><h3>Adres rozliczeniowy</h3><p style="margin:8px 0 0">'+esc(k.imie+' '+k.nazw)+'<br>'+esc(k.ul)+'<br>'+esc(k.kod+' '+k.m)+'<br>'+esc(k.tel)+'<br>'+esc(k.email)+'</p></div><div><h3>Adres dostawy</h3><p style="margin:8px 0 0">'+esc(k.imie+' '+k.nazw)+'<br>'+esc(k.ul)+'<br>'+esc(k.kod+' '+k.m)+'</p></div></div>';
 if(zak==='dane')h+='<div class="log"><div class="pola"><label>Imię<input type="text" value="'+esc(k.imie)+'"></label><label>Nazwisko<input type="text" value="'+esc(k.nazw)+'"></label><label class="cala">E-mail<input type="email" value="'+esc(k.email)+'"></label><label class="cala">Nowe hasło<input type="password" autocomplete="new-password"></label></div><button class="btn btn-g" type="button" id="zap-d" style="margin-top:14px">Zapisz zmiany</button></div>';
 h+='</div></div>';
 app.innerHTML=h;
 document.getElementById('wyl').onclick=function(e){e.preventDefault();stan.konto=null;zapisz();widokKonto()};
 var zd=document.getElementById('zap-d');if(zd)zd.onclick=function(){toast('Zapisano (w podglądzie zmiany nie są wysyłane)')};
}
function kl(s){return s==='Oczekuje na płatność'?'s-plat':(s==='W realizacji'?'s-real':'s-wys')}

/* routing */
function trasa(){
 if(!D)return;
 document.body.classList.remove('otw');document.getElementById('toast').classList.remove('on');
 var h=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/');
 var a=h[0],b=h[1];
 if(a==='product-category')widokKat(b);
 else if(a==='product')widokProd(b);
 else if(a==='koszyk')widokKosz();
 else if(a==='zamowienie')widokZam();
 else if(a==='platnosc')widokPlat(b);
 else if(a==='zamowienie-przyjete')widokOk(b);
 else if(a==='platnosc-przerwana')widokPrzerw(b);
 else if(a==='moje-konto')widokKonto(b);
 else widokKat(null);
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',trasa);
var bu=document.querySelector('.burger');
bu.addEventListener('click',function(){var o=document.body.classList.toggle('otw');bu.setAttribute('aria-expanded',o)});
licz();
fetch('dane/sklep.json').then(function(r){return r.json()}).then(function(d){D=d;d.kategorie.forEach(function(k){K[k.id]=k});d.produkty.forEach(function(p){P[p.s]=p});przykl();trasa()}).catch(function(){app.innerHTML='<p>Nie udało się wczytać produktów. Odśwież stronę.</p>'});
})();
