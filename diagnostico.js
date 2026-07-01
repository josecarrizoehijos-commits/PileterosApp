export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mediaType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Se requiere una imagen' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: `Sos José Carrizo, piletero profesional con 30 años de experiencia en Argentina. Analizá esta foto del agua de la pileta y respondé SOLO con un JSON así, sin markdown ni texto extra:
{
  "emoji": "emoji del estado (usa 🟢 buena, 🟡 regular, 🔴 mala, 🔵 necesita atención)",
  "titulo": "estado en 3-4 palabras",
  "diagnostico": "análisis en 2-3 oraciones, directo y en argentino informal",
  "acciones": ["acción concreta 1", "acción concreta 2", "acción concreta 3"],
  "urgencia": "baja/media/alta"
}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(text);

    return res.status(200).json(result);

  } catch (err) {
    console.error('Error diagnostico:', err);
    return res.status(500).json({ error: 'Error al analizar la imagen' });
  }
}
