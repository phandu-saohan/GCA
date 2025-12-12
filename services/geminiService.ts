import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AnalysisResult, PatientMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for structured output
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    option1: {
      type: Type.OBJECT,
      properties: {
        volume: { type: Type.NUMBER, description: "First recommended volume in cc (smaller/safer/natural)" },
        cupSize: { type: Type.STRING, description: "Estimated cup size for option 1" },
        style: { type: Type.STRING, description: "Short description of the aesthetic result considering height (e.g. Balanced with tall frame)" }
      },
      required: ["volume", "cupSize", "style"]
    },
    option2: {
      type: Type.OBJECT,
      properties: {
        volume: { type: Type.NUMBER, description: "Second recommended volume in cc (larger/fuller)" },
        cupSize: { type: Type.STRING, description: "Estimated cup size for option 2" },
        style: { type: Type.STRING, description: "Short description of the aesthetic result considering height (e.g. Full but proportional)" }
      },
      required: ["volume", "cupSize", "style"]
    },
    bodyAnalysis: {
      type: Type.STRING,
      description: "Analysis of the patient's current chest frame, symmetry, and proportions based on image and stats.",
    },
    reasoning: {
      type: Type.STRING,
      description: "Explanation of why these two specific options are recommended based on height, weight, breast width (BW), and desired look.",
    },
    implantsTypeSuggestion: {
      type: Type.STRING,
      description: "Suggestion on profile (High, Moderate) or shape (Round, Drop) suitable for the body type.",
    },
  },
  required: [
    "option1",
    "option2",
    "bodyAnalysis",
    "reasoning",
    "implantsTypeSuggestion",
  ],
};

export const analyzePatient = async (
  metrics: PatientMetrics,
  imageBase64: string,
  mimeType: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Bạn là một chuyên gia tư vấn thẩm mỹ y khoa và phẫu thuật tạo hình (AI Consultant).
      Nhiệm vụ của bạn là phân tích số liệu cơ thể và hình ảnh lâm sàng để đưa ra **2 GỢI Ý** kích thước túi ngực phù hợp.

      Thông tin bệnh nhân:
      - Chiều cao: ${metrics.height} cm
      - Cân nặng: ${metrics.weight} kg
      - Tuổi: ${metrics.age}
      - Bề rộng chân ngực (Breast Width - BW): ${metrics.breastWidth} cm
      - Kích thước hiện tại (ước lượng): ${metrics.currentSize}
      - Mong muốn thẩm mỹ: ${metrics.desiredLook}

      Yêu cầu phân tích chuyên sâu:
      1. **Phân tích BW (Bề rộng chân ngực)**: Đây là yếu tố quan trọng nhất để chọn đường kính túi.
      
      2. **Phân tích Tỷ lệ Chiều cao & Vóc dáng**: 
         - Hãy chú ý đặc biệt đến chiều cao ${metrics.height}cm của bệnh nhân.
         - Với người cao: Thường cần thể tích lớn hơn để tạo cảm giác đầy đặn tương xứng (cùng 1 size túi trông sẽ nhỏ hơn trên người cao).
         - Với người thấp: Cần chọn size vừa phải để tránh cảm giác nặng nề, thô kệch.
         - Tinh chỉnh Volume Option 1 và 2 dựa trên tỷ lệ này.

      Đề xuất 2 phương án cụ thể:
      - **Option 1 (Tự nhiên/Cân đối)**: Kích thước an toàn, hài hòa nhất với chiều cao và khung xương.
      - **Option 2 (Gợi cảm/Nổi bật)**: Kích thước lớn hơn để tạo đường cong rõ rệt, nhưng vẫn phải nằm trong giới hạn an toàn của BW và không làm mất cân đối với chiều cao.
      
      Trong trường 'style', hãy mô tả ngắn gọn sự tương quan với vóc dáng (VD: "Vừa vặn với dáng người cao", "Đầy đặn nhưng không thô").
      
      Hãy đưa ra lời khuyên khách quan, chuyên nghiệp, y khoa.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a professional medical aesthetic consultant. Provide analysis in Vietnamese language.",
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Có lỗi xảy ra trong quá trình phân tích hình ảnh. Vui lòng thử lại với hình ảnh rõ nét hơn hoặc góc chụp khác.");
  }
};

export const generateSimulationImage = async (
  metrics: PatientMetrics,
  targetVolume: number,
  targetCup: string,
  imageBase64: string,
  mimeType: string,
  style: 'realistic' | '3d-mesh' = 'realistic'
): Promise<string> => {
  try {
    let styleInstructions = "";
    
    if (style === '3d-mesh') {
      styleInstructions = `
        Style: Advanced Medical Augmented Reality (AR) Visualization.
        Key Elements to Render:
        1. **3D Topographic Wireframe**: Overlay a high-tech cyan/blue contour grid mesh on the chest to strictly define the new curvature and volume.
        2. **Ghost Implant Visualization**: Render the ${targetVolume}cc implants as **semi-transparent, glowing amber/gold spheres** INSIDE the breast tissue.
        3. **Structure**: Show how the implant fits within the wireframe.
        4. **Aesthetic**: Tech-medical, clean, high contrast, X-ray like transparency for the implants.
      `;
    } else {
      styleInstructions = `
        Style: ${metrics.desiredLook}, Photorealistic.
        Requirements:
        - Keep face, hair, and background exactly the same.
        - Maintain natural anatomy and skin tone.
        - Ensure the new volume fits the body frame.
      `;
    }

    const prompt = `
      Edit this image to simulate breast augmentation results.
      Goal: Increase breast volume to approximately ${targetVolume}cc.
      ${styleInstructions}
      - Return only the modified image.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: Do not set responseMimeType for image editing on this model
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart) {
        console.warn("Model returned text instead of image:", textPart.text);
        throw new Error("AI không thể tạo hình ảnh, vui lòng thử lại.");
    }

    throw new Error("AI không trả về dữ liệu hình ảnh.");
  } catch (error: any) {
    console.error("Gemini Simulation Error:", error);
    if (error.status === 500 || error.code === 500) {
       throw new Error("Hệ thống AI đang quá tải, vui lòng thử lại sau.");
    }
    throw new Error("Không thể tạo hình ảnh mô phỏng lúc này.");
  }
};