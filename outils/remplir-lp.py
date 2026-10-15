# usage: fill.py <instances.json> <contenu.json> <page>  -> prints actions JSON for data_component_props_tool
import json, sys
inst = json.load(open(sys.argv[1]))['result'][0]['data'][0]['matches']
d = json.load(open(sys.argv[2])); page = sys.argv[3]
A = dict(gravure='6aba8ca12422d438e831744b',
         pastille={'refinancement':'6ad0e76c4a7f33840ea3e3d0','reprise':'6ad0e76c5a866bda5905a839','immobilier':'6ad0e76cd89e98ffd3f595df'}[page])
ICONS = {'Restructuration de dette':'6ad0dcf57e2f9d3109266c18','Refinancement':'6ad0dd2a6952d19e86b2b122',
 'Un réseau diversifié':'6ad0dd2d67287399eedbffb6','Un dossier renforcé':'6ad0dcf67f5fcd0f5a690565','Un processus rapide':'6ad0dd2994fe777334e987bd',
 'Reprise externe (MBI)':'6ad0dd2882deca68e35c4eef','Reprise par les dirigeants (MBO)':'6ad0dd2d67287399eedbffb6',
 'Réorganisation du capital (OBO)':'6ad0dd29d9dc408fb8aa6330','Croissance externe':'6ad0dcf6220fab9abc1493e7',
 'Acquisition long terme':'6ad0dcf73069324fdde5298c','Marchands de biens':'6ad0dcf75b28c01af07fb6bd',
 'Crédit relais (bridge)':'6ad0dd2c388422e67934acaf','Opérations atypiques':'6ad0dcf53069324fdde527eb'}
LOGOS = [('6ad0e0e150bc6ba376c32bb4','Eurazeo'),('6ad0e0e17174f1f2e6031d5a','BPCE Lease'),('6ad0e0e13a21c9e271fe0b83','Arkéa'),
 ('6ad0e10c2358cfdae21bcc2b','O2 Capital'),('6ad0e10ce66a29a00d8ada3b','Sanso'),('6ad0e0e14e48b439929aad28','Elvest'),
 ('6ad0e10c22ea77dea2581b79','Raizers'),('6ad0e10cbdd74aa9e8559127','Tylia'),('6ad0e10c9ca4921aa9c48fa8','MCapital')]
def S(name, v): return ('S', name, v)
def B(name, v): return ('B', name, v)
def L(name, v): return ('L', name, v)
def fr(n):  # 30000 -> "30 000"
    return f"{n:,}".replace(',', ' ')
