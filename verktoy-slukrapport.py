# -*- coding: utf-8 -*-
"""
Sluk- og agnrapport for «Jakten på storkveita» — PDF.

Tallene hentes UT AV fiske.html og kjøres gjennom spillets egen trekning, med
døgn, vær, sesong og strøm nøytralisert — så tabellen viser ren rigg-effekt.
Endres SLUK- eller AGN-tabellene i spillet, må rapporten lages på nytt:

    node verktoy-rapportdata.js && python3 verktoy-slukrapport.py

Krever reportlab (pip install reportlab).
"""
import json, datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)

D = json.load(open('/tmp/rapport.json'))
NAVN = D.get('navn', {})
UT = '/Users/kjetilsande/Documents/Claude/Engøya/Sluk-og-agn-rapport.pdf'

SJO   = colors.HexColor('#1d4e63')
DJUP  = colors.HexColor('#0f2c3a')
TRE   = colors.HexColor('#8a6a3d')
LYS   = colors.HexColor('#f4efe4')
GRA   = colors.HexColor('#e7e1d3')
GRONN = colors.HexColor('#3f8f5f')
ROD   = colors.HexColor('#b3402c')

def st(n, **kw):
    base = dict(fontName='Helvetica', fontSize=9.5, leading=13.5,
                textColor=colors.HexColor('#22282b'))
    base.update(kw)
    return ParagraphStyle(n, **base)

H1   = st('H1', fontName='Helvetica-Bold', fontSize=21, leading=25, textColor=DJUP, spaceAfter=3)
SUB  = st('SUB', fontSize=10.5, leading=14, textColor=colors.HexColor('#5d6b70'), spaceAfter=13)
H2   = st('H2', fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=SJO,
          spaceBefore=15, spaceAfter=5)
H3   = st('H3', fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=TRE,
          spaceBefore=9, spaceAfter=3)
P    = st('P', spaceAfter=6)
LIT  = st('LIT', fontSize=8.2, leading=11, textColor=colors.HexColor('#6a747a'))
CELL = st('CELL', fontSize=8.4, leading=10.8)
CELB = st('CELB', fontName='Helvetica-Bold', fontSize=8.4, leading=10.8)
TH   = st('TH', fontName='Helvetica-Bold', fontSize=8.2, leading=10.5, textColor=colors.white)

def tabell(data, bredder, hoegre=()):
    t = Table(data, colWidths=bredder, repeatRows=1, hAlign='LEFT')
    s = [('BACKGROUND', (0,0), (-1,0), SJO),
         ('VALIGN', (0,0), (-1,-1), 'TOP'),
         ('TOPPADDING', (0,0), (-1,-1), 4),
         ('BOTTOMPADDING', (0,0), (-1,-1), 4),
         ('LEFTPADDING', (0,0), (-1,-1), 5),
         ('RIGHTPADDING', (0,0), (-1,-1), 5),
         ('LINEBELOW', (0,0), (-1,-2), 0.4, GRA),
         ('BOX', (0,0), (-1,-1), 0.6, GRA)]
    for i in range(1, len(data)):
        if i % 2 == 0:
            s.append(('BACKGROUND', (0,i), (-1,i), LYS))
    for c in hoegre:
        s.append(('ALIGN', (c,0), (c,-1), 'RIGHT'))
    t.setStyle(TableStyle(s))
    return t

