export const translations = {
  en: {
    sidebar: {
      title: 'EbookGen',
      subtitle: 'AI Growth Consultant',
      structureSection: 'Structure',
      outline: 'Outline & Setup',
      chaptersSection: 'Chapters',
      noChapters: 'No chapters yet.\nStart in Outline.',
      assetsSection: 'Assets',
      visuals: 'Visuals Generator',
      export: 'Export Book',
      systemOnline: 'System Online',
      newProject: 'New Project',
      resetConfirm: 'Are you sure? This will delete your current project.'
    },
    onboarding: {
      title: 'Start Your AI Growth Journey',
      subtitle: "We'll help you create a comprehensive guide to scaling your specific business. Just tell us a bit about what you do.",
      businessNameLabel: 'Business Name',
      businessNamePlace: 'e.g., The Artisan Bakery',
      nicheLabel: 'Your Niche / Industry',
      nichePlace: 'e.g., Handmade Organic Soaps',
      button: 'Generate Ebook Structure',
      loading: 'Generating Structure...',
      apiKeyLabel: 'Gemini API Key',
      apiKeyPlace: 'Paste your API Key here',
      apiKeyHelp: 'Required because no environment key was detected.',
      continueBtn: 'Continue Previous Project'
    },
    outline: {
      title: 'Project Outline',
      subtitle: 'Review and customize the structure of your growth ebook.',
      startWriting: 'Start Writing'
    },
    editor: {
      chapter: 'Chapter',
      regenerate: 'Regenerate Chapter',
      generate: 'Generate with AI',
      writing: 'Writing your chapter...',
      usingModel: 'Using Gemini 1.5 Pro Thinking Models',
      ready: 'Ready to Write',
      aiAnalyze: (niche: string, title: string) => `AI will analyze your niche (${niche}) and generate a tailored chapter focusing on "${title}".`,
      startGen: 'Start Generation',
      failed: 'Failed to generate content.',
      markdownInput: 'Markdown Editor',
      preview: 'Live Preview',
      selectChapter: 'Select a chapter from the sidebar to begin editing.'
    },
    images: {
      title: 'Visual Assets Generator',
      subtitle: 'Create professional promotional images for your ebook or social media.',
      tabGen: 'Generator',
      tabGal: 'Gallery',
      promptLabel: 'Image Prompt',
      promptPlace: 'Describe the image you want to create...',
      suggestBtn: 'Suggest Ideas',
      genBtn: 'Generate Image',
      thinking: 'Thinking...',
      generating: 'Generating...',
      suggestedTitle: 'Suggested for Current Chapter',
      creating: 'Creating visual masterpiece...',
      emptyPlaceholder: 'Generated images will appear here.',
      noImages: 'No images generated yet.',
      download: 'Download'
    },
    export: {
      title: 'Your Ebook is Ready',
      desc: (niche: string, chapters: number, images: number) => `"Scaling Your ${niche} Business with AI" contains ${chapters} completed chapters and ${images} generated assets.`,
      print: 'Print / Save as PDF',
      download: 'Download Package',
      alert: 'Download feature would generate a .epub or .pdf file here.'
    }
  },
  pt: {
    sidebar: {
      title: 'EbookGen',
      subtitle: 'Consultor de Crescimento IA',
      structureSection: 'Estrutura',
      outline: 'Esboço e Configuração',
      chaptersSection: 'Capítulos',
      noChapters: 'Nenhum capítulo ainda.\nComece pelo Esboço.',
      assetsSection: 'Recursos',
      visuals: 'Gerador de Visual',
      export: 'Exportar Livro',
      systemOnline: 'Sistema Online',
      newProject: 'Novo Projeto',
      resetConfirm: 'Tem certeza? Isso apagará seu projeto atual.'
    },
    onboarding: {
      title: 'Comece sua Jornada de Crescimento com IA',
      subtitle: 'Nós vamos ajudá-lo a criar um guia completo para escalar seu negócio. Conte-nos um pouco sobre o que você faz.',
      businessNameLabel: 'Nome da Empresa',
      businessNamePlace: 'ex: A Padaria Artesanal',
      nicheLabel: 'Seu Nicho / Indústria',
      nichePlace: 'ex: Sabonetes Orgânicos Artesanais',
      button: 'Gerar Estrutura do Ebook',
      loading: 'Gerando Estrutura...',
      apiKeyLabel: 'Chave API Gemini',
      apiKeyPlace: 'Cole sua Chave API aqui',
      apiKeyHelp: 'Necessário pois nenhuma chave de ambiente foi detectada.',
      continueBtn: 'Continuar Projeto Anterior'
    },
    outline: {
      title: 'Esboço do Projeto',
      subtitle: 'Revise e personalize a estrutura do seu ebook de crescimento.',
      startWriting: 'Começar a Escrever'
    },
    editor: {
      chapter: 'Capítulo',
      regenerate: 'Regerar Capítulo',
      generate: 'Gerar com IA',
      writing: 'Escrevendo seu capítulo...',
      usingModel: 'Usando Modelos Gemini 1.5 Pro Thinking',
      ready: 'Pronto para Escrever',
      aiAnalyze: (niche: string, title: string) => `A IA analisará seu nicho (${niche}) e gerará um capítulo personalizado focado em "${title}".`,
      startGen: 'Iniciar Geração',
      failed: 'Falha ao gerar conteúdo.',
      markdownInput: 'Editor Markdown',
      preview: 'Pré-visualização',
      selectChapter: 'Selecione um capítulo na barra lateral para começar a editar.'
    },
    images: {
      title: 'Gerador de Recursos Visuais',
      subtitle: 'Crie imagens promocionais profissionais para seu ebook ou redes sociais.',
      tabGen: 'Gerador',
      tabGal: 'Galeria',
      promptLabel: 'Prompt da Imagem',
      promptPlace: 'Descreva a imagem que você deseja criar...',
      suggestBtn: 'Sugerir Ideias',
      genBtn: 'Gerar Imagem',
      thinking: 'Pensando...',
      generating: 'Gerando...',
      suggestedTitle: 'Sugerido para o Capítulo Atual',
      creating: 'Criando obra-prima visual...',
      emptyPlaceholder: 'Imagens geradas aparecerão aqui.',
      noImages: 'Nenhuma imagem gerada ainda.',
      download: 'Baixar'
    },
    export: {
      title: 'Seu Ebook está Pronto',
      desc: (niche: string, chapters: number, images: number) => `"Escalando Seu Negócio de ${niche} com IA" contém ${chapters} capítulos concluídos e ${images} recursos gerados.`,
      print: 'Imprimir / Salvar como PDF',
      download: 'Baixar Pacote',
      alert: 'A funcionalidade de download geraria um arquivo .epub ou .pdf aqui.'
    }
  }
};