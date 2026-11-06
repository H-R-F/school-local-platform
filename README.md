# Plateforme locale de gestion scolaire

Application frontend autonome destinée au personnel d’un établissement scolaire. Ce dépôt est indépendant du dépôt de démonstration Laravel.

## Technologies

- React 19 et TypeScript
- Vite
- Tailwind CSS 4
- Lucide React

## Lancer le projet

```bash
npm install
npm run dev
```

## Barre latérale

- Une barre latérale partagée par quatre fonctions : Directeur, Responsable administratif, Responsable pédagogique et Responsable financier et logistique.
- La navigation, les autorisations par défaut, l’identité visuelle de l’établissement et les composants sont séparés.
- Un élément de navigation apparaît uniquement si le rôle et l’autorisation correspondante le permettent.
- Les Archives sont réservées au Directeur disposant de l’autorisation `archive.view`.
- Le nom, le logo, la localisation et les couleurs de l’établissement sont configurables.
- La page active est déterminée à partir du chemin de navigation.
- Les groupes peuvent être développés indépendamment. Le groupe de la page active s’ouvre automatiquement.
- La barre latérale possède son propre défilement et peut être réduite en mode icônes.

## Connexion de démonstration

La page d’accueil affiche le formulaire de connexion du personnel. L’authentification est simulée côté frontend.

Tous les comptes de démonstration utilisent le mot de passe `demo1234` :

| Fonction | Adresse e-mail |
|---|---|
| Directeur | `director@northstar.edu` |
| Responsable administratif | `admin@northstar.edu` |
| Responsable pédagogique | `pedagogy@northstar.edu` |
| Responsable financier et logistique | `finance@northstar.edu` |

Sélectionnez un compte sur la page de connexion pour remplir automatiquement l’adresse e-mail et le mot de passe. Le compte sélectionné détermine l’identité, la fonction et les éléments affichés dans la barre latérale. La session de démonstration est conservée dans le stockage local du navigateur. Le bouton « Se déconnecter » permet de la fermer.

## Limites actuelles

Ce dépôt ne contient ni backend, ni base de données, ni véritable système d’authentification. Les identifiants de démonstration sont publics et ne doivent jamais être utilisés comme mécanisme de sécurité réel. Les rôles et autorisations proviennent actuellement de données locales. Lors de l’ajout du backend, l’authentification devra être vérifiée côté serveur et la session devra être sécurisée. La visibilité des pages côté frontend ne remplace pas le contrôle des autorisations côté serveur.

## Vérifier la compilation

```bash
npm run build
```
