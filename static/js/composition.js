document.addEventListener('DOMContentLoaded', function() {
    console.log("Script composition chargé !");
    
    const vivier = document.getElementById('vivier-container');
    const actionsVivier = document.getElementById('actions-vivier');
    const btnToggle = document.getElementById('btn-toggle-vivier');

    if (!vivier) {
        console.error("Erreur : élément vivier-container introuvable.");
        return;
    }

    function setVivierState(estMasque) {
        if (estMasque) {
            vivier.style.display = 'none';
            if (actionsVivier) actionsVivier.style.display = 'none';
            if (btnToggle) btnToggle.textContent = 'Afficher le vivier';
        } else {
            vivier.style.display = 'block';
            if (actionsVivier) actionsVivier.style.display = 'flex';
            if (btnToggle) btnToggle.textContent = 'Masquer le vivier';
        }
    }

    // Au chargement, on récupère l'état (s'il n'existe pas, on affiche par défaut)
    const etatSauvegarde = localStorage.getItem('vivierMasque');
    console.log("Etat sauvegardé au chargement :", etatSauvegarde);
    
    // Si l'état sauvegardé est 'true', on masque. Sinon on laisse l'affichage par défaut du serveur.
    if (etatSauvegarde === 'true') {
        setVivierState(true);
    }

    // Fonction globale appelée par le bouton
    window.toggleVivier = function() {
        console.log("Clic sur le bouton toggle");
        const etatActuel = localStorage.getItem('vivierMasque') === 'true';
        const nouvelEtat = !etatActuel;
        
        localStorage.setItem('vivierMasque', nouvelEtat);
        setVivierState(nouvelEtat);
    };

    // --- 2. GESTION DU "TOUT SÉLECTIONNER" ---
    const selectAll = document.getElementById('select-all-composer');
    const checkboxes = document.querySelectorAll('input[name="article_ids"]');

    if (selectAll && checkboxes.length > 0) {
        selectAll.addEventListener('change', function() {
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (!this.checked) {
                    selectAll.checked = false;
                } else if (document.querySelectorAll('input[name="article_ids"]:checked').length === checkboxes.length) {
                    selectAll.checked = true;
                }
            });
        });
    }

    // --- 3. GESTION DES ACTIONS RUBRIQUES (Anniversaire / Modifier) ---
    window.gererActionRubrique = function(select, pageId) {
        const val = select.value;
        const url = new URL(window.location.href);
        
        if (val === 'ACTION_ANNIVERSAIRE') {
            const nom = prompt("Quel est le nom de la rubrique ? (ex: Il y a 70 ans)");
            if (nom) {
                url.searchParams.set('page_id', pageId);
                url.searchParams.set('action_rubrique', 'anniversaire');
                url.searchParams.set('nom_rubrique', nom);
                url.hash = 'page-' + pageId;
                window.location.href = url.href;
            } else {
                select.value = ""; 
            }
        } else if (val === 'ACTION_MODIFIER') {
            const nom = prompt("Nouveau nom pour la rubrique de cette page :");
            if (nom) {
                url.searchParams.set('page_id', pageId);
                url.searchParams.set('action_rubrique', 'modifier');
                url.searchParams.set('nom_rubrique', nom);
                url.hash = 'page-' + pageId;
                window.location.href = url.href;
            } else {
                select.value = ""; 
            }
        }
    };
});

// --- 4. GESTION DU SCROLL AU CHARGEMENT ---
window.addEventListener('load', function() {
    // Si on a une ancre dans l'URL (ex: #page-3)
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const yOffset = -100; 
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'instant'});
        }
        return; // On s'arrête là
    }

    // Sinon, restauration du scroll classique
    if (localStorage.getItem('scrollPos')) {
        window.scrollTo(0, parseInt(localStorage.getItem('scrollPos')));
        localStorage.removeItem('scrollPos');
    }
});