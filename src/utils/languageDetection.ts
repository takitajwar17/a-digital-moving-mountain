export interface LanguageResult {
  language: string;
  confidence: number;
  script?: string;
}

// Simple language detection based on character patterns
export function detectLanguage(text: string): LanguageResult {
  const cleanText = text.trim().toLowerCase();
  
  // If text is empty or too short, default to English
  if (cleanText.length < 3) {
    return { language: 'en', confidence: 0.5 };
  }

  // Character-based detection patterns
  const patterns = [
    // Chinese (simplified/traditional)
    {
      language: 'zh',
      pattern: /[\u4e00-\u9fff\u3400-\u4dbf]/,
      confidence: 0.9,
      script: 'chinese'
    },
    // Japanese (hiragana, katakana, kanji)
    {
      language: 'ja',
      pattern: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/,
      confidence: 0.9,
      script: 'japanese'
    },
    // Korean
    {
      language: 'ko',
      pattern: /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/,
      confidence: 0.9,
      script: 'korean'
    },
    // Arabic
    {
      language: 'ar',
      pattern: /[\u0600-\u06ff\u0750-\u077f]/,
      confidence: 0.9,
      script: 'arabic'
    },
    // Hindi (Devanagari)
    {
      language: 'hi',
      pattern: /[\u0900-\u097f]/,
      confidence: 0.9,
      script: 'devanagari'
    },
    // Bengali
    {
      language: 'bn',
      pattern: /[\u0980-\u09ff]/,
      confidence: 0.9,
      script: 'bengali'
    },
    // Russian (Cyrillic)
    {
      language: 'ru',
      pattern: /[\u0400-\u04ff]/,
      confidence: 0.8,
      script: 'cyrillic'
    },
    // Thai
    {
      language: 'th',
      pattern: /[\u0e00-\u0e7f]/,
      confidence: 0.9,
      script: 'thai'
    }
  ];

  // Check for character-based patterns
  for (const pattern of patterns) {
    if (pattern.pattern.test(cleanText)) {
      return {
        language: pattern.language,
        confidence: pattern.confidence,
        script: pattern.script
      };
    }
  }

  // Word-based detection for Latin scripts
  const wordPatterns = [
    // Spanish
    {
      language: 'es',
      words: ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'al', 'del', 'las', 'los', 'pero', 'más', 'como', 'muy', 'qué', 'sí', 'me', 'ya', 'todo', 'está', 'mi', 'hasta', 'hay', 'donde', 'han', 'quien', 'este', 'esta', 'puede', 'ser', 'tiene', 'hacer', 'entre', 'sin', 'sobre', 'también', 'cuando', 'está', 'había', 'después', 'vida', 'tiempo', 'años', 'bien', 'gran', 'mismo', 'gobierno', 'país', 'mundo', 'año', 'parte', 'casa', 'día', 'hombre', 'forma', 'trabajo', 'lugar', 'debe', 'cada', 'vez', 'grupo', 'caso', 'mientras', 'menor', 'mayor', 'nivel', 'tipo', 'hecho', 'otro', 'igual', 'según', 'mejor', 'nuevo', 'tanto', 'menos', 'antes', 'nunca', 'punto', 'problema', 'ni', 'durante', 'hacia', 'dentro', 'bajo', 'través', 'aunque', 'desde', 'muchos', 'todas', 'algunos', 'siempre', 'último', 'algunos', 'cualquier', 'diferentes', 'general', 'ejemplo', 'proceso', 'social', 'proyecto', 'otras', 'toda', 'tal', 'propia', 'cierto', 'gran', 'nueva', 'primera', 'final', 'segunda', 'mejor', 'mayor', 'menor', 'gran', 'propia', 'primera', 'nueva', 'manera', 'única', 'cualquier', 'diferentes', 'general', 'ejemplo', 'proceso', 'social', 'proyecto', 'otras', 'toda', 'tal', 'propia', 'cierto', 'gran', 'nueva', 'primera', 'final', 'segunda', 'mejor', 'mayor', 'menor'],
      confidence: 0.7
    },
    // French
    {
      language: 'fr',
      words: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'ce', 'que', 'pour', 'ne', 'dans', 'un', 'à', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'il', 'vous', 'tout', 'sa', 'comme', 'mais', 'si', 'ou', 'oui', 'non', 'très', 'aussi', 'bien', 'encore', 'même', 'peu', 'déjà', 'alors', 'donc', 'ainsi', 'cette', 'ces', 'leur', 'leurs', 'nous', 'vous', 'ils', 'elles', 'où', 'comment', 'pourquoi', 'quand', 'parce', 'depuis', 'jusqu', 'pendant', 'avant', 'après', 'toujours', 'jamais', 'souvent', 'parfois', 'quelquefois', 'maintenant', 'aujourd', 'hier', 'demain', 'beaucoup', 'peu', 'assez', 'trop', 'moins', 'plus', 'aucun', 'quelque', 'plusieurs', 'chaque', 'tous', 'toutes', 'autre', 'autres', 'même', 'mêmes', 'nouveau', 'nouvelle', 'nouveaux', 'nouvelles', 'bon', 'bonne', 'bons', 'bonnes', 'grand', 'grande', 'grands', 'grandes', 'petit', 'petite', 'petits', 'petites'],
      confidence: 0.7
    },
    // German
    {
      language: 'de',
      words: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'in', 'wenn', 'auch', 'ich', 'wir', 'du', 'ihr', 'mich', 'mir', 'dich', 'dir', 'uns', 'euch', 'sich', 'was', 'wer', 'wo', 'wann', 'wie', 'warum', 'welche', 'welcher', 'welches', 'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes', 'alle', 'alles', 'jeder', 'jede', 'jedes', 'einige', 'manche', 'viele', 'wenige', 'andere', 'anderer', 'andere', 'neuer', 'neue', 'neues', 'alter', 'alte', 'altes', 'großer', 'große', 'großes', 'kleiner', 'kleine', 'kleines'],
      confidence: 0.7
    },
    // Portuguese
    {
      language: 'pt',
      words: ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'você', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'numa', 'pelos', 'elas', 'qual', 'nós', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem'],
      confidence: 0.7
    },
    // Italian
    {
      language: 'it',
      words: ['il', 'di', 'che', 'e', 'la', 'a', 'un', 'in', 'per', 'è', 'una', 'da', 'con', 'non', 'come', 'ma', 'le', 'si', 'lo', 'al', 'del', 'i', 'su', 'questa', 'questo', 'quando', 'anche', 'dalla', 'delle', 'nella', 'della', 'dal', 'più', 'ha', 'tutto', 'alla', 'sono', 'molto', 'già', 'poi', 'così', 'qui', 'dopo', 'quindi', 'prima', 'ancora', 'ogni', 'tutti', 'essere', 'avere', 'fare', 'dire', 'andare', 'vedere', 'sapere', 'dare', 'stare', 'venire', 'dovere', 'potere', 'volere', 'bene', 'male', 'grande', 'piccolo', 'buono', 'cattivo', 'nuovo', 'vecchio', 'primo', 'ultimo', 'altro', 'stesso', 'quanto', 'quale', 'dove', 'quando', 'come', 'perché', 'mentre', 'durante', 'contro', 'senza', 'sotto', 'sopra', 'dentro', 'fuori', 'davanti', 'dietro', 'accanto', 'lontano', 'vicino', 'insieme', 'sempre', 'mai', 'spesso', 'oggi', 'ieri', 'domani', 'adesso', 'subito', 'presto', 'tardi', 'forse', 'certamente', 'proprio', 'abbastanza', 'troppo', 'poco', 'tanto', 'niente', 'qualcosa', 'qualcuno', 'nessuno', 'tutti', 'alcune', 'alcune', 'parecchi', 'molti', 'pochi', 'tanti', 'qualche', 'ogni', 'ciascuno', 'entrambi', 'ambedue'],
      confidence: 0.7
    }
  ];

  // Check word-based patterns
  const words = cleanText.split(/\s+/);
  for (const pattern of wordPatterns) {
    const matches = words.filter(word => pattern.words.includes(word)).length;
    const ratio = matches / words.length;
    
    if (ratio > 0.3) { // If more than 30% of words match
      return {
        language: pattern.language,
        confidence: Math.min(0.9, pattern.confidence + ratio * 0.3)
      };
    }
  }

  // Default to English if no pattern matches
  return { language: 'en', confidence: 0.3 };
}

export function getLanguageDirection(language: string): 'ltr' | 'rtl' {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
}

export function getLanguageScript(language: string): string {
  const scripts: Record<string, string> = {
    'zh': 'chinese',
    'ja': 'japanese',
    'ko': 'korean',
    'ar': 'arabic',
    'hi': 'devanagari',
    'bn': 'bengali',
    'ru': 'cyrillic',
    'th': 'thai',
    'he': 'hebrew',
    'fa': 'persian',
    'ur': 'urdu'
  };
  return scripts[language] || 'latin';
}

export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'th': 'Thai',
    'he': 'Hebrew',
    'fa': 'Persian',
    'ur': 'Urdu'
  };
  return languages[code] || code.toUpperCase();
}

export function supportedLanguages(): string[] {
  return ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'bn', 'th', 'he', 'fa', 'ur'];
}