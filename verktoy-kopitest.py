# -*- coding: utf-8 -*-
"""
Regresjonstest for sikkerhetskopien (eksport/import av fangstboka).

Dette er den mest kritiske koden i prosjektet: den skal kunne hente tilbake alt
etter en tapt telefon, og den skal ALDRI krympe noe som allerede finnes lokalt.
Testen henter funksjonene ut av fiske.html slik de faktisk står, og kjører fire
scenarier i node — inkludert at en ødelagt fil ikke rører data i det hele tatt.

Kjør:  python3 verktoy-kopitest.py
"""
import io, os, re, subprocess, sys, tempfile

ROT = os.path.dirname(os.path.abspath(__file__))
KILDE = os.path.join(ROT, "fiske.html")

NODVENDIGE = ["famFarlig", "egen", "flettDager", "famFlett", "gearUt", "gearFersk",
              "gearLoft", "gearInn", "newPlayer", "flettTrofe", "flettInvest",
              "bestillingsDag", "flettTips", "flettBestilling",  # bestillinger og tips (PLAN-BESTILLINGER.md)
              "flettInnboks", "famCode", "lagKopi", "lesKopi", "kopiFilnavn"]

STUBBER = """
var DB={players:{},last:null}, P=null, store={};
var localStorage={getItem:function(k){return store[k]||null;},setItem:function(k,v){store[k]=v;}};
function saveAll(){} function renderPlayers(){} function hud(){} function notice(){}
function investInit(){} function trofeDef(){return {};} function innLegg(){} var fiskerVed={};
"""

SCENARIO = r"""
let feil = 0;
function sjekk(n, ok, d){ console.log((ok?"  OK   ":"  FEIL ")+n+(d?"   "+d:"")); if(!ok)feil++; }
function nullstill(){ for(const k of Object.keys(DB.players)) delete DB.players[k]; DB.last=null; }
function rik(namn){ return Object.assign(newPlayer(namn), {
  kr:250000, fuel:24, rod:2, vinsj:true, ekko:true, turbo:true, belte:true,
  lures:{dyppilk:9}, tidMs:900000, streakBest:12,
  caught:{kveite:{count:3,bestLen:187,bestWt:71.2}, torsk:{count:40,bestLen:98,bestWt:9}},
  trofe:[{k:"vikinghjelm",ts:5},{k:"solvbarre",ts:9}],
  funnSett:{vikinghjelm:1,solvbarre:1}, dager:{"2026-08-01":3} }); }

console.log("1. RUNDTUR");
nullstill(); DB.players["Kari"]=rik("Kari"); DB.last="Kari";
const fila = lagKopi();
nullstill();
const r1 = lesKopi(fila); const k = DB.players["Kari"];
sjekk("profilen kom tilbake", !!k);
sjekk("kroner urort", k && k.kr===250000);
sjekk("trofeskapet urort", k && k.trofe && k.trofe.length===2);
sjekk("kveiterekorden urort", k && k.caught.kveite.bestLen===187);
sjekk("meldt som ny", r1.nye===1 && r1.flettet===0);

console.log("\n2. ALDRI KRYMPE");
nullstill();
DB.players["Kari"]=Object.assign(rik("Kari"), {kr:900000, tidMs:5000000, streakBest:30,
  caught:{kveite:{count:9,bestLen:210,bestWt:99}},
  trofe:[{k:"vikinghjelm",ts:5},{k:"solvbarre",ts:9},{k:"rolex",ts:11}]});
lesKopi(fila); const k2 = DB.players["Kari"];
sjekk("kroner krympa ikkje", k2.kr===900000, "kr="+k2.kr);
sjekk("spilletid krympa ikkje", k2.tidMs===5000000);
sjekk("streakrekord krympa ikkje", k2.streakBest===30);
sjekk("kveiterekord krympa ikkje", k2.caught.kveite.bestLen===210);
sjekk("trofeskapet krympa ikkje", k2.trofe.length>=3);

console.log("\n3. FILA LOFTAR EIN FATTIG PROFIL");
nullstill(); DB.players["Kari"]=Object.assign(newPlayer("Kari"), {kr:40});
lesKopi(fila); const k3 = DB.players["Kari"];
sjekk("kroner lofta", k3.kr===250000);
sjekk("trofea kom med", k3.trofe && k3.trofe.length===2);
sjekk("utstyret kom med", k3.vinsj===true && k3.ekko===true);

console.log("\n4. SIKKERHEIT OG SOPPEL");
nullstill();
lesKopi(JSON.stringify({app:"jakten-paa-storkveita",format:1,players:{"__proto__":{kr:1},"Ok":{kr:5}}}));
sjekk("__proto__ avvist", !Object.prototype.hasOwnProperty.call(DB.players,"__proto__") && ({}).kr===undefined);
sjekk("gyldig profil kom med", !!DB.players["Ok"]);
sjekk("ugyldig JSON gir feil", !!lesKopi("ikkje json").feil);
sjekk("feil app gir feil", !!lesKopi(JSON.stringify({app:"anna",players:{}})).feil);
nullstill(); DB.players["Kari"]=rik("Kari");
const foer = JSON.stringify(DB.players["Kari"]);
lesKopi("tull");
sjekk("odelagt fil rorte ingenting", JSON.stringify(DB.players["Kari"])===foer);

console.log("");
process.exit(feil ? 1 : 0);
"""


def hent(s, navn):
    m = re.search(r'^function %s\s*\(' % re.escape(navn), s, re.M)
    if not m:
        sys.exit("FEIL: fant ikke «%s» i fiske.html. Er den døpt om? "
                 "Da må denne testen oppdateres." % navn)
    i = s.index('{', m.end() - 1)
    d = 0
    j = i
    while j < len(s):
        if s[j] == '{':
            d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0:
                return s[m.start():j + 1]
        j += 1
    sys.exit("FEIL: fant ikke slutten på «%s»." % navn)


def main():
    s = io.open(KILDE, encoding='utf-8').read()
    kode = STUBBER + "\n\n".join(hent(s, n) for n in NODVENDIGE) + SCENARIO
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(kode)
        sti = f.name
    try:
        r = subprocess.run(["node", sti], capture_output=True, text=True)
        print(r.stdout.strip())
        if r.stderr.strip():
            print(r.stderr.strip())
        if r.returncode == 0:
            print("✓ BESTÅTT — kopien henter tilbake alt, og krymper aldri noe.")
        else:
            print("✗ STRYK — se linjene merket FEIL over.")
        return r.returncode
    finally:
        os.unlink(sti)


if __name__ == "__main__":
    sys.exit(main())
