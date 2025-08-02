import { defineEventHandler, readBody } from 'h3'

// 定義模型設定 - 支援三個 AI 模型
const modelConfigs = {
  llama2: {
    endpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
    getPrompt: (body: any) => {
      return `<s>[INST] You are a world-class SEO expert and creative copywriter. Your task is to generate SEO-optimized content based on the user's website information. You must respond ONLY with a valid JSON object, without any introductory text, explanations, or markdown code blocks. The JSON object must contain these keys: "title" (string), "description" (string), "keywords" (string, comma-separated), and "faqList" (an array of objects, each with "question" and "answer" string properties).

Please generate the SEO content in Traditional Chinese (繁體中文) for the following website details:
- Website Title: ${body.siteTitle || ''}
- Website Description: ${body.siteDescription || ''}
- Keywords: ${body.siteKeywords || ''}
- Address: ${body.address || ''}
- City: ${body.city || ''}
- Zipcode: ${body.zipcode || ''}
- Existing FAQ (for reference): ${JSON.stringify(body.faqList || [])} [/INST]`;
    },
    parseResponse: (data: any) => data[0]?.generated_text || ''
  },
  qwen1_5: {
    endpoint: 'https://api-inference.huggingface.co/models/Qwen/Qwen1.5-7B-Chat',
    getPrompt: (body: any) => {
      return `<|im_start|>system
你是一位世界級的 SEO 專家和創意文案撰寫者。請根據以下網站資訊生成 SEO 優化內容。

請僅回傳有效的 JSON 物件，不要包含任何介紹文字、解釋或 markdown 程式碼區塊。JSON 物件必須包含以下鍵值：
- "title" (字串): 網站標題
- "description" (字串): 網站描述  
- "keywords" (字串，逗號分隔): 關鍵字
- "faqList" (物件陣列，每個物件包含 "question" 和 "answer" 字串屬性): FAQ 清單

<|im_end|>
<|im_start|>user
請根據以下網站資訊生成 SEO 優化內容：

網站資訊：
- 網站標題: ${body.siteTitle || ''}
- 網站描述: ${body.siteDescription || ''}
- 關鍵字: ${body.siteKeywords || ''}
- 地址: ${body.address || ''}
- 城市: ${body.city || ''}
- 郵遞區號: ${body.zipcode || ''}
- 現有 FAQ (參考用): ${JSON.stringify(body.faqList || [])}

請以繁體中文生成內容，並確保 JSON 格式正確。
<|im_end|>
<|im_start|>assistant`;
    },
    parseResponse: (data: any) => data[0]?.generated_text || ''
  },
  gemini_pro: {
    endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
    getPrompt: (body: any) => {
      return `你是一位世界級的 SEO 專家和創意文案撰寫者。請根據以下網站資訊生成 SEO 優化內容。

請僅回傳有效的 JSON 物件，不要包含任何介紹文字、解釋或 markdown 程式碼區塊。JSON 物件必須包含以下鍵值：
- "title" (字串): 網站標題
- "description" (字串): 網站描述  
- "keywords" (字串，逗號分隔): 關鍵字
- "faqList" (物件陣列，每個物件包含 "question" 和 "answer" 字串屬性): FAQ 清單

網站資訊：
- 網站標題: ${body.siteTitle || ''}
- 網站描述: ${body.siteDescription || ''}
- 關鍵字: ${body.siteKeywords || ''}
- 地址: ${body.address || ''}
- 城市: ${body.city || ''}
- 郵遞區號: ${body.zipcode || ''}
- 現有 FAQ (參考用): ${JSON.stringify(body.faqList || [])}

請以繁體中文生成內容，並確保 JSON 格式正確。`;
    },
    parseResponse: (data: any) => {
      try {
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) return '';
        // 嘗試提取 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return jsonMatch[0];
        }
        return content;
      } catch (e) {
        console.error('[Gemini Pro] Parse response error:', e);
        return '';
      }
    }
  }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const modelKey = body.model === 'qwen1.5' ? 'qwen1_5' : (body.model === 'gemini_pro' ? 'gemini_pro' : 'llama2'); // 支援 gemini_pro
  const config = modelConfigs[modelKey];

  if (process.env.NODE_ENV === 'development') {
    console.log(`[AI SEO] Using model: ${modelKey}, endpoint: ${config.endpoint}, body:`, body);
  }

  // 檢查 API Key
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI SEO] HF_API_KEY available:', !!HF_API_KEY);
  }
  if (!HF_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.error('HUGGINGFACE_API_KEY not set');
    }
    return { 
      error: 'HUGGINGFACE_API_KEY not set. Please set the environment variable or use the fallback option.',
      fallback: true
    };
  }

  const prompt = config.getPrompt(body);

  try {
    let response;
    
    if (modelKey === 'gemini_pro') {
      // Gemini Pro API 格式
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return { 
          error: 'GEMINI_API_KEY not set. Please set the environment variable.',
          fallback: true
        };
      }
      
      response = await fetch(`${config.endpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
    } else {
      // Hugging Face API 格式
      response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          return_full_text: false,
        }
      })
    });
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error(`[AI SEO] API error (${modelKey}):`, response.status, errorText);
      }
      
      if (modelKey === 'gemini_pro') {
        if (response.status === 400) {
          return { 
            error: `Gemini Pro API 請求格式錯誤。請檢查 API Key 或模型設定。`,
            fallback: true,
            details: errorText
          };
        }
        if (response.status === 429) {
          return { 
            error: `Gemini Pro API 配額已用完。建議切換到 Llama 2 或 Qwen 2 模型。`,
            fallback: true,
            details: '配額限制：每日/每分鐘請求數已達上限',
            suggestion: '請選擇 Llama 2 或 Qwen 2 模型'
          };
        }
        return { error: `Gemini Pro API request failed: ${errorText}` };
      } else {
        // Hugging Face API 錯誤處理
        if (response.status === 404) {
          return { 
            error: `模型 ${modelKey} 不存在或無法訪問。請檢查模型名稱或 API Key 權限。`,
            fallback: true,
            details: `模型端點: ${config.endpoint}`,
            suggestion: '請確認 HUGGINGFACE_API_KEY 已正確設定'
          };
        }
      if (response.status === 403) {
        return { 
          error: `API 權限不足。請升級 Hugging Face API Key 權限或使用預設內容。`,
          fallback: true,
          details: errorText
        };
      }
        if (response.status === 401) {
          return { 
            error: `API Key 無效。請檢查 HUGGINGFACE_API_KEY 是否正確設定。`,
            fallback: true,
            details: errorText
          };
        }
      
      return { error: `AI API request failed: ${errorText}` };
      }
    }

    const data = await response.json();
    const rawText = config.parseResponse(data);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI SEO] Raw response from ${modelKey}:`, rawText);
    }

    const jsonMatch = rawText.match(/\{.*\}/s);
    if (jsonMatch && jsonMatch[0]) {
      const jsonString = jsonMatch[0];
      const result = JSON.parse(jsonString);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AI SEO] Parsed ${modelKey} result:`, result);
      }
      return result;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[AI SEO] Failed to parse JSON from ${modelKey} response:`, rawText);
      }
      
      // 提供預設的 SEO 內容作為 fallback
      const fallbackContent = {
        title: body.siteTitle || 'ZUR 官方網站 | 專業 3D 效果圖/動畫/光雕/VR',
        description: body.siteDescription || 'ZUR STUDIO 提供專業的 3D 效果圖、動畫製作、光雕投影和 VR 虛擬實境服務。我們擁有豐富的視覺設計經驗，為客戶打造獨特的視覺體驗。',
        keywords: body.siteKeywords || '效果圖,3D渲染,動畫,光雕,VR,設計,rendering,visualization,CGI,architecture,product',
        faqList: body.faqList || [
          {
            question: 'ZUR STUDIO 提供哪些服務？',
            answer: '我們提供 3D 效果圖製作、動畫製作、光雕投影技術和 VR 虛擬實境開發等專業服務。'
          },
          {
            question: '如何聯繫 ZUR STUDIO？',
            answer: '您可以透過我們的官方網站、電話或電子郵件與我們聯繫，我們會盡快回覆您的詢問。'
          }
        ]
      };
      
      return { 
        error: 'AI response did not contain valid JSON. Using fallback content.',
        fallback: true,
        ...fallbackContent
      };
    }

  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AI SEO] /api/seo-ai-suggest error with ${modelKey}:`, e);
    }
    return { error: 'An unexpected error occurred while fetching AI suggestions.' };
  }
}) 