var FISH=[ // rar: 0=Vanlig, 1=Sjelden, 2=Legendarisk
 {k:"sei",n:"Sei",z:0,pull:0.7,w:100,len:[30,70],kg:4,pris:30,col:"#6b7a72",shape:"torpedo",rar:0,fight:0.8,min:45,dg:[0.6,1.5,1.0,1.5],syn:true,str:0.85},
 {k:"lyr",n:"Lyr",z:0,zb:1,zbw:12,pull:0.9,w:45,len:[35,78],kg:5,pris:40,col:"#b0895a",shape:"torpedo",rar:0,fight:0.75,dg:[0.5,1.6,0.9,1.6],syn:true,ss:[0.5,0.5,0.6,0.7,0.9,1.1,1.3,1.3,1.2,0.9,0.7,0.5],str:0.85},
 {k:"makrell",n:"Makrell",z:0,pull:1.15,w:80,len:[24,46],kg:8,pris:25,col:"#2e7d8b",shape:"streak",rar:0,fight:0.8,min:30,dg:[0.1,1.6,1.0,1.6],ss:[0,0,0,0,0,0.4,1.5,1.5,1.0,0.15,0,0],str:0.85},
 {k:"berggylte",n:"Berggylte",z:0,pull:0.9,w:45,len:[25,50],kg:3,pris:35,col:"#6f8a4a",shape:"deep",rar:1,fight:0.4,dg:[0.05,0.4,1.3,0.4],syn:true,ss:[0.05,0.05,0.1,0.3,0.7,1.2,1.5,1.5,1.2,0.5,0.1,0.05],str:0.15},
 {k:"sandflyndre",n:"Sandflyndre",z:0,pull:0.5,w:45,len:[18,40],kg:9,pris:25,col:"#b09a6e",shape:"flat",bunn:true,rar:0,fight:0.2,dg:[0.5,1.0,1.2,1.0],syn:true},
 {k:"skrubbe",n:"Skrubbe",z:0,pull:0.6,w:22,len:[20,45],kg:9,pris:25,col:"#7d6b4c",shape:"flat",bunn:true,rar:1,fight:0.25,dg:[0.7,1.0,1.1,1.0],syn:true},
 {k:"knurr",n:"Knurr",z:0,pull:0.7,w:22,len:[22,45],kg:7,pris:45,col:"#b06a4a",shape:"deep",rar:1,fight:0.3,dg:[0.7,0.9,1.3,0.9],str:0.3},
 {k:"hvitting",n:"Hvitting",z:0,pull:0.6,w:8,len:[25,50],kg:5,pris:35,col:"#a8a49a",shape:"cod",rar:1,fight:0.2,min:32,dg:[1.6,1.3,0.7,1.3],str:0.3},
 {k:"lomre",n:"Lomre",z:0,pull:0.6,w:8,len:[24,45],kg:9,pris:80,col:"#8f7346",shape:"flat",bunn:true,rar:1,fight:0.25,dg:[0.5,1.0,1.2,1.0],syn:true},
 {k:"torsk",n:"Torsk",z:1,zb:2,zbw:40,pull:1.0,w:90,len:[40,95],kg:10,pris:200,col:"#8a7d55",shape:"cod",rar:0,fight:0.25,min:55,dg:[0.8,1.6,1.0,1.6],syn:true,ss:[1.2,1.6,1.6,1.4,1.0,0.9,0.8,0.8,0.9,1.0,1.1,1.1],str:0.3}, // kg kalibrert: 90 cm ≈ 8 kg; zbw = dempet vekt i sekundærsonen (skreien står dypt, men brosma eier dypet)
 {k:"hyse",n:"Hyse",z:1,pull:0.8,w:70,len:[32,62],kg:6,pris:170,col:"#9aa0a6",shape:"cod",rar:0,fight:0.15,min:40,dg:[0.8,1.2,1.0,1.2],syn:true,str:0.3},
 // Sild: liten, pelagisk, går i tette stimer. Lav w — du får henne av og til på vanlig
 // sluk, men hekla er det som virkelig henter henne opp. min:20 er ekte minstemål nord
 // for 62°N, og Meløy ligger godt nord for det.
 {k:"sild",n:"Sild",z:0,zb:1,zbw:14,pull:0.25,w:30,len:[20,36],kg:9,pris:8,col:"#9fb4c4",shape:"streak",rar:0,fight:0.1,min:20,dg:[0.9,1.2,0.7,1.3],syn:true,ss:[1.5,1.4,1.2,0.8,0.5,0.4,0.4,0.5,0.7,1.0,1.3,1.5]},
 {k:"blastal",n:"Blåstål",z:0,zb:1,zbw:10,pull:0.8,w:26,len:[24,40],kg:6,pris:180,col:"#2f6ea0",shape:"deep",rar:1,fight:0.35,dg:[0.05,0.4,1.3,0.4],syn:true,ss:[0.05,0.05,0.1,0.3,0.7,1.2,1.5,1.5,1.2,0.5,0.1,0.05],str:0.15},
 {k:"lysing",n:"Lysing",z:1,pull:1.2,w:8,len:[45,100],kg:7,pris:220,col:"#8b8f96",shape:"torpedo",rar:1,fight:0.45,min:30,dg:[2.0,1.2,0.7,1.4],str:0.85},
 {k:"uer",n:"Uer",z:2,zb:3,pull:1.1,w:38,len:[32,46],kg:16,pris:260,col:"#c0392b",shape:"deep",rar:0,fight:0.1,min:32,fredet:"uer",str:0.3}, // kg kalibrert: 46 cm ≈ 1,5 kg
 {k:"rodspette",n:"Rødspette",z:2,bunn:true,pull:0.8,w:45,len:[25,46],kg:9,pris:200,col:"#8a7d5a",shape:"flat",rar:1,fight:0.3,min:29,dg:[0.5,1.0,1.2,1.0]},
 {k:"brungylt",n:"Brungylt",z:2,pull:0.9,w:22,len:[15,30],kg:5,pris:180,col:"#6b5540",shape:"deep",rar:1,fight:0.3,dg:[0.05,0.4,1.3,0.4],ss:[0.05,0.05,0.1,0.3,0.7,1.2,1.5,1.5,1.2,0.5,0.1,0.05],str:0.15},
 {k:"brosme",n:"Brosme",z:2,zb:3,pull:1.4,w:60,len:[42,82],kg:7,pris:300,col:"#7a6a4f",shape:"eel",rar:0,fight:0.2,str:0.3},
 {k:"lange",n:"Lange",z:2,zb:3,pull:1.8,w:38,len:[60,120],kg:8,pris:420,col:"#5c6b4a",shape:"eel",rar:0,fight:0.2,str:0.85},
 {k:"blaalange",n:"Blålange",z:2,zb:3,pull:1.7,w:8,len:[70,140],kg:7,pris:380,col:"#4a5a6b",shape:"eel",rar:1,fight:0.2,freda:true},
 {k:"skate",n:"Storskate",z:2,zb:3,bunn:true,pull:2.1,w:8,len:[90,180],kg:12,pris:420,col:"#6b5d52",shape:"flat",rar:1,fight:0.6,freda:true},
 {k:"haagjel",n:"Hågjel",z:3,pull:0.9,w:45,len:[40,68],kg:5,pris:320,col:"#7a7268",shape:"shark",rar:0,fight:0.35},
 {k:"havmus",n:"Havmus",z:3,pull:0.9,w:30,len:[55,100],kg:4,pris:380,col:"#8e8496",shape:"eel",rar:1,fight:0.3},
 {k:"svarthaa",n:"Svarthå",z:3,pull:0.8,w:22,len:[30,55],kg:5,pris:340,col:"#3a3f4a",shape:"shark",rar:1,fight:0.4},
 {k:"blaakveite",n:"Blåkveite",z:3,bunn:true,pull:1.7,w:22,len:[55,100],kg:12,pris:700,col:"#4d5a66",shape:"flat",rar:0,fight:0.5},
 {k:"steinbit",n:"Steinbit",z:2,allZ:true,pull:1.5,w:18,len:[50,125],kg:11,pris:380,col:"#5b6570",shape:"eel",rar:1,fight:0.55,ss:[0.5,0.5,1.2,1.4,1.5,1.3,1.0,1.0,1.0,0.9,0.6,0.5],str:0.3}, // biter på ALLE dyp
 {k:"piggha",n:"Pigghå",z:2,pull:2.3,w:14,len:[60,100],kg:5,pris:1400,col:"#7d8890",shape:"shark",rar:2,fight:0.5,freda:true},
 {k:"makrellstorje",n:"Makrellstørje",z:0,pull:2.9,w:3,len:[150,300],kg:19,pris:2500,col:"#2b4a66",shape:"torpedo",rar:2,reelSec:1800,fight:1.0,ss:[0,0,0,0,0,0,1.4,1.6,1.6,1.2,0,0]}, // ~45-60 min kamp
 {k:"breiflabb",n:"Breiflabb",z:1,bunn:true,pull:1.9,w:4,len:[60,150],kg:20,pris:2200,col:"#5a4a3a",shape:"flat",rar:2,fight:0.25},
 {k:"maanefisk",n:"Månefisk",z:0,pull:2.2,w:2,len:[80,200],kg:30,pris:3000,col:"#9aa4ad",shape:"deep",rar:2,reelSec:300,fight:0.3,ss:[0,0,0,0,0.2,0.8,1.6,1.8,1.2,0.3,0,0]}, // sjelden sommergjest — diger, men godslig (~5 min kamp)
 {k:"haakjerring",n:"Håkjerring",z:3,pull:3.4,w:3,len:[220,450],kg:11,reelSec:900,pris:3500,col:"#5d564e",shape:"shark",rar:2,fight:0.9}, // dyphavets kjempe — ~30 min kamp, kan veie over 1000 kg
 {k:"rognkjeks",n:"Rognkjeks",z:0,pull:0.6,w:26,len:[30,50],kg:22,pris:90,col:"#6b7a5c",shape:"deep",rar:1,fight:0.2,ss:[0.6,1.4,1.6,1.6,1.3,0.5,0.2,0.2,0.2,0.3,0.4,0.5]}, // hunnen — rund som en kokosbolle
 {k:"rognkall",n:"Rognkall",z:0,pull:0.65,w:18,len:[28,42],kg:24,pris:70,col:"#b04a30",shape:"deep",rar:1,fight:0.25,ss:[0.6,1.4,1.6,1.6,1.3,0.5,0.2,0.2,0.2,0.3,0.4,0.5]}, // hannen, rød i gytetida — han vokter rogna
 {k:"aalekvabbe",n:"Ålekvabbe",z:0,bunn:true,pull:0.5,w:20,len:[20,45],kg:4,pris:45,col:"#7a6b45",shape:"eel",rar:1,fight:0.15}, // føder levende unger, grønne bein
 {k:"akkar",n:"Akkar",z:1,zb:2,zbw:20,pull:0.8,w:16,len:[25,60],kg:6,pris:150,col:"#8a4a5c",shape:"eel",rar:1,fight:0.4,dg:[1.8,1.2,0.5,1.5],ss:[1.4,1.1,0.6,0.3,0.2,0.2,0.2,0.3,0.6,1.2,1.6,1.6]}, // storakkar — vintergjest, kan utebli i årevis
 {k:"skolest",n:"Skolest",z:3,pull:1.0,w:26,len:[45,100],kg:2,pris:320,col:"#6b7078",shape:"eel",rar:1,fight:0.2}, // nesten bare hale
 {k:"haabrann",n:"Håbrann",z:1,zb:2,zbw:14,pull:2.8,w:5,len:[150,300],kg:10,reelSec:1500,pris:0,col:"#46586b",shape:"shark",rar:2,fight:0.95,freda:true,dg:[0.6,1.5,1.0,1.5],ss:[0.4,0.4,0.5,0.7,1.0,1.3,1.5,1.5,1.3,1.0,0.6,0.4]}, // totalfreda siden 2010 — settes alltid ut
 {k:"kveite",n:"Kveite",z:2,bunn:true,pull:3.2,w:6,len:[84,138],kg:14,pris:6000,col:"#6d7c63",shape:"flat",trophy:true,rar:2,fight:0.85,min:84,fredet:"kveite",ss:[0.6,0.6,0.6,0.8,0.9,0.9,1.0,1.3,1.4,1.6,1.4,0.8],str:1.0} // maks ~40 kg — større er urealistisk å få i båten
];
var SLUK=[
 // Signaturarten står FØRST i hver b:{}. Tallene under 1 er like viktige som de over:
 // uten demping stiger hele puljen sammen og signaturen forsvinner i normaliseringen.
 {k:"blink",e:"🥄",n:"Blink",pris:15,rec:[0],img:"blink-sluk",b:{makrell:3,sei:0.7,sandflyndre:0.7}},
 {k:"spinner",e:"🌀",n:"Spinner",pris:25,rec:[0],img:"sluk-spinner.gif",b:{lyr:4.5,sei:0.6,sandflyndre:0.7}},
 {k:"dupp",e:"🎈",n:"Dupp og mark",pris:20,rec:[0],img:"dupp",b:{sandflyndre:4.6,berggylte:1.7,sei:0.55,makrell:0.55,lyr:0.7}},
 {k:"gummimakk",e:"🪱",n:"Gummimakk",pris:30,rec:[0,1],img:"gummimakk",b:{hyse:1.3,sandflyndre:2,knurr:1.7,lomre:1.3,sei:0.75,makrell:0.7,torsk:0.6}},
 {k:"sildeforsats",e:"✨",n:"Seiforsats",pris:40,rec:[0,1],img:"sildeforsats",b:{sei:3.6,sild:7.5,akkar:1.4,makrell:1.3,torsk:0.6,hyse:0.6}}, // het «Sildeforsats», men løfter sei og starter ikke hekle-minispillet — navnet var en felle ved siden av Sildehekla
 {k:"wobbler",e:"🐠",n:"Wobbler",pris:45,rec:[0,1],img:"sluk-wobbler.gif",b:{lyr:3.2,lysing:1.7,sei:0.8,sild:0.8,torsk:0.55,hyse:0.55}},
 {k:"torskepilk",e:"🎣",n:"Torskepilk",pris:50,rec:[1],img:"torskepilk",b:{torsk:1.5,hyse:0.75,lyr:0.8}},
 {k:"juksa",e:"🧵",n:"Juksa",pris:60,rec:[1],img:"sluk-juksa.gif",b:{hyse:1.6,torsk:0.55}},
 {k:"gummijigg",e:"🦎",n:"Gummijigg",pris:55,rec:[1,2],img:"sluk-gummijigg.gif",b:{lange:3.5,lyr:2.2,lysing:1.6}},
 {k:"pirk",e:"⚓",n:"Pirk",pris:80,rec:[1,2],img:"sluk-mellomdyp",b:{uer:3.4,hyse:1.25,torsk:0.7,brosme:0.8,lange:0.8}},
 {k:"svenskepilk",e:"🇸🇪",n:"Svenskepilk",pris:90,rec:[1,2],img:"sluk-svenskepilk.gif",b:{torsk:1.4,uer:0.6,lange:0.6,brosme:0.55}},
 {k:"dyppilk",e:"🌑",n:"Djuphavspilk",pris:120,rec:[2],img:"sluk-djuphavs",b:{lange:3.2,uer:0.8,brosme:0.7}},
 {k:"lysende",e:"💡",n:"Selvlysende pilk",pris:150,rec:[2,3],img:"sluk-lysende.gif",b:{brosme:2.7,havmus:1.7,akkar:1.5,haagjel:0.8,blaakveite:0.8}},
 {k:"kveitepilk",e:"🏆",n:"Kveitepilk",pris:250,rec:[2],img:"sluk-kveitepilk.gif",b:{torsk:1.9,kveite:1.6,brosme:0.7,lange:0.8}},
 {k:"agnrigg",e:"🪢",n:"Djuphavs-agnrigg",pris:250,rec:[3],img:"sluk-agnrigg",b:{haagjel:4.2,skolest:1.6,uer:1.3,lange:0.8,brosme:0.6}},
 {k:"storpirk",e:"🦈",n:"Storpirk",pris:300,rec:[3],img:"sluk-storpilk.gif",b:{blaakveite:7.4,svarthaa:1.3,lange:1.3,uer:0.7,haagjel:0.7,brosme:0.6}},
 {k:"kjeks",e:"🍪",n:"Kjekssluk",pris:10,rec:[0],img:"sluk-oreo.gif",dud:true,b:{}}, // spøkesluk: fisk har IKKE søtsug — «Den er til kaffen.» — Rusten
 {k:"markpilk",e:"🪱",n:"Markpilk",pris:90,rec:[0,1],img:"sluk-markpilk",pilk:true,b:{}}, // forsats med mange makker — pump og hent småfisk (juksa-teknikk)
 // Sildehekle: forsats med små kroker og røde perler som ligner tyttebær. Båten står i
 // ro og man pumper hekla opp og ned gjennom stimen — samme minispill som markpilken,
 // men den henter sild. Teknikken er beskrevet av eierens svigerfar.
 {k:"sildehekle",e:"🫐",n:"Sildehekle",pris:70,rec:[0,1],img:"sluk-sildehekle",pilk:true,sild:true,b:{}}
];var AGN=[
 {k:"makrellhode",e:"🐟",n:"Makrellhode",pris:120,pakke:4,b:{blaakveite:7.5,kveite:2.2,breiflabb:1.8,haakjerring:1.7,haabrann:1.6,skate:1.5,lange:1.6,steinbit:1.3,haagjel:0.8,uer:0.7,brosme:0.6}},
 {k:"sei",e:"🐟",n:"Seibiter",pris:100,pakke:4,b:{lange:3,lysing:1.5,piggha:1.3,torsk:1.3,uer:0.7,brosme:0.6}},
 {k:"sild",e:"🐟",n:"Sild",pris:100,pakke:4,b:{sei:2.4,haabrann:1.7,torsk:1.4,lyr:1.4}},
 {k:"akkar",e:"🦑",n:"Akkar",pris:160,pakke:4,b:{torsk:1.4,skolest:1.5,havmus:1.4,svarthaa:1.4,kveite:1.4,brosme:1.3,lange:1.3,hyse:0.7}},
 {k:"reke",e:"🦐",n:"Reker",pris:80,pakke:4,b:{sandflyndre:2.6,uer:2,hyse:1.6,hvitting:1.6,rodspette:1.5,lomre:1.5,blastal:1.5,rognkjeks:1.5,rognkall:1.5,skrubbe:1.4,brungylt:1.4,berggylte:1.4,makrell:0.6,sei:0.6,brosme:0.7,lange:0.7,torsk:0.55}},
 {k:"borstemark",e:"🪱",n:"Børstemark",pris:80,pakke:4,b:{sandflyndre:4.6,aalekvabbe:1.7,skrubbe:1.6,rodspette:1.6,lomre:1.6,hyse:1.4,berggylte:1.4,knurr:1.4,rognkjeks:1.4,makrell:0.55,sei:0.55,lyr:0.7}},
 {k:"polsebiter",e:"🌭",n:"Pølsebiter",pris:50,pakke:4,b:{torsk:1.35,knurr:1.3,skrubbe:1.2,sandflyndre:1.2}},
 {k:"blaaskjell",e:"🐚",n:"Blåskjell",pris:60,pakke:4,b:{steinbit:1.7,berggylte:1.5,brungylt:1.4,hyse:1.3,torsk:0.7}},
 {k:"fiskeboller",e:"🥣",n:"Fiskeboller",pris:50,pakke:4,b:{sei:1.9,lyr:1.4,hvitting:1.2,sandflyndre:0.8,makrell:0.8}},
 {k:"brunost",e:"🧀",n:"Brunost",pris:70,pakke:4,b:{uer:3.2,berggylte:1.2,hyse:1.3,lange:0.7,torsk:0.7,brosme:0.6}},
 {k:"bacon",e:"🥓",n:"Bacon",pris:90,pakke:4,b:{torsk:1.3,steinbit:1.3,knurr:1.3,sei:1.3,hyse:0.7}},
 {k:"krabbe",e:"🦀",n:"Krabbeagn",pris:0,pakke:0,kunFangst:true,b:{uer:3.5,steinbit:1.8,berggylte:1.5,torsk:1.3,lange:0.7,brosme:0.6}},
 {k:"rustenspesial",e:"✨",n:"Rustens Spesialagn",pris:200,pakke:1,rar:1.5},
 {k:"rustensuper",e:"💎",n:"Rustens Superagn",pris:2000,pakke:1,superLegend:true} // garantert legendar på Djuphavet + bedøver (halv kamptid)
];
var slukDef={};SLUK.forEach(function(u){slukDef[u.k]=u});
var agnDef={};AGN.forEach(function(a){agnDef[a.k]=a});
var ZONE=["Grunt","Mellomdyp","Dypt","Djuphavet"], DEPM=["0-50 m","50-150 m","150-300 m","300-500 m"];
function iSona(f,d){ return f.z===d||f.zb===d||f.allZ; }
function fordeling(rig,d){
  var ag=agnDef[rig]||null, su=(slukDef[rig]&&slukDef[rig].rec.indexOf(d)>=0)?slukDef[rig]:null;
  if(!rig) ag=su=null;
  function rigB(f){ var b=1; if(ag&&ag.b&&ag.b[f.k])b*=ag.b[f.k]; if(su&&su.b&&su.b[f.k])b*=su.b[f.k]; return b; }
  var zf=FISH.filter(function(f){return iSona(f,d)&&f.k!=="makrellstorje"});
  var t0=zf.filter(function(f){return !f.rar}), t1=zf.filter(function(f){return f.rar===1}), t2=zf.filter(function(f){return f.rar===2});
  var base=t0.length?t0:zf;
  function vekt(pl){ var raw=pl.map(function(f){return (f.zb===d&&f.zbw)?f.zbw:f.w;});
    var tot=0; raw.forEach(function(w){tot+=w}); if(!tot)return raw;
    var v=raw.map(function(w,i){return w/tot*rigB(pl[i]);});
    var sum=0,mx=0,mi=0; v.forEach(function(x,i){sum+=x; if(x>mx){mx=x;mi=i}});
    if(sum>0&&pl.length>1&&mx>0.85*sum) v[mi]=(sum-mx)*(0.85/0.15);
    return v; }
  function andel(pl){ var v=vekt(pl),t=0; v.forEach(function(x){t+=x}); var o={}; pl.forEach(function(f,i){o[f.k]=v[i]/t}); return o; }
  var ut={};
  var pB=andel(base); for(var k in pB) ut[k]=pB[k]*0.974;
  if(t1.length&&t1!==base){ var pR=andel(t1); for(var k2 in pR) ut[k2]=(ut[k2]||0)+pR[k2]*0.0133; }
  if(t2.length){ var pL=andel(t2); for(var k3 in pL) ut[k3]=(ut[k3]||0)+pL[k3]*0.0067; }
  return ut;
}
var RIGG=[].concat(SLUK.filter(function(u){return !u.pilk&&!u.dud}).map(function(u){return {k:u.k,n:u.n,t:"sluk",pris:u.pris,rec:u.rec,b:u.b};}),
                   AGN.filter(function(a){return !a.rar&&!a.superLegend}).map(function(a){return {k:a.k,n:a.n,t:"agn",pris:a.pris,rec:[0,1,2,3],b:a.b};}));
