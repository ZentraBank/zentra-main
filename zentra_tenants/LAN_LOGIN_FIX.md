# LAN login fix

The frontend is being opened at `http://192.168.1.188:3000`, so the API and CORS origins must use the same LAN host rather than `localhost`.

Start the frontend with:

```cmd
npm run dev -- -H 0.0.0.0
```

Start the backend normally:

```cmd
npm run dev
```

Checks:

- `http://192.168.1.188:5000/health` must open.
- Login must send `POST http://192.168.1.188:5000/api/v1/auth/login`.
- The request Origin must be `http://192.168.1.188:3000`.