h=d['hero']; t=h['titre_variantes']['reseau']; ad=h['animation_depot']
ops=d['operations']; av=d['avantages']; pr=d['process']; sp=d['security_package']; tf=d['tarifs']; te=d['temoignage']; ct=d['contact']
sc=sp['comparateur_scenarios']; s0=sc[0]
counts={}
out=[]
CTA_URL=h['cta_principal']['url']
for m in inst:
    nm=m['instanceDetails']['name']; k=counts.get(nm,0); counts[nm]=k+1
    v=[]
    if nm=='CV Hero':
        v=[S('Ancre','top'),S('Pastille',h['pastille']),S('Icône pastille',A['pastille']),S('Titre avant',t['avant']+(' ' if t['avant'] else '')),
           S('Titre accent',t['accent']),S('Titre après',('' if t['apres'].startswith(('.',',')) else ' ')+t['apres']),S('Sous-titre',h['sous_titre']),
           S('Mention',h['mention']),S('Gravure',A['gravure'])]
    elif nm=='CV Bouton':
        if k==0: v=[S('Libellé',h['cta_principal']['label']),L('Lien',CTA_URL)]
        elif k==1: v=[S('Variant','87f3f3e5-33be-e7fa-cc35-65e4ed3ee038'),S('Libellé',h['cta_secondaire']['label']),L('Lien','#contact'),B('Icône flèche',False)]
        elif k==2: v=[S('Libellé',h['cta_principal']['label']),L('Lien',CTA_URL),B('Icône flèche',False)]
        elif k==3: v=[S('Variant','b169dcd7-1be2-8aff-fed0-8e83bb26f9b4'),S('Libellé','Échanger avec un expert'),L('Lien','#contact')]
    elif nm=='CV Chiffre clé':
        c=h['chiffres'][k]; v=[S('Valeur',c['valeur']),S('Libellé',c['libelle'])]
    elif nm=='CV Illustration sur aplat' and k==0:
        v=[S('Variant','b53a93c6-8d72-6000-5dc7-bf7bb35a3966')]
    elif nm=='CV Illustration dépôt de projet':
        ch={c[0]:c[1] for c in ad['champs']}
        v=[S('Montant',ch['Montant']),S('Durée',ch['Durée']),S('Objet',ch['Objet du financement']),S('Secteur',ch["Secteur d'activité"]),
           S('Résumé',ad['resume']),S('Option 1',ad['security_package'][0][0]),S('Coût option 1',ad['security_package'][0][2]),
           S('Option 2',ad['security_package'][1][0]),S('Coût option 2',ad['security_package'][1][2])]
    elif nm=='CV Logos':
        v=[S('Libellé',d['logos']['libelle'])]
    elif nm=='CV Logo':
        v=[S('Image',LOGOS[k][0]),S('Nom du prêteur',LOGOS[k][1])]
    elif nm=='CV Grille de cartes':
        if k==0: v=[S('Ancre','operations'),S('Surtitre',ops['surtitre']),S('Titre',ops['titre']),S('Texte',ops['texte'])]
        else: v=[S('Variant','8a7b2bd5-b8d4-8a91-a24b-f056f33243c0'),S('Ancre','avantages'),S('Surtitre',av['surtitre']),S('Titre',av['titre']),S('Texte',av['texte']),B('CTA visible',False)]
    elif nm=='CV Carte':
        n=len(ops['cartes'])
        if k<n: c=ops['cartes'][k]; v=[]
        else: c=av['cartes'][k-n]; v=[S('Variant','d122e54c-dd87-cefc-06f0-6cd1a7edffa7')]
        v+= [S('Icône',ICONS[c['titre']]),S('Titre',c['titre']),S('Texte',c['texte'])]
    elif nm=='CV CTA + mention':
        v=[S('Libellé',h['cta_principal']['label']),L('Lien',CTA_URL),S('Mention',h['mention'])]
    elif nm=='CV Process':
        v=[S('Ancre','process'),S('Surtitre',pr['surtitre']),S('Titre',pr['titre'])]
        for i,e in enumerate(pr['etapes']): v+=[S(f'Étape {i+1} titre',e['title']),S(f'Étape {i+1} texte',e['body'])]
    elif nm=='CV Illustration process':
        an=pr['animation']; ch={c[0]:c[1] for c in an['etape1_champs']}
        v=[S('Objet',ch['Objet'])]+[S(f'Document {i+1}',x[0]) for i,x in enumerate(an['etape1_documents'])]+\
          [S('Garantie recommandée',an['etape2_garanties'][1][0]),S('Résumé du projet',an['etape2_resume'])]
    elif nm=='CV Security Package':
        v=[S('Ancre','security-package'),S('Surtitre',sp['surtitre']),S('Titre',sp['titre']),S('Paragraphe 1',sp['paragraphes'][0]),S('Paragraphe 2',sp['paragraphes'][1])]
    elif nm=='CV Puce':
        v=[S('Variant','9b352735-94a6-7d2d-0340-61fcce0d1067'),S('Texte',sp['puces'][k])]
    elif nm=='CV Comparateur garanties':
        g1=pr['animation']['etape2_garanties'][1][0]
        v=[S('Scénarios (JS)',';'.join(f"{x['m']}|{x['d']}|{x['a']}|{x['n']}|{x['f']}|{x['g']}" for x in sc)),
           S('Montant',s0['m']),S('Durée',s0['d']),S('Secteur',s0['a']),S('Garantie 1',g1),
           S('Coût garantie 1',fr(s0['g'])+' €/an'),S('Total garantie 1',fr(round(s0['g']*s0['n']/12))+' € sur '+str(s0['n'])+' mois'),
           S('Coût fiducie',fr(s0['f'])+' €/an'),S('Total fiducie',fr(round(s0['f']*s0['n']/12))+' € sur '+str(s0['n'])+' mois')]
    elif nm=='CV Tarifs':
        v=[S('Surtitre',tf['surtitre']),S('Titre',tf['titre']),S('Texte',tf['texte']),S('Mention',h['mention'])]+[S(f'Puce {i+1}',p) for i,p in enumerate(tf['puces'])]
    elif nm=='CV Témoignage':
        v=[S('Citation',te['citation']),S('Nom',te['nom']),S('Contexte',te['contexte'])]
    elif nm=='CV Prise de rendez-vous':
        v=[S('Surtitre',ct['surtitre']),S('Titre',ct['titre']),S('Texte',ct['texte'])]
    if not v: continue
    props={p['name']:p for p in m['instanceDetails']['props']}
    vals=[]
    for typ,name,val in v:
        p=props[name]
        if typ=='S':
            if p['value']==val: continue
            vals.append({'prop_id':p['propId'],'type':'string','string_value':val})
        elif typ=='B':
            if p['value']==val: continue
            vals.append({'prop_id':p['propId'],'type':'boolean','boolean_value':val})
        else:
            if isinstance(p['value'],dict) and p['value'].get('to')==val: continue
            vals.append({'prop_id':p['propId'],'type':'link','link_mode':'url','link_to':val,'link_open_in_new_tab': not val.startswith('#')})
    if vals:
        out.append({'label':nm[:20]+str(k),'set_component_instance_prop_values':{'element_id':m['id'],'values':vals}})
print(json.dumps(out,ensure_ascii=False))
print(counts, file=sys.stderr)
