# Instagram API Setup (Optional)

The app can show **Instagram posts** in the community feed. This is optional; without an Instagram token, the feed still works using only Firestore posts.

---

## How to Get an Instagram Access Token

### 1. Facebook Developer App

1. Go to [Facebook Developers](https://developers.facebook.com/).
2. Create a new app or use an existing one (e.g. “Consumer” or “Business”).
3. Add the **Instagram Graph API** product to the app.

### 2. Instagram Business or Creator Account

- The Instagram account must be a **Business** or **Creator** account.
- Connect it to a **Facebook Page** (required for the Graph API).

### 3. Get a User Access Token

1. In the app dashboard, open **Instagram** → **Basic Display** or **Instagram Graph API** (depending on product).
2. Configure **Instagram Basic Display** or **Instagram Graph API** and add the Instagram account.
3. Use **Graph API Explorer** or your app’s login flow to get a **User access token** with permissions such as:
   - `instagram_basic`
   - `instagram_content_publish` (only if you need to publish)
4. For long-lived tokens: exchange the short-lived token for a long-lived one (see [Facebook docs](https://developers.facebook.com/docs/instagram-basic-display-api/guides/long-lived-access-tokens)).

### 4. Add to Your Project

In the project root `.env`:

```env
EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your-access-token
```

Restart the Expo dev server. The feed will fetch the configured account’s media and show it alongside Firestore posts.

---

## Limits and Security

- **Token expiration:** Short-lived tokens expire quickly; use a long-lived token and refresh before it expires.
- **Rate limits:** Instagram Graph API has rate limits; the app caches posts to reduce calls.
- **Never commit the token:** Keep it in `.env` and ensure `.env` is in `.gitignore`.

---

## If You Don’t Use Instagram

Leave `EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN` unset or empty. The app will skip fetching Instagram and only show Firestore posts; no errors.
