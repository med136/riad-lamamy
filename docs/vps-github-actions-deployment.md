# Déploiement automatique vers le VPS

Le workflow `.github/workflows/deploy-production.yml` démarre après chaque push sur `main`. Il exécute les tests, TypeScript et le build avant d'appeler le `deploy.sh` déjà présent sur le VPS. Les migrations Supabase ne sont pas exécutées automatiquement.

## Secrets GitHub requis

Dans GitHub, ouvrir **Settings → Secrets and variables → Actions → New repository secret** puis créer :

- `VPS_HOST` : adresse IP ou nom DNS du VPS.
- `VPS_USER` : utilisateur SSH limité au déploiement.
- `VPS_PORT` : port SSH, facultatif; `22` est utilisé par défaut.
- `VPS_APP_PATH` : chemin absolu du projet sur le VPS.
- `VPS_SSH_PRIVATE_KEY` : clé privée Ed25519 dédiée au déploiement.
- `VPS_SSH_KNOWN_HOSTS` : ligne complète de la clé hôte SSH vérifiée du VPS.

## Préparation du VPS

Créer une clé dédiée depuis une machine d'administration, ajouter uniquement sa clé publique dans `~/.ssh/authorized_keys` de l'utilisateur de déploiement, puis enregistrer la clé privée dans GitHub. Vérifier manuellement l'empreinte de la clé hôte du VPS avant de placer sa ligne `known_hosts` dans GitHub; ne pas apprendre cette clé automatiquement dans le workflow.

L'utilisateur SSH doit pouvoir lire le dépôt, exécuter `deploy.sh` et redémarrer uniquement le service de l'application. Le script doit retourner un code non nul si `git pull`, l'installation, le build ou le redémarrage échoue.

## Premier lancement

Après avoir ajouté les secrets, ouvrir **Actions → Deploy production VPS → Run workflow**. Le déploiement est terminé uniquement si le job `verify`, le job `deploy` et le health check `https://darlamamy.com/api/rooms` sont tous verts.
