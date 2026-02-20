# Legal checklist for global app launch

This doc answers: **Is the app’s Privacy Policy and Terms of Service in good shape to launch globally (App Store, Google Play, EU, etc.)?**

## Short answer

**Yes.** The in-app Privacy Policy and Terms of Service already cover what stores and regulators typically require. You are in good condition for a global launch **as long as you**:

1. Set **hosted URLs** for Privacy Policy and Terms (required by both stores).
2. Keep the **“Last updated”** date in sync when you change the documents (see below).

---

## What you already have

### Privacy Policy (11 sections)

- Introduction and commitment to privacy  
- **Data we collect** (account, posts, requests, matrimonial, usage)  
- **How we use data** (services, features, communication, security, legal)  
- **Data sharing** (no selling; sharing with users, providers, legal only)  
- **Your rights (GDPR/CCPA)** – access, portability, correction, deletion, object, withdraw consent  
- Data security and retention  
- **Children’s privacy** (13+ / 16+ EU with parental consent)  
- **International transfers & data residency** (including UAE PDPL and Qatar)  
- Changes to policy and **contact**

### Terms of Service (13 sections)

- Acceptance, eligibility (age), account registration  
- User conduct and prohibited behavior  
- Content ownership and IP  
- Reference to Privacy Policy  
- Termination, disclaimers, limitation of liability  
- Governing law, changes to terms, **contact**

### In the app

- **Sign-up consent**: Users must tick “I agree to the Terms of Service” and “I agree to the Privacy Policy” before registering; both open the full in-app documents.
- **Settings**: Links to Privacy Policy and Terms of Service.
- **Last updated**: Shown from a single config date (see below).

This matches what Apple, Google, and major privacy laws (e.g. GDPR, CCPA) expect for a community app with account, content, and optional matrimonial features.

---

## Store and regulatory requirements

| Requirement | Status |
|------------|--------|
| **Apple App Store** – Privacy Policy URL | ✅ Content ready; you must set `EXPO_PUBLIC_PRIVACY_POLICY_URL` to a **live URL** and enter it in App Store Connect. |
| **Google Play** – Privacy Policy URL | ✅ Same; set the URL in Play Console. |
| **GDPR (EU)** – Legal basis, rights, retention, transfers | ✅ Covered in Privacy (rights, retention, international transfers). Consent at sign-up. |
| **CCPA (California)** – Disclosure and rights | ✅ Section 5 “Your rights (GDPR/CCPA)” and in-app data export. |
| **Terms of Service** – Acceptance, conduct, termination | ✅ Full Terms in-app; optional hosted URL for stores. |

So in terms of **content and flow**, you are in good condition to launch globally.

---

## Before you submit to the stores

1. **Host the documents and set URLs**  
   - Publish the same Privacy Policy and Terms text on a webpage (your site or e.g. GitHub Pages).  
   - Set in `.env`:  
     - `EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-domain.com/privacy`  
     - `EXPO_PUBLIC_TERMS_OF_SERVICE_URL=https://your-domain.com/terms`  
   - Use these **exact URLs** in App Store Connect and Google Play Console where they ask for Privacy Policy / Terms.

2. **Keep “Last updated” accurate**  
   - When you change the Privacy Policy or Terms, set the revision date in config so the app does not show “today” every time.  
   - In `src/constants/config.ts`, `contactInfo.legalDocumentsLastUpdated` defaults to `'2025-02-01'`.  
   - You can override with env: `EXPO_PUBLIC_LEGAL_DOCS_LAST_UPDATED=2025-03-15` (use `YYYY-MM-DD`).  
   - Update this whenever you publish a new version of the legal documents.

3. **Optional**  
   - If you add analytics or crash reporting, mention them in the Privacy Policy (e.g. under “Data we collect” / “How we use your data”).  
   - If you target under-13 in any region, you will need stricter children’s privacy handling (you currently state 13+ / 16+ EU).

---

## I don’t have a domain — use GitHub (free)

You can use your **GitHub repository** as the hosted URL. Apple and Google accept stable, public URLs; a GitHub repo link is fine as long as the page is readable.

### Step 1: Push the policy and terms to GitHub

The repo already has:

- **Privacy Policy:** `docs/PRIVACY_POLICY.md`
- **Terms of Service:** `docs/TERMS_OF_SERVICE.md`

Commit and push these files (and any edits) to your GitHub repo. The repo must be **public** so store reviewers can open the links.

### Step 2: Get your GitHub URLs

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name (e.g. `yashcoded` and `Bhatia-Buzz`).

| Document        | URL format |
|----------------|------------|
| Privacy Policy | `https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/docs/PRIVACY_POLICY.md` |
| Terms of Service | `https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/docs/TERMS_OF_SERVICE.md` |

If your default branch is `master` instead of `main`, use `blob/master` in the URL.

**Example:**  
If the repo is `https://github.com/yashcoded/Bhatia-Buzz`:

- Privacy: `https://github.com/yashcoded/Bhatia-Buzz/blob/main/docs/PRIVACY_POLICY.md`
- Terms:   `https://github.com/yashcoded/Bhatia-Buzz/blob/main/docs/TERMS_OF_SERVICE.md`

### Step 3: Set the URLs in your app and stores

1. In your project `.env` (and in EAS/CI if you use it), set:
   ```bash
   EXPO_PUBLIC_PRIVACY_POLICY_URL=https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/docs/PRIVACY_POLICY.md
   EXPO_PUBLIC_TERMS_OF_SERVICE_URL=https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/docs/TERMS_OF_SERVICE.md
   ```
2. In **App Store Connect** and **Google Play Console**, paste these same URLs where they ask for “Privacy Policy URL” (and Terms URL if requested).

After that, the in-app “View privacy policy online” / “View terms of service online” buttons will open these GitHub pages, and store review will see the same links.

---

## Summary

- **Content**: Your Privacy Policy and Terms are at a **standard level** suitable for a global launch.  
- **Condition to launch globally**: Good, **provided** you set the two hosted URLs and keep the “Last updated” date correct when you change the documents.

If you want, the next step is to add the two URLs to your `.env` and (if you have a site) to publish the same text there and use those links in the app and store listings.
