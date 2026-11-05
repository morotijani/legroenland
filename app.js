(function(){
var FR={n1:"Accueil",n2:"À propos",n3:"Spécialités",n4:"Comment ça marche",n5:"Réseau",n6:"FAQ",n7:"Contact",
h1:"Votre partenaire santé de confiance en Afrique subsaharienne",hp:"Des options de traitement dans plus de 100 hôpitaux répartis dans 20 pays, chez vous ou à l’étranger, avec un plan sous 48 heures.",
c1:"Envoyez vos dossiers médicaux",c2:"Voir comment ça marche",c3:"Envoyer la demande",s1:"hôpitaux partenaires",s2:"pays",s3:"dossiers traités",s4:"pays africains servis",s5:"pour un plan de traitement",
a1:"Le voyage médical, simplifié",a2:"Nous aidons les patients d’Afrique subsaharienne à trouver le bon traitement, sur place ou à l’étranger, de votre premier dossier jusqu’à votre rétablissement.",a3:"Notre histoire",
sp:"Des soins dans de nombreuses spécialités",sa:"Toutes les spécialités",tt:"Ce que disent nos patients",b1:"Prêt à parler de votre traitement ?",b2:"Envoyez vos dossiers et recevez un plan sous 48 heures.",
w1:"Ce qui nous distingue",pr:"Du premier message au suivi",nt:"Pays de nos hôpitaux partenaires",fq:"Questions fréquentes",ct:"Commencez par vos dossiers médicaux"};
var T=document.querySelectorAll('[data-t]');T.forEach(function(e){e.dataset.en=e.innerHTML});
function lang(l){document.documentElement.lang=l;T.forEach(function(e){e.innerHTML=l=='fr'&&FR[e.dataset.t]?FR[e.dataset.t]:e.dataset.en});
document.querySelectorAll('.lg button').forEach(function(b){b.classList.toggle('on',b.dataset.l==l)});try{localStorage.setItem('lg',l)}catch(x){}}
document.querySelectorAll('.lg button').forEach(function(b){b.onclick=function(){lang(b.dataset.l)}});
var cur=(location.pathname.split('/').pop()||'index.html');
document.querySelectorAll('#lk a:not(.btn)').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==cur)});
document.querySelectorAll('[data-c]').forEach(function(b){var t=+b.dataset.c,i=0,s=setInterval(function(){i++;b.textContent=Math.round(t*i/40).toLocaleString()+'+';if(i>=40)clearInterval(s)},30)});
document.getElementById('mb').onclick=function(){document.getElementById('lk').classList.toggle('o')};
document.querySelectorAll('#spf button').forEach(function(b){b.onclick=function(){document.querySelectorAll('#spf button').forEach(function(x){x.classList.toggle('on',x==b)});
document.querySelectorAll('#spg .cd').forEach(function(c){c.style.display=b.dataset.f=='all'||c.dataset.g==b.dataset.f?'':'none'})}});
var g=document.getElementById('dots');
if(g){var s='';for(var x=0;x<=750;x+=15)for(var y=0;y<=480;y+=15){var lo=x/5-20,la=60-y/5,on=false;
if(la<37&&la>-35&&lo>-18&&lo<51)on=!(la<-5&&lo<12&&la>-10);if(la>35&&la<60&&lo>-10&&lo<40)on=true;if(la>12&&la<40&&lo>34&&lo<62)on=true;
if(la>8&&la<35&&lo>68&&lo<90)on=lo<(la>20?88:78+(la-8)*.2);if(la>5&&la<20&&lo>118&&lo<127)on=true;
if(on)s+='<circle class="dot" cx="'+x+'" cy="'+y+'" r="2.4"/>'}g.innerHTML=s}
var f=document.getElementById('f');
if(f)f.onsubmit=function(e){e.preventDefault();var d=new FormData(e.target);
location.href='mailto:info@legroenland.com?subject='+encodeURIComponent('Patient enquiry')+'&body='+encodeURIComponent('Name: '+d.get('n')+'\nCountry: '+d.get('c')+'\nPhone: '+d.get('p')+'\nSpecialty: '+d.get('s')+'\n\n'+d.get('m'))};
try{if(localStorage.getItem('lg')=='fr')lang('fr')}catch(x){}
})();