/**
 * Detect language from text
 */
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') {
    return 'en';
  }

  // Simple keyword-based detection
  const banglaPattern = /[\u0980-\u09FF]/;
  const arabicPattern = /[\u0600-\u06FF]/;
  const hindiPattern = /[\u0900-\u097F]/;

  if (banglaPattern.test(text)) {
    return 'bn';
  }
  if (arabicPattern.test(text)) {
    return 'ar';
  }
  if (hindiPattern.test(text)) {
    return 'hi';
  }

  return 'en'; // Default to English
};

/**
 * Translate text using AI
 */
const translateText = async (text, targetLanguage, genAI) => {
  if (!genAI) {
    return text; // Return original if AI not available
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const languageMap = {
      'bn': 'Bengali',
      'bangla': 'Bengali',
      'bengali': 'Bengali',
      'hi': 'Hindi',
      'hindi': 'Hindi',
      'ar': 'Arabic',
      'arabic': 'Arabic',
      'en': 'English',
      'english': 'English',
    };

    const targetLang = languageMap[targetLanguage.toLowerCase()] || targetLanguage;

    const prompt = `Translate the following text to ${targetLang}. Provide only the translation, no explanations:

Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
};

module.exports = {
  detectLanguage,
  translateText,
};

