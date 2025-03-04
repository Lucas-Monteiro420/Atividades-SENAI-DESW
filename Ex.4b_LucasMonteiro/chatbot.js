document.addEventListener("DOMContentLoaded", function () {
    // Elementos do DOM
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeChat = document.getElementById("close-chat");
    const sendMessage = document.getElementById("send-message");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatControls = document.createElement("div");
    
    
    // Configuração dos botões de controle do chat
    chatControls.className = "chat-controls";
    chatControls.innerHTML = `
        <button id="export-chat" title="Exportar Conversa"><i class="fa fa-download"></i></button>
        <button id="clear-chat" title="Limpar Conversa"><i class="fa fa-trash"></i></button>
        <button id="feedback-positive" title="Feedback Positivo"><i class="fa fa-thumbs-up"></i></button>
        <button id="feedback-negative" title="Feedback Negativo"><i class="fa fa-thumbs-down"></i></button>
        <select id="context-selector" title="Mudar Contexto">
            <option value="geral">Geral</option>
            <option value="funcionalidades">Funcionalidades</option>
            <option value="planos">Planos</option>
            <option value="tecnico">Suporte Técnico</option>
        </select>
    `;
    
    // Inserir controles no container do chatbot
    chatbotContainer.insertBefore(chatControls, chatbotContainer.firstChild.nextSibling);
    
    // Estado do chatbot
    const chatbotState = {
        conversation: [],
        isTyping: false,
        context: "geral",
        sessionId: generateSessionId(),
        userProfile: {
            interactions: 0,
            preferences: {},
            lastVisit: null,
            currentPage: window.location.pathname
        },
        feedbackData: []
    };
    
    // Base de conhecimento adaptada para calculadora estatística
    const knowledgeBase = {
        "suporte": {
            patterns: ["suporte", "ajuda", "atendimento", "contato", "problema", "erro", "bug", "falha", "não funciona", "ticket", "suporte técnico"],
            responses: [
                "Olá! Precisa de ajuda com nossa calculadora estatística? Nosso suporte funciona das 9h às 18h. Como posso auxiliar?",
                "Para suporte técnico relacionado à calculadora estatística, você pode ligar para (11) 1234-5678 ou enviar um e-mail para suporte@calstats.com.",
                "Descreva seu problema com a calculadora e eu tentarei resolvê-lo ou direcioná-lo para um especialista."
            ],
            followUp: [
                "O problema ocorre em um dispositivo específico ou em vários?",
                "Qual versão da calculadora estatística você está utilizando?",
                "Desde quando o problema começou a acontecer?"
            ],
            troubleshooting: {
                "erro login": "Se você não consegue acessar sua conta da calculadora, tente redefinir a senha ou limpar o cache do navegador.",
                "erro cálculo": "Se há problemas nos cálculos, verifique se você está usando o formato correto para números decimais (ponto ou vírgula, dependendo da configuração)."
            }
        },
    
        "planos": {
            patterns: ["plano", "preço", "assinatura", "pagamento", "mensalidade", "anual", "valor", "custo", "quanto custa", "investimento", "licença"],
            responses: [
                "Oferecemos três planos para nossa calculadora estatística: Básico (R$29,90/mês), Profissional (R$59,90/mês) e Empresarial (R$99,90/mês). Quer saber mais sobre algum deles?",
                "Ao optar pelo pagamento anual da calculadora estatística, você recebe 20% de desconto em qualquer plano.",
                "Todos os planos incluem suporte e atualizações. A principal diferença está nos métodos estatísticos disponíveis e recursos avançados."
            ],
            followUp: [
                "Você precisa da calculadora para uso pessoal, acadêmico ou empresarial?",
                "Quais tipos de análises estatísticas você precisa realizar mais frequentemente?",
                "Quantas pessoas utilizarão a calculadora?"
            ],
            details: {
                "básico": "O plano Básico inclui estatística descritiva, testes t e ANOVA simples, correlação, regressão linear simples e exportação básica de dados.",
                "profissional": "O plano Profissional inclui tudo do Básico mais ANOVA multifatorial, regressão múltipla, análise fatorial, testes não-paramétricos e exportação avançada para diversos formatos.",
                "empresarial": "O plano Empresarial inclui todos os recursos do Profissional mais análise de séries temporais, modelagem de equações estruturais, análise bayesiana, machine learning básico e API para integração com outros softwares."
            }
        },
    
        "funcionalidades": {
            patterns: ["funcionalidade", "recurso", "ferramenta", "função", "pode fazer", "capacidade", "característica", "o que faz", "diferencial", "cálculo", "estatística", "análise"],
            responses: [
                "Nossa calculadora estatística permite realizar análises descritivas, testes de hipóteses, regressões, ANOVA, análises multivariadas e visualização de dados.",
                "Oferecemos uma interface intuitiva para análises estatísticas complexas sem necessidade de programação, com exportação de resultados em diversos formatos.",
                "Se precisar de uma análise estatística específica, posso verificar se está disponível em nossa calculadora."
            ],
            followUp: [
                "Você está buscando algum tipo específico de análise estatística?",
                "Trabalha com dados de que área? Temos recursos otimizados para ciências sociais, saúde, engenharia e finanças.",
                "Precisa integrar os resultados com outros programas ou fazer exportação em algum formato específico?"
            ],
            details: {
                "descritiva": "Nossa calculadora oferece estatísticas descritivas completas: média, mediana, moda, variância, desvio padrão, quartis, assimetria, curtose e diversos gráficos para visualização.",
                "inferencial": "Realizamos testes de hipóteses (t, z, qui-quadrado, F), ANOVA (um e dois fatores), análise de correlação e regressão com diagnósticos completos.",
                "avançada": "Para análises avançadas, oferecemos métodos multivariados como análise fatorial, cluster, discriminante, séries temporais e modelagem de equações estruturais."
            }
        },
    
        "instalacao": {
            patterns: ["instalar", "download", "baixar", "instalação", "setup", "configurar", "configuração"],
            responses: [
                "Nossa calculadora estatística é acessível via web ou aplicativo desktop. Para web, basta criar uma conta. Para desktop, baixe o instalador em nossa página de downloads.",
                "A instalação do aplicativo desktop é simples: baixe o arquivo, execute-o e siga as instruções na tela. Menos de 5 minutos para começar a usar!",
                "Temos versões para Windows, Mac e Linux. O download fica disponível imediatamente após a assinatura de qualquer plano."
            ],
            followUp: [
                "Qual sistema operacional você utiliza?",
                "Prefere utilizar a versão web ou desktop da calculadora?",
                "Precisa de ajuda para instalar em múltiplos computadores?"
            ]
        },
    
        "dados": {
            patterns: ["dados", "importar", "exportar", "formato", "arquivo", "csv", "excel", "spss", "banco de dados"],
            responses: [
                "Nossa calculadora aceita importação de dados em diversos formatos: CSV, Excel, SPSS, R, SAS e bancos de dados SQL.",
                "Você pode exportar os resultados em PDF, Word, Excel, HTML ou formatos específicos para programas estatísticos.",
                "A calculadora permite trabalhar com conjuntos de dados de até 1 milhão de linhas na versão Avançada, 100 mil na Profissional e 10 mil na Básica."
            ],
            followUp: [
                "Com quais formatos de dados você costuma trabalhar?",
                "Você precisa importar dados de algum sistema específico?",
                "Qual é o tamanho aproximado dos seus conjuntos de dados?"
            ]
        },
    
        "metodos": {
            patterns: ["método estatístico", "teste", "análise", "regressão", "correlação", "variância", "hipótese", "probabilidade", "distribuição", "anova", "multivariada"],
            responses: [
                "Nossa calculadora suporta mais de 50 métodos estatísticos, desde os mais básicos até análises avançadas como séries temporais e modelagem bayesiana.",
                "Todos os métodos incluem verificação de pressupostos, diagnósticos e visualizações relacionadas para facilitar a interpretação.",
                "Temos um assistente de análise que ajuda a escolher o método estatístico adequado com base nos seus dados e perguntas de pesquisa."
            ],
            followUp: [
                "Há algum método estatístico específico que você precisa utilizar?",
                "Você trabalha mais com estatística paramétrica ou não-paramétrica?",
                "Precisa de ajuda para escolher o método mais adequado para sua análise?"
            ]
        },
    
        "saudacoes": {
            patterns: ["oi", "olá", "bom dia", "boa tarde", "boa noite", "hey", "e aí", "como vai"],
            responses: [
                "Olá! Bem-vindo à calculadora estatística mais completa do mercado. Como posso ajudar?",
                "Oi! Sou o assistente virtual da CalcStats. Posso fornecer informações sobre nossa calculadora estatística.",
                "Olá! Estou aqui para ajudar com todas as suas dúvidas sobre nossa calculadora estatística."
            ]
        },
    
        "integracao": {
            patterns: ["integrar", "integração", "conectar", "api", "webhook", "sincronizar", "integração com", "compatibilidade", "plugin"],
            responses: [
                "Nossa calculadora estatística se integra com Excel, SPSS, R, Python, Tableau e Power BI através de plugins e API REST.",
                "No plano Empresarial, oferecemos API completa para integração com seus sistemas e ferramentas de business intelligence.",
                "É possível sincronizar com fontes de dados em tempo real para análises contínuas e dashboards atualizados automaticamente."
            ],
            followUp: [
                "Com quais sistemas você gostaria de integrar nossa calculadora?",
                "Você precisa de atualizações em tempo real ou processamento em lote é suficiente?"
            ]
        },
    
        "seguranca": {
            patterns: ["segurança", "seguro", "privacidade", "dados", "lgpd", "criptografia", "backup", "proteção"],
            responses: [
                "Seus dados estatísticos são criptografados e armazenados com segurança. Cumprimos todas as diretrizes da LGPD e GDPR.",
                "Oferecemos a opção de processamento local, onde seus dados nunca saem do seu computador, ideal para informações sensíveis.",
                "Realizamos backups automáticos para evitar perda de dados e análises. Você pode exportar seus backups a qualquer momento."
            ]
        },
    
        "despedida": {
            patterns: ["tchau", "até logo", "adeus", "até mais", "obrigado", "valeu"],
            responses: [
                "Foi um prazer ajudar! Se tiver mais dúvidas sobre nossa calculadora estatística, estou à disposição.",
                "Até mais! Espero que experimente nossa calculadora estatística. Temos 14 dias de teste grátis em todos os planos.",
                "Obrigado pelo contato! Não esqueça de experimentar nossa demo gratuita para conhecer todas as funcionalidades."
            ]
        },
    
        "atualizacoes": {
            patterns: ["atualização", "novidade", "mudança", "nova versão", "melhoria", "versão"],
            responses: [
                "Nossa última atualização (v4.2) trouxe novos métodos bayesianos, melhorias na interface e suporte a R markdown. Quer saber mais?",
                "Lançamos atualizações trimestrais com novos métodos estatísticos e melhorias. A próxima está prevista para o próximo mês.",
                "Todos os planos incluem atualizações gratuitas. Você sempre terá acesso aos métodos estatísticos mais recentes."
            ]
        },
    
        "tutorial": {
            patterns: ["tutorial", "como usar", "aprender", "guia", "manual", "documentação", "passo a passo", "exemplo"],
            responses: [
                "Oferecemos tutoriais em vídeo para todas as funcionalidades, webinars semanais e uma documentação completa com exemplos práticos.",
                "Nossa base de conhecimento contém mais de 200 exemplos de análises estatísticas com interpretação detalhada dos resultados.",
                "Ao assinar, você ganha acesso ao nosso curso 'Estatística na Prática' com 40 horas de conteúdo e exercícios."
            ],
            followUp: [
                "Você prefere aprender através de vídeos, textos ou exemplos práticos?",
                "Tem alguma análise específica que gostaria de aprender a fazer?"
            ]
        },
        
        "comparativo": {
            patterns: ["comparar", "comparação", "diferença", "versus", "vs", "melhor que", "concorrente", "spss", "r", "excel", "minitab"],
            responses: [
                "Comparado a pacotes como SPSS e Minitab, nossa calculadora oferece interface mais intuitiva, preço mais acessível e não requer conhecimento prévio de estatística.",
                "Diferente do Excel, nossa calculadora verifica automaticamente os pressupostos dos testes e sugere alternativas quando necessário.",
                "Enquanto R e Python exigem programação, nossa calculadora oferece a mesma potência estatística com interface gráfica amigável."
            ]
        }
    };

    // Funções auxiliares
    function generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    function getRandomResponse(category) {
        const responses = knowledgeBase[category].responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    function getFollowUpQuestion(category) {
        if (knowledgeBase[category].followUp) {
            const followUps = knowledgeBase[category].followUp;
            return followUps[Math.floor(Math.random() * followUps.length)];
        }
        return null;
    }
    
    function findCategory(message) {
        message = message.toLowerCase();
        
        // Sistema de pontuação para determinar a categoria mais relevante
        let scores = {};
        
        for (const category in knowledgeBase) {
            scores[category] = 0;
            
            for (const pattern of knowledgeBase[category].patterns) {
                if (message.includes(pattern)) {
                    // Padrões exatos recebem mais pontos
                    if (message.includes(` ${pattern} `)) {
                        scores[category] += 3;
                    } else {
                        scores[category] += 1;
                    }
                }
            }
        }
        
        // Encontrar a categoria com maior pontuação
        let maxScore = 0;
        let bestCategory = null;
        
        for (const category in scores) {
            if (scores[category] > maxScore) {
                maxScore = scores[category];
                bestCategory = category;
            }
        }
        
        // Retornar apenas se a pontuação for significativa
        return maxScore > 0 ? bestCategory : null;
    }
    
    function extractEntities(message) {
        const entities = {
            plano: null,
            funcionalidade: null,
            metodo: null,
            formato: null
        };
        
        message = message.toLowerCase();
        
        // Extrair planos
        if (message.includes("básico") || message.includes("basico")) entities.plano = "básico";
        if (message.includes("profissional") || message.includes("pro")) entities.plano = "profissional";
        if (message.includes("empresarial") || message.includes("premium") || message.includes("avancado")) entities.plano = "empresarial";
        
        // Extrair funcionalidades/métodos estatísticos
        if (message.includes("descritiva") || message.includes("média") || message.includes("desvio")) {
            entities.funcionalidade = "descritiva";
        }
        if (message.includes("teste t") || message.includes("hipótese") || message.includes("inferencial") || message.includes("anova")) {
            entities.funcionalidade = "inferencial";
        }
        if (message.includes("multivariada") || message.includes("fatorial") || message.includes("cluster") || message.includes("avançada")) {
            entities.funcionalidade = "avançada";
        }
        
        // Extrair formatos de dados
        if (message.includes("excel") || message.includes("xls")) entities.formato = "excel";
        if (message.includes("csv")) entities.formato = "csv";
        if (message.includes("spss")) entities.formato = "spss";
        if (message.includes("r")) entities.formato = "r";
        
        return entities;
    }
    
    function processUserMessage(message) {
        // Incrementar contador de interações
        chatbotState.userProfile.interactions++;
        
        // Detectar a intenção principal
        const category = findCategory(message);
        
        // Extrair entidades da mensagem
        const entities = extractEntities(message);
        
        // Analisar contexto da conversa
        const contextualResponse = analyzeContext(message, category, entities);
        if (contextualResponse) {
            return contextualResponse;
        }
        
        // Resposta baseada na categoria detectada
        if (category) {
            let response = getRandomResponse(category);
            
            // Adicionar detalhes específicos baseados nas entidades extraídas
            if (category === "planos" && entities.plano && knowledgeBase.planos.details[entities.plano]) {
                response = knowledgeBase.planos.details[entities.plano];
            }
            
            if (category === "funcionalidades" && entities.funcionalidade && knowledgeBase.funcionalidades.details[entities.funcionalidade]) {
                response = knowledgeBase.funcionalidades.details[entities.funcionalidade];
            }
            
            // Adicionar pergunta de acompanhamento para estimular a conversa
            const followUp = getFollowUpQuestion(category);
            if (followUp && Math.random() > 0.3) { // 70% de chance de incluir followUp
                response += " " + followUp;
            }
            
            return response;
        }
        
        // Análise de intenção expandida para perguntas comuns sobre calculadora estatística
        if (message.includes("quem") && (message.includes("você") || message.includes("seu nome"))) {
            return "Sou o assistente virtual da CalcStats, estou aqui para ajudar com suas dúvidas sobre nossa calculadora estatística! Posso fornecer informações sobre funcionalidades, métodos estatísticos, planos e muito mais.";
        } else if (message.includes("como") && (message.includes("funciona") || message.includes("usar"))) {
            return "Nossa calculadora estatística é intuitiva! Após o login, você pode importar seus dados e escolher a análise desejada no menu principal. A interface guiará você na configuração dos parâmetros e interpretação dos resultados. Quer que eu explique alguma análise específica?";
        } else if (message.includes("onde") && (message.includes("baixar") || message.includes("download"))) {
            return "Você pode baixar nossa calculadora estatística na página de download do nosso site após criar uma conta. Temos versões para Windows, Mac e Linux, além da versão web que não requer instalação. Qual você prefere?";
        } else if (message.includes("quando") && (message.includes("lançamento") || message.includes("nova versão") || message.includes("atualização"))) {
            return "Nossa próxima atualização está prevista para o final deste mês! Ela incluirá novos métodos de machine learning para previsão, melhorias na interface e exportação para novos formatos. Deseja receber um aviso quando for lançada?";
        } else if (message.includes("comparar") || (message.includes("diferença") && message.includes("plano"))) {
            return "A principal diferença entre nossos planos é: Básico (estatísticas descritivas e testes simples), Profissional (adiciona métodos multivariados e diagnósticos avançados) e Empresarial (inclui machine learning, análises bayesianas e API). Posso detalhar algum plano específico?";
        } else if (message.includes("estatística") && (message.includes("descritiva") || message.includes("básica"))) {
            return "Nossa calculadora realiza todas as análises descritivas: médias, medianas, modas, variâncias, desvios padrão, quartis, histogramas, boxplots, e muito mais. Você pode visualizar os resultados em tabelas e gráficos interativos.";
        } else if (message.includes("teste") && (message.includes("hipótese") || message.includes("significância"))) {
            return "Realizamos todos os testes de hipóteses comuns: t de Student, ANOVA, qui-quadrado, Mann-Whitney, Kruskal-Wallis, e muitos outros. A calculadora verifica automaticamente os pressupostos e sugere o teste mais adequado.";
        }
        
        // Tentar encontrar palavras-chave mesmo sem correspondência exata
        const keywords = message.toLowerCase().split(" ");
        for (const category in knowledgeBase) {
            for (const pattern of knowledgeBase[category].patterns) {
                for (const word of keywords) {
                    if (word.length > 3 && pattern.includes(word)) {
                        return getRandomResponse(category);
                    }
                }
            }
        }
        
        // Resposta para mensagens não reconhecidas sobre calculadora estatística
        return "Não tenho uma resposta específica para isso. Você poderia reformular ou perguntar sobre funcionalidades da calculadora, métodos estatísticos, planos, importação de dados, ou suporte técnico?";
    }
    
    function analyzeContext(message, category, entities) {
        // Verificar o histórico de conversa para manter contexto
        if (chatbotState.conversation.length > 0) {
            const lastMessages = chatbotState.conversation.slice(-3);
            
            // Verificar se estamos em uma conversa sobre planos
            const planosContext = lastMessages.some(msg => 
                msg.sender === "bot" && 
                (msg.message.includes("planos") || msg.message.includes("Básico") || msg.message.includes("Profissional"))
            );
            
            if (planosContext && message.toLowerCase().includes("mais detalhes")) {
                return "Todos os planos incluem nossa interface principal e suporte. O Básico tem estatísticas descritivas e testes simples. O Profissional adiciona análises multivariadas, diagnósticos avançados e mais formatos de exportação. O Empresarial inclui análises de séries temporais, machine learning, modelagem bayesiana e API para integração. Qual plano mais se adequa às suas necessidades?";
            }
            
            // Verificar se estamos em uma conversa sobre funcionalidades específicas
            const lastBotMessage = lastMessages.filter(msg => msg.sender === "bot").pop();
            if (lastBotMessage && lastBotMessage.message.includes("análise específica")) {
                if (message.toLowerCase().includes("regressão")) {
                    return "Nossa calculadora realiza regressão linear simples e múltipla, com diagnósticos completos (normalidade de resíduos, homocedasticidade, multicolinearidade), detecção de outliers, e gráficos de dispersão, resíduos e previsão. Você também pode salvar o modelo para análises futuras.";
                } else if (message.toLowerCase().includes("anova")) {
                    return "Oferecemos ANOVA de um e dois fatores, com testes post-hoc (Tukey, Scheffé, Bonferroni), verificação de pressupostos, tamanho do efeito e gráficos de médias com intervalos de confiança. Você pode importar dados ou inserir diretamente na interface.";
                } else if (message.toLowerCase().includes("correlação")) {
                    return "Calculamos correlações de Pearson, Spearman e Kendall, com testes de significância, visualização em matrizes coloridas e gráficos de dispersão. A interface permite seleção de variáveis por lote para grandes conjuntos de dados.";
                }
            }
            
            // Verificar se estamos em conversa sobre métodos estatísticos
            if (lastBotMessage && lastBotMessage.message.includes("método estatístico")) {
                if (message.toLowerCase().includes("série") || message.toLowerCase().includes("temporal")) {
                    return "Nossa calculadora inclui análise completa de séries temporais: decomposição, estacionariedade, autocorrelação, modelos ARIMA, sazonalidade, suavização exponencial e previsão. Você pode importar dados em diversos formatos e exportar os resultados em relatórios detalhados.";
                } else if (message.toLowerCase().includes("cluster") || message.toLowerCase().includes("agrupamento")) {
                    return "Oferecemos análise de cluster hierárquica e k-means, com seleção automática de número ideal de clusters, dendrogramas, diagnósticos e perfis de cluster. Ideal para segmentação e classificação não supervisionada.";
                }
            }
            
            // Verificar conversa sobre formatos de dados
            if (lastBotMessage && (lastBotMessage.message.includes("formato") || lastBotMessage.message.includes("dados"))) {
                if (message.toLowerCase().includes("excel")) {
                    return "Nossa calculadora importa arquivos Excel (.xls e .xlsx), mantendo nomes de variáveis, tipos de dados e planilhas múltiplas. Você também pode exportar resultados diretamente para Excel com formatação e gráficos.";
                } else if (message.toLowerCase().includes("spss")) {
                    return "Temos compatibilidade total com arquivos SPSS (.sav), preservando metadados, labels de variáveis e valores missing. Isso facilita a transição para usuários que estão migrando do SPSS para nossa calculadora.";
                }
            }
        }
        
        return null;
    }
    
    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${sender}`;
        
        const senderLabel = sender === "user" ? "Você" : "Bot";
        messageElement.innerHTML = `<div class="message-content"><strong>${senderLabel}:</strong> ${text}</div>`;
        
        // Adicionar botões de ação para mensagens do bot
        if (sender === "bot") {
            const actionButtons = document.createElement("div");
            actionButtons.className = "message-actions";
            
            // Adicionar botões com sugestões baseadas no contexto da mensagem
            if (text.includes("planos") || text.includes("Básico") || text.includes("Profissional")) {
                actionButtons.innerHTML += `
                    <button class="action-btn" data-action="plano-basico">Plano Básico</button>
                    <button class="action-btn" data-action="plano-pro">Plano Profissional</button>
                    <button class="action-btn" data-action="plano-empresarial">Plano Empresarial</button>
                `;
            } else if (text.includes("suporte") || text.includes("problema")) {
                actionButtons.innerHTML += `
                    <button class="action-btn" data-action="suporte-tecnico">Suporte Técnico</button>
                    <button class="action-btn" data-action="falar-atendente">Falar com Especialista</button>
                `;
            } else if (text.includes("método") || text.includes("teste")) {
                actionButtons.innerHTML += `
                    <button class="action-btn" data-action="metodo-regressao">Regressão</button>
                    <button class="action-btn" data-action="metodo-anova">ANOVA</button>
                    <button class="action-btn" data-action="metodo-series">Séries Temporais</button>
                `;
            } else if (text.includes("download") || text.includes("versão") || text.includes("experimentar")) {
                actionButtons.innerHTML += `
                    <button class="action-btn" data-action="versao-teste">Versão de Teste</button>
                    <button class="action-btn" data-action="versao-demo">Demonstração</button>
                `;
            }
            
            // Adicionar botões de ação somente se houver algum
            if (actionButtons.innerHTML !== "") {
                messageElement.appendChild(actionButtons);
            }
        }
        
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

// Registrar a mensagem no histórico da conversa
chatbotState.conversation.push({
    sender: sender,
    message: text,
    timestamp: new Date().toISOString()
});
}

function simulateTyping(text, callback) {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = "<span>.</span><span>.</span><span>.</span>";
    chatbotMessages.appendChild(typingIndicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    chatbotState.isTyping = true;
    
    // Simular um tempo de digitação baseado no tamanho da resposta
    const typingTime = Math.min(1500, 500 + text.length * 10);
    
    setTimeout(() => {
        chatbotMessages.removeChild(typingIndicator);
        chatbotState.isTyping = false;
        callback();
    }, typingTime);
}

// Função para lidar com ações de botões de sugestão
function handleActionButton(action) {
    let message = "";
    
    switch(action) {
        case "plano-basico":
            message = "Gostaria de mais informações sobre o plano Básico";
            break;
        case "plano-pro":
            message = "Me conte mais sobre o plano Profissional";
            break;
        case "plano-avancado":
            message = "Quais são os detalhes do plano Empresarial?";
            break;
        case "func-descritiva":
            message = "Como funciona a estatística descritiva na calculadora?";
            break;
        case "func-testes":
            message = "Quais testes de hipóteses a calculadora realiza?";
            break;
        case "func-avancada":
            message = "Me explique mais sobre as análises avançadas";
            break;
        case "suporte-tecnico":
            message = "Estou com um problema técnico, como posso resolver?";
            break;
        case "falar-atendente":
            message = "Gostaria de falar com um especialista";
            break;
        case "metodo-regressao":
            message = "Como fazer análise de regressão na calculadora?";
            break;
        case "metodo-anova":
            message = "Quais tipos de ANOVA a calculadora suporta?";
            break;
        case "metodo-series":
            message = "Me explique como analisar séries temporais";
            break;
        case "versao-teste":
            message = "Como posso acessar a versão de teste?";
            break;
        case "versao-demo":
            message = "Gostaria de ver uma demonstração";
            break;
        default:
            message = action;
    }
    
    handleUserInput(message);
}

function handleUserInput(message) {
    if (!message || chatbotState.isTyping) return;
    
    // Adicionar mensagem do usuário
    addMessage("user", message);
    
    // Processar a mensagem do usuário
    const botResponse = processUserMessage(message);
    
    // Simular digitação e adicionar resposta do bot
    simulateTyping(botResponse, () => {
        addMessage("bot", botResponse);
    });
    
    // Limpar o campo de entrada
    chatbotInput.value = "";
}

// Exportar conversa para arquivo texto
function exportConversation() {
    if (chatbotState.conversation.length === 0) {
        alert("Não há conversa para exportar.");
        return;
    }
    
    let conversationText = "Conversa com CalcStats Bot\n";
    conversationText += "Data: " + new Date().toLocaleString() + "\n\n";
    
    chatbotState.conversation.forEach(msg => {
        const sender = msg.sender === "user" ? "Você" : "Bot";
        conversationText += `${sender} (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.message}\n\n`;
    });
    
    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversa-statcalc-" + new Date().toISOString().substr(0, 10) + ".txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Limpar conversa
function clearConversation() {
    if (confirm("Tem certeza que deseja limpar toda a conversa?")) {
        chatbotMessages.innerHTML = "";
        chatbotState.conversation = [];
        
        // Mensagem de boas-vindas
        const welcomeMessage = "Olá! Sou o assistente virtual da CalcStats. Como posso ajudar com sua análise estatística hoje?";
        simulateTyping(welcomeMessage, () => {
            addMessage("bot", welcomeMessage);
        });
    }
}

// Registrar feedback do usuário
function registerFeedback(type) {
    const feedback = {
        type: type, // "positive" ou "negative"
        timestamp: new Date().toISOString(),
        conversation: [...chatbotState.conversation]
    };
    
    chatbotState.feedbackData.push(feedback);
    
    // Aqui você poderia enviar o feedback para um servidor
    console.log("Feedback registrado:", feedback);
    
    // Agradecer pelo feedback
    const thankMessage = type === "positive" 
        ? "Obrigado pelo feedback positivo! Fico feliz em poder ajudar."
        : "Obrigado pelo feedback. Lamentamos que a experiência não tenha sido ideal. Estamos trabalhando para melhorar.";
    
    simulateTyping(thankMessage, () => {
        addMessage("bot", thankMessage);
    });
}

// Mudar contexto do chatbot
function changeContext(newContext) {
    chatbotState.context = newContext;
    
    const contextMessages = {
        "geral": "Contexto alterado para Geral. Como posso ajudar?",
        "funcionalidades": "Contexto alterado para Funcionalidades. Que recursos da calculadora estatística você gostaria de conhecer?",
        "planos": "Contexto alterado para Planos. Gostaria de conhecer os detalhes dos nossos planos Básico, Profissional ou Empresarial?",
        "tecnico": "Contexto alterado para Suporte Técnico. Qual problema você está enfrentando com a calculadora estatística?"
    };
    
    simulateTyping(contextMessages[newContext], () => {
        addMessage("bot", contextMessages[newContext]);
    });
}

// Event Listeners
chatbotToggle.addEventListener("click", function() {
    chatbotContainer.classList.toggle("visible");
    if (chatbotContainer.classList.contains("visible") && chatbotState.conversation.length === 0) {
        // Mensagem de boas-vindas
        const welcomeMessage = "Olá! Sou o assistente virtual da CalcStats. Como posso ajudar com sua análise estatística hoje?";
        simulateTyping(welcomeMessage, () => {
            addMessage("bot", welcomeMessage);
        });
    }
});

closeChat.addEventListener("click", function() {
    chatbotContainer.classList.remove("visible");
});

sendMessage.addEventListener("click", function() {
    const message = chatbotInput.value.trim();
    handleUserInput(message);
});

chatbotInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        const message = chatbotInput.value.trim();
        handleUserInput(message);
    }
});

// Event listeners para os botões de controle
document.getElementById("export-chat").addEventListener("click", exportConversation);
document.getElementById("clear-chat").addEventListener("click", clearConversation);
document.getElementById("feedback-positive").addEventListener("click", () => registerFeedback("positive"));
document.getElementById("feedback-negative").addEventListener("click", () => registerFeedback("negative"));
document.getElementById("context-selector").addEventListener("change", function() {
    changeContext(this.value);
});

// Event delegation para botões de ação
chatbotMessages.addEventListener("click", function(e) {
    if (e.target.classList.contains("action-btn")) {
        const action = e.target.getAttribute("data-action");
        handleActionButton(action);
    }
});

// Registrar visita atual
chatbotState.userProfile.lastVisit = new Date().toISOString();

// Armazenar estado do chatbot no localStorage (opcional)
window.addEventListener("beforeunload", function() {
    localStorage.setItem("chatbotState", JSON.stringify(chatbotState));
});

// Recuperar estado anterior (opcional)
const savedState = localStorage.getItem("chatbotState");
if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Atualizar apenas informações de perfil, não a conversa
    chatbotState.userProfile = parsedState.userProfile;
    
    // Verificar se é uma nova sessão
    if (new Date() - new Date(parsedState.userProfile.lastVisit) > 3600000) { // 1 hora
        chatbotState.sessionId = generateSessionId();
    } else {
        chatbotState.sessionId = parsedState.sessionId;
    }
}

});