var NAVN={}; FISH.forEach(function(f){NAVN[f.k]=f.n;});
var RAR={}; FISH.forEach(function(f){RAR[f.k]=f.rar||0;});
var UT={rigg:[], art:{}, navn:NAVN};
RIGG.forEach(function(r){
  var rad={n:r.n,k:r.k,type:r.t,pris:r.pris,soner:r.rec.map(function(d){return ZONE[d]}),loft:[]};
  for(var b in r.b) rad.loft.push({art:b,f:r.b[b]});
  rad.loft.sort(function(a,c){return c.f-a.f});
  rad.effekt=[];
  r.rec.forEach(function(d){
    var u=fordeling(null,d), m=fordeling(r.k,d);
    Object.keys(m).forEach(function(a){
      var f=(m[a]||0)/((u[a]||1e-9));
      var nemnd=!!(r.b&&r.b[a]&&r.b[a]>1);
      if(f>1.05&&(m[a]>0.004||nemnd)) rad.effekt.push({sone:ZONE[d],art:a,navn:NAVN[a],rar:RAR[a],utan:+( (u[a]||0)*100).toFixed(1),med:+((m[a])*100).toFixed(1),faktor:+f.toFixed(2)});
    });
  });
  rad.effekt.sort(function(a,c){return c.faktor-a.faktor});
  UT.rigg.push(rad);
});
FISH.forEach(function(f){
  var best=[];
  RIGG.forEach(function(r){
    r.rec.forEach(function(d){
      if(!iSona(f,d))return;
      var u=fordeling(null,d), m=fordeling(r.k,d);
      if(!m[f.k])return;
      best.push({rigg:r.n,type:r.t,sone:ZONE[d],andel:+(m[f.k]*100).toFixed(2),faktor:+((m[f.k]/(u[f.k]||1e-9))).toFixed(2)});
    });
  });
  best.sort(function(a,c){return c.andel-a.andel});
  if(best.length) UT.art[f.k]={navn:f.n, sjelden:f.rar||0, beste:best.slice(0,4)};
});
require("fs").writeFileSync("/tmp/rapport.json", JSON.stringify(UT,null,1));
console.log("rigger:", UT.rigg.length, " arter:", Object.keys(UT.art).length);