def sidefot(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(colors.HexColor('#8a949a'))
    canvas.drawString(20*mm, 12*mm, 'Jakten på storkveita  ·  sluk og agn')
    canvas.drawRightString(A4[0]-20*mm, 12*mm, 'side %d' % doc.page)
    canvas.setStrokeColor(GRA); canvas.setLineWidth(0.5)
    canvas.line(20*mm, 15*mm, A4[0]-20*mm, 15*mm)
    canvas.restoreState()

F = []
idag = datetime.date.today().strftime('%d.%m.%Y')

# ─────────────────── FORSIDE ───────────────────
F.append(Spacer(1, 30*mm))
F.append(Paragraph('Sluk og agn', H1))
F.append(Paragraph('Hva biter på hva i «Jakten på storkveita» — målt i koden, %s' % idag, SUB))
F.append(Paragraph(
  'Denne rapporten er hentet rett ut av spillets egen kode og kjørt gjennom den ekte '
  'trekningen. Den er ikke en beskrivelse av hvordan det var ment å være — den er en '
  'måling av hva som faktisk skjer.', P))
F.append(Paragraph(
  '<b>Alle tall er regnet med døgn, årstid, vær og strøm slått av.</b> Det er med vilje: '
  'du ba om å se hva artene biter på generelt sett. I det virkelige spillet ligger de fire '
  'faktorene oppå dette og kan flytte tallene mye — en makrell i januar finnes nesten ikke, '
  'uansett hvilken sluk du har på.', P))
F.append(Spacer(1, 5*mm))

F.append(Paragraph('Tre ting en sluk gjør — og bare én av dem merkes med én gang', H2))
F.append(Paragraph(
  '<b>1. Riktig sone.</b> Den største enkelteffekten i spillet, og den har ingenting med hvilken '
  'sluk du velger å gjøre — bare om den hører til dypet du fisker på. Rett sone gir 85 % '
  'nappesjanse per fisk som kommer opp; feil sone gir 61 %. Ventetiden går fra 18 til 28 '
  'sekunder. Alle sluker som passer sonen er nøyaktig like gode her, og alt agn teller som '
  'riktig uansett dyp.', P))
F.append(Paragraph(
  '<b>2. Hvor lenge fisken snuser.</b> Feil sone gjør fisken tregere til å bestemme seg. '
  'Kjekssluken — spøkesluken — ganger tålmodigheten med 2,5 på toppen av det.', P))
F.append(Paragraph(
  '<b>3. Hvilken art som kommer.</b> Det er denne rapporten handler om, og den som var '
  'ødelagt fram til nå.', P))

F.append(Paragraph('Hva som var galt', H2))
F.append(Paragraph(
  'Familiens ivrigste spiller meldte at han ikke merket forskjell på sluker og agn etter '
  'noen hundre drag. Målingen ga ham rett — og fant noe verre: <b>to sluker gjorde sin egen '
  'signaturart sjeldnere.</b> Dupp og mark ga 9,9 % sandflyndre uten sluk og 8,7 % med. '
  'Blinken ga 35,0 % makrell uten og 33,6 % med. Å ta på riktig sluk ga færre av fisken den '
  'var laget for.', P))
F.append(Paragraph(
  'Årsaken var et tak inne i vektingen som klemte andelen før den ble normalisert. På Grunt '
  'kjører døgnrytmen for full styrke, så sei, lyr og makrell hadde allerede multiplikatorer '
  'på 2–3,5 og lå <i>på</i> taket før sluken ble nevnt. Blink presset både sei og makrell til '
  'nøyaktig samme verdi. Resultat: Blink og Seiforsats ga bokstavelig talt identisk fangst på '
  'Grunt — to helt ulike tabeller, samme utfall, 25 kroners prisforskjell.', P))
F.append(Paragraph(
  'Og til slutt regnestykket som avgjorde saken: ved 300 drag er den statistiske usikkerheten '
  '2,3 prosentpoeng. Alle signaturer på Grunt unntatt spinner mot lyr lå under ett '
  'standardavvik. <b>Han kunne fisket ti ganger så mye og fortsatt ikke sett det.</b>', P))
F.append(Paragraph(
  'Det er rettet nå. Hver sluk og hvert agn har fått én tydelig eier, og tallene under '
  'kommer fra den nye koden.', P))

F.append(PageBreak())

# ─────────────────── SLUKER ───────────────────
F.append(Paragraph('Slukene', H2))
F.append(Paragraph(
  'Kolonnen «biter oftere» viser hvor stor andel arten utgjør av fangsten din uten riggen, '
  'og med. Faktoren er hvor mange ganger oftere du får den. Bare arter som faktisk merkes '
  'er tatt med.', LIT))
F.append(Spacer(1, 3*mm))

for typ, tittel in (('sluk', 'Sluker'), ('agn', 'Agn')):
    if typ == 'agn':
        F.append(PageBreak())
        F.append(Paragraph('Agnene', H2))
        F.append(Paragraph(
          'Agn virker på alle dyp — de har ingen sone-begrensning slik slukene har, og de '
          'teller alltid som «riktig rigg». Til gjengjeld brukes de opp når fisken biter.', LIT))
        F.append(Spacer(1, 3*mm))
    for r in [x for x in D['rigg'] if x['type'] == typ]:
        blokk = []
        pris = ('%d kr' % r['pris']) if r['pris'] else 'fra teina'
        sone = ', '.join(r['soner']) if typ == 'sluk' else 'alle dyp'
        blokk.append(Paragraph('%s <font size=8 color="#8a949a">· %s · %s</font>'
                               % (r['n'], pris, sone), H3))
        eff = r['effekt'][:6]
        if eff:
            rad = [[Paragraph('Art', TH), Paragraph('Sone', TH), Paragraph('Uten', TH),
                    Paragraph('Med', TH), Paragraph('Ganger oftere', TH)]]
            for e in eff:
                sterk = e['faktor'] >= 2
                mrk = {0:'', 1:' <font size=6.5 color="#b3402c">sjelden</font>',
                       2:' <font size=6.5 color="#8a6a3d">legendarisk</font>'}[e.get('rar',0)]
                rad.append([Paragraph(e.get('navn') or e['art'].capitalize(), CELB if sterk else CELL) if not mrk
                            else Paragraph((e.get('navn') or e['art'].capitalize())+mrk, CELB if sterk else CELL),
                            Paragraph(e['sone'], CELL),
                            Paragraph('%.1f %%' % e['utan'], CELL),
                            Paragraph('%.1f %%' % e['med'], CELB if sterk else CELL),
                            Paragraph('&times;%.2f' % e['faktor'], CELB if sterk else CELL)])
            blokk.append(tabell(rad, [38*mm, 26*mm, 22*mm, 22*mm, 30*mm], hoegre=(2,3,4)))
        else:
            blokk.append(Paragraph('Ingen målbar artsvirkning.', LIT))
        demp = [l for l in r['loft'] if l['f'] < 1]
        if demp:
            blokk.append(Spacer(1, 1.5*mm))
            blokk.append(Paragraph('Demper: ' + ', '.join(
                '%s (&times;%.2g)' % (NAVN.get(d['art'], d['art']), d['f']) for d in demp), LIT))
        blokk.append(Spacer(1, 3*mm))
        F.append(KeepTogether(blokk))

# ─────────────────── ARTENE ───────────────────
F.append(PageBreak())
F.append(Paragraph('Artene — hva biter best på hva', H2))
F.append(Paragraph(
  'For hver art: de riggene som gir størst andel av den, med dypet du må stå på. '
  '«Andel» er hvor stor del av fangsten din arten utgjør med den riggen. Sjeldne og '
  'legendariske arter har lave tall fordi de bor i egne puljer som sjelden trekkes — '
  'men riggen løfter dem like sikkert inne i sin pulje.', LIT))
F.append(Spacer(1, 3*mm))

rad = [[Paragraph('Art', TH), Paragraph('Beste rigg', TH), Paragraph('Sone', TH),
        Paragraph('Andel', TH), Paragraph('Nest best', TH), Paragraph('Andel', TH)]]
for k in sorted(D['art'], key=lambda x: D['art'][x]['navn']):
    a = D['art'][k]
    b = a['beste']
    merke = {0: '', 1: ' <font size=7 color="#b3402c">sjelden</font>',
             2: ' <font size=7 color="#8a6a3d">legendarisk</font>'}[a['sjelden']]
    r2 = b[1] if len(b) > 1 else None
    rad.append([Paragraph(a['navn'] + merke, CELB),
                Paragraph(b[0]['rigg'], CELL),
                Paragraph(b[0]['sone'], CELL),
                Paragraph('%.1f %%' % b[0]['andel'], CELB),
                Paragraph(r2['rigg'] if r2 else '—', CELL),
                Paragraph('%.1f %%' % r2['andel'] if r2 else '—', CELL)])
F.append(tabell(rad, [30*mm, 34*mm, 23*mm, 19*mm, 34*mm, 19*mm], hoegre=(3, 5)))

F.append(PageBreak())
F.append(Paragraph('Fire ting verdt å vite', H2))
F.append(Paragraph('Sonen slår sluken', H3))
F.append(Paragraph(
  'Feil sluk i riktig sone gir deg fortsatt fisk. Riktig sluk i feil sone gjør at fisken '
  'snuser og glir unna i fire av ti møter. Sjekk merkelappen på sluken før du bytter til noe '
  'finere.', P))
F.append(Paragraph('Rustens Spesialagn er dårlig kjøp', H3))
F.append(Paragraph(
  'Agnet lyver ikke — det gir nøyaktig 50 % større sjanse for sjelden og legendarisk fisk, '
  'målt til &times;1,50 på alle fire dyp. Men sjelden fisk går fra 1,3 % til 2,0 %, og agnet '
  'brukes opp hver gang noe biter. Det blir 30 000 kr for én ekstra sjelden fisk som er verdt '
  '200. På Djuphavet gjør det deg direkte fattigere, fordi hågjelen napper det av kroken.', P))
F.append(Paragraph('Kjekssluken er en spøk', H3))
F.append(Paragraph(
  'Den ganger fiskens tålmodighet med 2,5. Fisk har ikke søtsug. «Den er til kaffen», sier '
  'Rusten — og det er hele forklaringen.', P))
F.append(Paragraph('Sild hekler du selv', H3))
F.append(Paragraph(
  'Sildehekla starter et pumpefiske der du henter opp til fem sild om gangen, og de går rett '
  'i agnboksen i stedet for i kassa. Sild er verdt 8 kr hos Rusten og 25 kr som agn — og den '
  'er blant de beste agnene som finnes for sei og torsk. Det er derfor folk hekler.', P))

F.append(Spacer(1, 8*mm))
F.append(Paragraph(
  'Tallene er hentet ut av fiske.html og kjørt gjennom spillets egen trekning, med døgn, '
  'årstid, vær og strøm nøytralisert. Skulle tabellene i spillet endres, blir denne '
  'rapporten utdatert — den er et øyeblikksbilde av %s.' % idag, LIT))

doc = SimpleDocTemplate(UT, pagesize=A4,
                        leftMargin=20*mm, rightMargin=20*mm,
                        topMargin=18*mm, bottomMargin=20*mm,
                        title='Sluk og agn — Jakten på storkveita',
                        author='Jakten på storkveita')
doc.build(F, onFirstPage=sidefot, onLaterPages=sidefot)
print('skrevet:', UT)
