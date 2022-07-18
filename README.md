# p7frontend - projet 7 - Groupomania - OC dev web

p7frontend est l'application front du projet 7 - Groupomania, développé avec React. Cette application necessite le lancement préalable de l'API p7backend.

Pour utiliser cette application, les outils suivants doivent être installés :
- GIT, téléchargeable à cette adresse : https://git-scm.com/downloads
- node.js, téléchargeable à cette adresse : https://nodejs.org/en/download/

Ensuite, télécharger le fichier zip ou cloner le repository, utiliser une console de commande (par exemple GIT bash) pour aller dans le dossier créé (.../p7frontend) et entrer 'npm install' pour installer tous les modules nécessaires.

Avant de lancer p7frontend, il faudra copier, dans le dossier créé précédemment, le fichier .env, fourni en supplément, contenant les paramètres de port de l'application et de l'API p7backend.

Enfin, pour exécuter p7frontend : avec la console de commande, dans le dossier créé précédemment, entrer 'npm start'.

Note : il se peut qu'une "erreur" liée au module ESlint de React s'affiche dans un onglet supplémentaire du navigateur. Il s'agit en fait de l'affichage d'un warning dans un pop-up du navigateur au lieu de l'affichage normal dans la console, et uniquement en environnement de développement pas en production. En attendant une correction de ce bug par les personnes s'occupant des interactions React/ESlint, il suffit de fermer ce pop-up, qui n'empêche nullement l'application de s'exécuter. Dans le pire des cas, merci de vérifier que vous avez bien la dernière version de node.js installée, et d'entrer à nouveau 'npm start'.
