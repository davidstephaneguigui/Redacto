from django.utils.html import escape
import difflib
import html
import re


def _envelopper(html, debut, fin, type_seg, couleur=None):
    """
    Enveloppe un fragment HTML dans un <span> qui porte les
    positions dans le texte original.
    """
    classes = ["seg"]
    if couleur:
        classes.append(f"rel-{couleur}")

    attrs = (
        f'class="{" ".join(classes)}" '
        f'data-debut="{debut}" '
        f'data-fin="{fin}" '
        f'data-type="{type_seg}"'
    )
    return f"<span {attrs}>{html}</span>"


def rendre_texte_annote(texte, couleur=None):
    """
    Produit une version annotable du texte : chaque fragment
    est enveloppé dans un <span class="seg">.
    """
    import re
    parties = re.split(r'((?:\r?\n){2,})', texte)
    resultat = []
    pos = 0

    for partie in parties:
        if not partie:
            continue
        fin = pos + len(partie)
        resultat.append(
            _envelopper(
                escape(partie),
                debut=pos,
                fin=fin,
                type_seg="texte",
                couleur=couleur,
            )
        )
        pos = fin

    return "".join(resultat)


SEUIL_EQUAL = 20  # en dessous, un "equal" est absorbé dans la zone modifiée


def _decouper_paragraphes(texte):
    """Découpe un texte en liste de paragraphes (séparés par des lignes vides)."""
    texte = texte.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not texte:
        return []
    return [p for p in re.split(r"\n\s*\n+", texte) if p.strip()]


def _rendre_diff_paragraphe(texte_parent, texte_actuel, couleur):
    """
    Diff caractère par caractère pour UN SEUL paragraphe
    (sans séparateur de paragraphe \n\n).
    Les \n simples sont convertis en <br> à la fin.
    """
    sm = difflib.SequenceMatcher(None, texte_parent, texte_actuel, autojunk=False)
    morceaux = []
    del_buffer = []
    ins_buffer = []

    def vider():
        if del_buffer:
            morceaux.append(
                f'<del class="rel-{couleur}">{"".join(del_buffer)}</del>'
            )
            del_buffer.clear()
        if ins_buffer:
            morceaux.append(
                f'<ins class="rel-{couleur}">{"".join(ins_buffer)}</ins>'
            )
            ins_buffer.clear()

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            txt = texte_parent[i1:i2]
            if len(txt) >= SEUIL_EQUAL:
                vider()
                morceaux.append(escape(txt))
            else:
                del_buffer.append(escape(txt))
                ins_buffer.append(escape(txt))
        elif tag == 'delete':
            del_buffer.append(escape(texte_parent[i1:i2]))
        elif tag == 'insert':
            ins_buffer.append(escape(texte_actuel[j1:j2]))
        elif tag == 'replace':
            if i2 > i1:
                del_buffer.append(escape(texte_parent[i1:i2]))
            if j2 > j1:
                ins_buffer.append(escape(texte_actuel[j1:j2]))

    vider()
    resultat = ''.join(morceaux)
    # Sauts de ligne simples → <br> (valide même à l’intérieur de <del>/<ins>)
    return resultat.replace("\n", "<br>")


def rendre_diff(texte_parent, texte_actuel, couleur):
    """
    Diff par paragraphes : chaque paragraphe est enveloppé dans <p>.
    Les paragraphes égaux, supprimés, insérés ou remplacés sont gérés
    séparément, ce qui garantit un HTML valide.
    """
    texte_parent = html.unescape(texte_parent)
    texte_actuel = html.unescape(texte_actuel)

    paras_parent = _decouper_paragraphes(texte_parent)
    paras_actuel = _decouper_paragraphes(texte_actuel)

    sm = difflib.SequenceMatcher(None, paras_parent, paras_actuel, autojunk=False)
    morceaux = []

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for k in range(i1, i2):
                contenu = _rendre_diff_paragraphe(
                    paras_parent[k], paras_parent[k], couleur
                )
                morceaux.append(f"<p>{contenu}</p>")

        elif tag == 'delete':
            for k in range(i1, i2):
                contenu = _rendre_diff_paragraphe(
                    paras_parent[k], "", couleur
                )
                morceaux.append(f"<p>{contenu}</p>")

        elif tag == 'insert':
            for k in range(j1, j2):
                contenu = _rendre_diff_paragraphe(
                    "", paras_actuel[k], couleur
                )
                morceaux.append(f"<p>{contenu}</p>")

        elif tag == 'replace':
            n = min(i2 - i1, j2 - j1)
            # Paires de paragraphes remplacés : diff caractère par caractère
            for k in range(n):
                contenu = _rendre_diff_paragraphe(
                    paras_parent[i1 + k], paras_actuel[j1 + k], couleur
                )
                morceaux.append(f"<p>{contenu}</p>")
            # Paragraphes supprimés en trop
            for k in range(n, i2 - i1):
                contenu = _rendre_diff_paragraphe(
                    paras_parent[i1 + k], "", couleur
                )
                morceaux.append(f"<p>{contenu}</p>")
            # Paragraphes ajoutés en trop
            for k in range(n, j2 - j1):
                contenu = _rendre_diff_paragraphe(
                    "", paras_actuel[j1 + k], couleur
                )
                morceaux.append(f"<p>{contenu}</p>")

    return '<div class="diff-journal">' + "".join(morceaux) + "</div>"


def formater_paragraphes(texte: str, deja_html: bool = False) -> str:
    """
    Transforme un texte en HTML structuré avec des balises <p>.

    - Les blocs séparés par une ou plusieurs lignes vides deviennent des <p>.
    - Les retours à la ligne simples à l'intérieur d'un bloc deviennent des <br>.
    - Si deja_html=False, le texte est échappé pour éviter l'injection HTML.
    - Si deja_html=True, on conserve les balises existantes (utile si rendre_diff
      produit déjà des <span> de coloration).
    """
    if texte is None:
        return ""

    # Normalisation des retours à la ligne
    texte = texte.replace("\r\n", "\n").replace("\r", "\n").strip()

    if not texte:
        return "<p></p>"

    # Découpage en paragraphes sur les lignes vides
    blocs = re.split(r"\n\s*\n+", texte)

    paragraphes = []
    for bloc in blocs:
        bloc = bloc.strip()
        if not bloc:
            continue

        if not deja_html:
            bloc = html.escape(bloc, quote=False)

        # Les sauts de ligne simples deviennent des <br>
        bloc = bloc.replace("\n", "<br>\n")
        paragraphes.append(f"<p>{bloc}</p>")

    return "\n".join(paragraphes) if paragraphes else "<p></p>"