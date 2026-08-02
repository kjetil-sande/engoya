# -*- coding: utf-8 -*-
"""
Regresjonstest for datatapet i navnebytte-foldingen.

Bakgrunn: famTaImot() folder et gammelt navn inn i et nytt når noen bytter navn.
Vernet på «if(!fra.remote)return;» beskyttet KILDEN, men ikke MÅLET. En ekte lokal
profil kunne dermed bli foldemål, få remote=true, og få kroner, bensin, sluker og
agn overskrevet av en annen spillers tall — for så å bli slettet av opprydningen
ved neste synk. Målt: 250 000 kr → 17 kr → borte.

Testen henter funksjonene ut av fiske.html slik de faktisk står, og kjører
scenarioet i node. Den kjører det TO ganger: én gang med vakta, og én gang med
vakta fjernet. Består begge, er testen tom og sier fra — det er den fella jeg
gikk i første gang jeg skrev den.

Kjør:  python3 verktoy-datatapstest.py
"""
import io, os, re, subprocess, sys, tempfile

ROT = os.path.dirname(os.path.abspath(__file__))
KILDE = os.path.join(ROT, "fiske.html")
VAKT = "if(egen(DB.players,nytt)&&!DB.players[nytt].remote)return;"

NODVENDIGE = ["famFarlig", "egen", "flettDager", "famFlett", "gearUt", "gearFersk",
              "gearLoft", "gearInn", "famTaImot", "newPlayer", "chosen",
              "flettTrofe", "flettInvest", "flettInnboks"]

STUBBER = """
var DB={players:{},kode:null}, P=null;
function saveAll(){} function hud(){} function renderPlayers(){} function updateDepthLocks(){}
function updateRigChip(){} function updatePotBtn(){} function notice(){} function syncFam(){}
function investInit(){ if(!P.invest)P.invest={}; }
function trofeDef(){return {};} function innLegg(){} var fiskerVed={};
function $(){return {classList:{add:function(){},remove:function(){},toggle:function(){}},
  style:{},textContent:"",innerHTML:""};}
"""

SCENARIO = """
// To enheter på samme familiekode.
//  · iPaden har et SPEIL av «Nina» og en EKTE lokal «Kari» med 250 000 kr.
//  · På telefonen døper «Nina» seg om til «Kari» — et navn telefonen ikke har lokalt,
//    så byttNavn slipper det gjennom.
//  · Serveren sletter ALDRI det gamle navnet og bærer tidligereNavn videre for alltid
//    (familierekorder.mjs), så begge navn står i familiebildet. Det er dét som
//    bygger doptOm og utløser foldingen.
DB.players["Nina"]  = Object.assign(newPlayer("Nina"),
  {remote:true, kr:17, fuel:3, lures:{blink:1}, ts:1000});
DB.players["Kari"]  = Object.assign(newPlayer("Kari"),
  {kr:250000, fuel:24, rod:2, lures:{dyppilk:9},
   trofe:[{k:"vikinghjelm",ts:5}], caught:{kveite:{count:3,bestLen:180}}});
delete DB.players["Kari"].remote;                  // chosen() gjør dette
DB.players["Pappa"] = Object.assign(newPlayer("Pappa"), {kr:500});
delete DB.players["Pappa"].remote;
P = DB.players["Pappa"];                            // en ANNEN spiller er aktiv

famTaImot({ kode:"ABCD", players:{
  "Nina":  { ts:1000, kr:17,  caught:{sei:{count:1,bestLen:40}}, gear:{fuel:3, lures:{blink:1}, rod:0} },
  "Kari":  { ts:9999, kr:17,  caught:{sei:{count:1,bestLen:40}},
             gear:{ tidligereNavn:"Nina", fuel:3, lures:{blink:1}, rod:0, kr:17 } },
  "Pappa": { ts:1,    kr:500, caught:{} }
}});

// … og deretter en synk mot et familiebilde UTEN «Kari» — der slo slettingen til.
famTaImot({ kode:"ABCD", players:{ "Pappa":{ts:2, kr:500, caught:{}} } });

var k = DB.players["Kari"];
var ok = !!k && k.kr === 250000 && !k.remote && k.fuel === 24
      && k.trofe && k.trofe.length === 1
      && k.caught && k.caught.kveite && k.caught.kveite.bestLen === 180;
console.log(JSON.stringify({
  finst: !!k, kr: k && k.kr, remote: k && k.remote, fuel: k && k.fuel,
  lures: k && k.lures, trofe: k && k.trofe && k.trofe.length
}));
process.exit(ok ? 0 : 1);
"""


def hent_funksjon(s, navn):
    m = re.search(r'^function %s\s*\(' % re.escape(navn), s, re.M)
    if not m:
        sys.exit("FEIL: fant ikke funksjonen «%s» i fiske.html. "
                 "Er den døpt om? Da må denne testen oppdateres." % navn)
    i = s.index('{', m.end() - 1)
    dybde = 0
    j = i
    while j < len(s):
        if s[j] == '{':
            dybde += 1
        elif s[j] == '}':
            dybde -= 1
            if dybde == 0:
                return s[m.start():j + 1]
        j += 1
    sys.exit("FEIL: fant ikke slutten på «%s»." % navn)


def kjor(kode, merkelapp):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(kode)
        sti = f.name
    try:
        r = subprocess.run(["node", sti], capture_output=True, text=True)
        return r.returncode, (r.stdout + r.stderr).strip()
    finally:
        os.unlink(sti)


def main():
    s = io.open(KILDE, encoding='utf-8').read()

    if s.count(VAKT) != 1:
        sys.exit("FEIL: fant ikke vakta som skal beskytte foldemålet "
                 "(%d treff). Er den fjernet? Da er datatapet tilbake." % s.count(VAKT))

    kode = STUBBER + "\n\n".join(hent_funksjon(s, n) for n in NODVENDIGE) + "\n" + SCENARIO

    kode_uten = kode.replace(VAKT, "/* vakta fjernet — kontrollkjøring */")
    if kode_uten == kode:
        sys.exit("FEIL: klarte ikke å fjerne vakta fra uttrekket.")

    rc_med, ut_med = kjor(kode, "med vakt")
    rc_uten, ut_uten = kjor(kode_uten, "uten vakt")

    print("MED vakta   :", ut_med.splitlines()[-1] if ut_med else "(ingen utskrift)")
    print("UTEN vakta  :", ut_uten.splitlines()[-1] if ut_uten else "(ingen utskrift)")
    print()

    if rc_med != 0:
        print("✗ STRYK — profilen blir ødelagt selv MED vakta på plass.")
        return 1
    if rc_uten == 0:
        print("✗ TESTEN ER TOM — den består også uten vakta, altså treffer")
        print("  scenarioet ikke lenger feilen. Testen må skrives om før den")
        print("  kan brukes som bevis på noe som helst.")
        return 1

    print("✓ BESTÅTT — profilen står urørt med vakta, og ryker uten den.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
