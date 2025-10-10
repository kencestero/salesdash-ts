# 🔐 Update Vercel Secrets - Manual Steps

You need to update these 4 secrets in Vercel. Here's the easiest way:

## Option 1: Use Vercel Dashboard (EASIEST - Recommended)

1. **Go to:** https://vercel.com/kencestero-7874s-projects/salesdash-ts/settings/environment-variables

2. **For each secret below, click "Edit" and paste the new value:**

### AUTH_SECRET
```
eMcMldxxmmjHT27Aq2pMjIppApf5kNhmH5AJi9izjuc=
```

### DATABASE_URL
```
postgresql://neondb_owner:npg_ligVGFAqh10N@ep-snowy-leaf-ad9rqm9s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### AUTH_GOOGLE_SECRET
```
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
```

### GOOGLE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCa8LAK0o3kU0u
kTSc1mfNXfwidIfCZwiSJyJ/JfSoYAuqF2sU6eeKu6BxrhkrQYlgGdd8ccX5fWAI
aXRVQjnJml/IlslnkwZgMuFI8gs6HGGHMGzWjcJIBg4EgLo8Ij/0EOITrjXYiU2o
/d9nxwUgV1/pGnPG2y4iGfBlIOzldy3fz+pV7tKjkDzgTvE7VwmFsL9xfssY34QM
U0QWoumQwUnSuBlMAuCsj31ivM42hbq2ZrorXuAm2VUI3vbMcb7/RO0EwFOHoNKr
j0By4jYH8edc8xa7TZeYgkuersNXLBy3T/E+2ZjNTnLD5GNLNBXMX7WqX4DWzAPC
cIxRSNXnAgMBAAECggEAED4dSlC58pdN2DlPwldnQXdvCRhGZa3JJlMYRRpQRk2m
RWxcPD/bLqWRa4eDMsnwecbiHQakTSOpHwrJ9uJOUZ/dpxrYPxiMmWmmyKFWe5Rd
BLfwkwj+bv+Sf23Oh7EubQWI3a9APS1U/5+2E/ipXpPuJcG//aA+5AdAV8wlMazB
L8h8uizqba4C9GSG4pPUmpkJfxbdqLK/0wMljePuw5HbHTE1/BpILYWYWRcdYhzj
xTIss+nUjMB3Lbwhi5GxJeJq7o72oNq3NBS0J+xw+iSYI86DUJtXcMMsw9UXtToK
2kHJrxW3Xt1I65KZdqQzYQRbjmWKr8KnS2Xa6JauAQKBgQDjT/yiYxk3hcsR37IF
M+VqqktQ3M1zeAgFD4mtDZHvn8P4MVCbCqacldgMca3DReEllI6N+7u++RrmCLLz
FKTdWp9pkmZxkaQIUxaqPm8zf7VTpOsBFXNv/kIAtykB4erhKDl4SDVqMihtL758
e1+HplqzDwaLEuEKZH+DMusncQKBgQDa9R1bRlIGMp8iguGrNexsD0ZrNV4n63ut
/33H6abAvCUHnPAY8ED8DkrXfiz2m+0sJqdOw05ZIMqrFR0WD3nYnGZ8OCKUd1iU
Y5WtQSOYJMcrCnXfOjBCRHiqVWgKShUXTKn2moDefqcURrRnWjBAs1kbdvBABzi+
9ORSgVcW1wKBgQDFPo8VybAEAdDoPZeX9CRKnmKkVDTi0XEEEyuAQpozuAqwvvoW
zvMsRMooYixJmcV4eqQIiDutxzKUEVBWpb85ZH2XejXyrlIL9y1fpLWRlmudnSle
02JL9/EF9elbfNH3dpQHz4CqGcQCmr9L/TIz3yIs5gjjfQpRnksXaYOrwQKBgQCA
f0scLteiVYD4ovDHJp06CXjdH/PC37q0sXTipqe7Am+E2UA6knzAr66SarT+gSGe
QIz9dzb6rXjjEEACm1B5o8etbNA2axfr9cl4ZPr7pdHQ25GzUJXTvhVGeVrWdwWL
p+0zERdB+/gXuSrUYKRixB4uNQ3ntZVC07tPBCLU/wKBgG1l64ziWubCWYUUPp3P
4rO+TWFflASeCRHfrHWzLXJRIuB58r39Vv6Ugyeyv1DKlkcHP2u52MgzWM0NlXH8
PhtQH61lzT6ZANS2ifRPXuGRcSPO+ahZWGTqZLGmKvwXjvo7YFzo6LlQ+RaXsmL4
3Dua3p7UPmha9sQTwWH0qKoy
-----END PRIVATE KEY-----
```

---

## ✅ After Updating All 4 Secrets:

1. **Redeploy your site:**
   ```bash
   vercel deploy --prod
   ```

2. **Test it works:**
   - Go to your production URL
   - Try logging in with Google
   - Everything should work!

---

**NOTE:** Make sure to select "Production" environment when editing each secret in Vercel!
