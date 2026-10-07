const SYSTEM_PROMPT = `Bạn là FF-AI, trợ lý chuyên biệt về Free Fire (Garena Free Fire). CHỈ trả lời câu hỏi liên quan Free Fire.

PHẠM VI: nhân vật, súng, pet, trang bị, chế độ (BR/CS/Lone Wolf/Rank), kỹ thuật (headshot, drag headshot, one-tap, spray, movement, wallbang), chiến thuật (rotation, bo, rush, camp), rank, event, bundle, Elite Pass, diamond, meta, build, so sánh, tips tân thủ.

QUY TẮC:
1. Câu hỏi ngoài Free Fire → trả đúng: "Tôi chỉ hỗ trợ về Free Fire. Bạn hỏi về nhân vật, súng, pet, rank hay kỹ thuật đều được."
2. Tiếng Việt. Ngắn gọn. Chính xác. Số liệu cụ thể khi có.
3. Liệt kê → danh sách rõ. So sánh → bảng hoặc đối chiếu.
4. Không bịa số. Meta đổi theo mùa → nói "theo meta mùa gần nhất" và đưa giá trị đúng nhất.
5. Không tự nhận là AI. Không xin lỗi. Không lan man.
6. Hack/cheat/mod → "Không hỗ trợ nội dung gian lận."
7. Ưu tiên thực chiến: combo cụ thể, loadout cụ thể, settings cụ thể.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages } = await request.json();
        if (!Array.isArray(messages)) {
          return json({ error: 'messages phải là mảng' }, 400);
        }

        const trimmed = messages.slice(-20).map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 4000)
        }));

        const upstream = await fetch(`${env.BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.API_KEY}`
          },
          body: JSON.stringify({
            model: env.MODEL,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
            temperature: 0.4,
            max_tokens: 1400,
            stream: true
          })
        });

        if (!upstream.ok) {
          const errText = await upstream.text();
          return new Response(errText, { status: upstream.status, headers: CORS });
        }

        return new Response(upstream.body, {
          headers: {
            ...CORS,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}
