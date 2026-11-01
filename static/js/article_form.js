document.addEventListener("DOMContentLoaded", function() {
    // =========================================================
    // 1. GESTION DES BLOCS IMAGES (Nom du fichier et alertes de droits)
    // =========================================================
    const blocsImages = document.querySelectorAll(".image-form-block");

    blocsImages.forEach(function(bloc) {
        // On récupère les éléments à l'intérieur de ce bloc spécifique
        const inputFichier = bloc.querySelector('input[type="file"]');
        const checkAuteur = bloc.querySelector('input[name$="-est_prise_par_auteur"]'); 
        const checkDroits = bloc.querySelector('input[name$="-droits_ok"]');
        const alerte = bloc.querySelector(".alerte-droits");
        const fileDisplay = bloc.querySelector(".file-name-display");

        if (inputFichier) {
            // A. Gestion de l'affichage du nom du fichier
            if (fileDisplay) {
                inputFichier.addEventListener("change", function() {
                    if (inputFichier.files.length > 0) {
                        fileDisplay.textContent = inputFichier.files[0].name;
                        fileDisplay.style.color = "var(--c-text)";
                        fileDisplay.style.fontStyle = "normal";
                    } else {
                        fileDisplay.textContent = "Aucun fichier sélectionné";
                        fileDisplay.style.color = "var(--c-text-muted)";
                        fileDisplay.style.fontStyle = "italic";
                    }
                });
            }

            // B. Gestion de l'alerte visuelle sur les droits
            if (checkAuteur && checkDroits && alerte) {
                function verifierDroits() {
                    if (inputFichier.files.length > 0 && !checkAuteur.checked && !checkDroits.checked) {
                        alerte.style.display = "block";
                    } else {
                        alerte.style.display = "none";
                    }
                }

                checkAuteur.addEventListener("change", verifierDroits);
                checkDroits.addEventListener("change", verifierDroits);
                inputFichier.addEventListener("change", verifierDroits);
            }
        }
    });

    // =========================================================
    // 2. VALIDATION DU FORMULAIRE (Légende obligatoire)
    // =========================================================
    const mainForm = document.getElementById("form-article");
    
    if (mainForm) {
        mainForm.addEventListener("submit", function(event) {
            let erreur = false;
            const alerts = [];

            // On boucle sur les blocs d'images
            blocsImages.forEach(function(bloc) {
                const inputFichier = bloc.querySelector('input[type="file"]');
                
                // Si un fichier a été sélectionné dans ce bloc
                if (inputFichier && inputFichier.files && inputFichier.files.length > 0) {
                    
                    // On cherche le champ légende associé
                    const legendeInput = bloc.querySelector('input[name$="-legende"]');
                    
                    // Si la légende est vide, on lève l'erreur
                    if (legendeInput && legendeInput.value.trim() === "") {
                        erreur = true;
                        alerts.push("Il manque la légende pour l'image sélectionnée.");
                        legendeInput.style.border = "2px solid red"; // On surligne le champ en rouge
                    }
                }
            });

            // Si on a trouvé au moins une erreur, on bloque l'envoi et on prévient
            if (erreur) {
                event.preventDefault(); 
                alert("Attention :\n" + alerts.join("\n") + "\n\nLa légende est obligatoire pour situer l'article.");
            }
        });
    }
});