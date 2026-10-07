# FF-AI

Trợ lý Free Fire. Static frontend trên GitHub Pages, proxy qua Cloudflare Worker.

## Deploy

### Frontend (GitHub Pages)

1. Push repo lên GitHub, branch `main`.
2. Settings → Pages → Source: GitHub Actions.
3. Workflow tự chạy. URL: `https://<user>.github.io/<repo>/`.

### Backend (Cloudflare Worker)

1. `cd worker`
2. `npx wrangler login`
3. `npx wrangler secret put API_KEY` — dán API key LLM.
4. `npx wrangler deploy`
5. Copy URL worker, dán vào `WORKER_URL` trong `public/app.js`.
6. Commit + push → GitHub Pages redeploy.

## Đổi model

Sửa `worker/wrangler.toml`:

- OpenAI: `BASE_URL=https://api.openai.com/v1`, `MODEL=gpt-4o-mini`
- OpenRouter: `BASE_URL=https://openrouter.ai/api/v1`, `MODEL=meta-llama/llama-3.1-70b-instruct`
- Groq: `BASE_URL=https://api.groq.com/openai/v1`, `MODEL=llama-3.3-70b-versatile`
- DeepSeek: `BASE_URL=https://api.deepseek.com/v1`, `MODEL=deepseek-chat`

Rồi `npx wrangler deploy` lại.
