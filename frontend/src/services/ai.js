export async function askAI(prompt) {
  // Load Hugging Face API key from environment variables
  const token = process.env.REACT_APP_HF_API_KEY;
  
  // Check if API key is present
  if (!token) {
    console.error('AI API key not provided. Make sure REACT_APP_HF_API_KEY is set in .env');
    throw new Error('AI API key not provided. Set REACT_APP_HF_API_KEY in .env');
  }

  console.log('HF API Key loaded:', token ? 'Yes' : 'No');

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI request failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();

    // Return the generated text defensively
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
    if (data?.generated_text) return data.generated_text;

    return JSON.stringify(data);

  } catch (err) {
    console.error('Error calling AI API:', err);
    throw err;
  }
}
